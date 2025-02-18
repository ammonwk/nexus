import { ItemView, WorkspaceLeaf, TFile } from 'obsidian';
import { SimilarityService } from '../services/similarity';
import * as d3 from 'd3';

interface NoteNode extends d3.SimulationNodeDatum {
    id: string;
    label: string;
    content: string;
    file: TFile;
    width: number;
    height: number;
}

interface NoteLink {
    source: NoteNode;
    target: NoteNode;
    similarity: number;
}

export class NetworkView extends ItemView {
    private svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    private simulation!: d3.Simulation<NoteNode, undefined>;
    private nodes: NoteNode[] = [];
    private links: NoteLink[] = [];
    private threshold: number = 0.7; // Default threshold
    private sliderContainer!: HTMLElement;

    constructor(
        leaf: WorkspaceLeaf,
        private similarityService: SimilarityService
    ) {
        super(leaf);
    }

    getViewType(): string {
        return 'network-view';
    }

    getDisplayText(): string {
        return 'Network View';
    }

    async onOpen() {
        // Create container for controls
        this.containerEl.empty();
        this.sliderContainer = this.containerEl.createDiv('network-controls');
        this.sliderContainer.innerHTML = `
            <div class="slider-container">
                <label for="similarity-threshold">Similarity Threshold: <span class="threshold-value">0.7</span></label>
                <input type="range" id="similarity-threshold" min="0" max="1" step="0.05" value="0.7">
            </div>
        `;

        // Add slider event listener
        const slider = this.sliderContainer.querySelector('#similarity-threshold') as HTMLInputElement;
        const thresholdValue = this.sliderContainer.querySelector('.threshold-value') as HTMLElement;
        
        slider.addEventListener('input', async (e) => {
            const newThreshold = parseFloat((e.target as HTMLInputElement).value);
            this.threshold = newThreshold;
            thresholdValue.textContent = newThreshold.toString();
            await this.updateLinks();
        });

        this.initializeGraph();
        await this.renderNetwork();
    }

    private initializeGraph() {
        this.svg = d3.select(this.containerEl)
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('class', 'network-view');

        // Add zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                this.svg.selectAll('g.network-container')
                    .attr('transform', event.transform);
            });

        this.svg.call(zoom);
    }

    private async renderNetwork() {
        const files = this.app.vault.getMarkdownFiles();
        
        // Create nodes with size information
        this.nodes = await Promise.all(files.map(async file => {
            const content = await this.app.vault.read(file);
            const lineHeight = 15; // Adjust this value based on your font size and spacing
            const width = 200; // Fixed width for now
            const estimatedLines = Math.ceil(content.length / (width / 8)); // Rough estimate assuming 8 pixels per character
            const dynamicHeight = lineHeight * estimatedLines + 20; // Set minimum height of 50px

            return {
                id: file.path,
                label: file.basename,
                content: content.length > 350 ? content.substring(0, 350) + "..." : content,
                file: file,
                width: width,
                height: dynamicHeight,
                x: Math.random() * this.containerEl.clientWidth,
                y: Math.random() * this.containerEl.clientHeight,
                index: undefined
            };
        }));

        this.links = await this.calculateLinks(this.nodes);
        
        // Create a container for the network
        const networkContainer = this.svg.append('g')
            .attr('class', 'network-container');

        // Draw links first so they appear behind nodes
        // In network-view.ts, modify the link creation:
        const link = networkContainer.append('g')
            .selectAll('line')
            .data(this.links)
            .join('line')
            .attr('class', 'link')
            .attr('stroke', 'var(--background-modifier-border)')
            .attr('stroke-width', d => Math.sqrt(d.similarity) * 2)
            // Add initial positions to prevent undefined coordinates
            .attr('x1', d => (d.source as NoteNode).x || 0)
            .attr('y1', d => (d.source as NoteNode).y || 0)
            .attr('x2', d => (d.target as NoteNode).x || 0)
            .attr('y2', d => (d.target as NoteNode).y || 0);

        // Create node containers
        const node = networkContainer.append('g')
            .selectAll('g')
            .data(this.nodes)
            .join('g')
            .attr('class', 'note-container')
            .call(this.drag());

        // Add note boxes
        node.append('rect')
            .attr('class', 'note-box')
            .attr('width', d => d.width)
            .attr('height', d => d.height)
            .attr('rx', 5)
            .attr('ry', 5);

        // Add note titles
        node.append('text')
            .attr('class', 'note-title')
            .attr('x', 10)
            .attr('y', 20)
            .text(d => d.label);

        // Add note content
        node.append('text')
            .attr('class', 'note-content')
            .attr('x', 10)
            .attr('y', 40)
            .text(d => d.content)
            .call(this.wrapText, 180); // Wrap text to fit in box

        // Initialize force simulation
        this.simulation = d3.forceSimulation<NoteNode>(this.nodes)
            .force('link', d3.forceLink<NoteNode, NoteLink>(this.links)
                .id(d => d.id)
                .distance(300)) // Increased distance to account for box size
            .force('charge', d3.forceManyBody<NoteNode>().strength(-500))
            .force('center', d3.forceCenter(
                this.containerEl.clientWidth / 2,
                this.containerEl.clientHeight / 2
            ))
            .force('collision', d3.forceCollide<NoteNode>().radius(d => Math.sqrt(d.width * d.width + d.height * d.height) / 2));

        // Update positions on simulation tick
        this.simulation.on('tick', () => {
            link
                .attr('x1', d => (d.source as NoteNode).x!)
                .attr('y1', d => (d.source as NoteNode).y!)
                .attr('x2', d => (d.target as NoteNode).x!)
                .attr('y2', d => (d.target as NoteNode).y!);

            node.attr('transform', d => `translate(${d.x! - d.width/2},${d.y! - d.height/2})`);
        });
    }

    private async updateLinks() {
        // Recalculate links with new threshold
        this.links = await this.calculateLinks(this.nodes);

        // Update visualization
        const networkContainer = this.svg.select('.network-container');
        
        // Update links
        const link = networkContainer.selectAll('line')
            .data(this.links);
            
        // Remove old links
        link.exit().remove();
        
        // Add new links
        const linkEnter = link.enter()
            .append('line')
            .attr('class', 'link')
            .attr('stroke', 'var(--background-modifier-border)')
            .attr('stroke-width', d => Math.sqrt(d.similarity) * 2);

        // Update simulation
        this.simulation
            .force('link', d3.forceLink<NoteNode, NoteLink>(this.links)
                .id(d => d.id)
                .distance(300));

        // Restart simulation
        this.simulation.alpha(1).restart();
    }

    // Helper function to wrap text
    private wrapText(text: d3.Selection<SVGTextElement, any, any, any>, width: number) {
        text.each(function() {
            const text = d3.select(this);
            const words = text.text().split(/\s+/).reverse();
            const lineHeight = 1.1;
            const y = text.attr("y");
            const dy = parseFloat(text.attr("dy") || "0");
            
            let line: string[] = [];
            let lineNumber = 0;
            let tspan = text.text(null).append("tspan")
                .attr("x", text.attr("x"))
                .attr("y", y)
                .attr("dy", dy + "em");
            
            let word: string | undefined;
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if ((tspan.node()?.getComputedTextLength() ?? 0) > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan")
                        .attr("x", text.attr("x"))
                        .attr("y", y)
                        .attr("dy", ++lineNumber * lineHeight + dy + "em")
                        .text(word);
                }
            }
        });
    }

    private async calculateLinks(nodes: NoteNode[]): Promise<NoteLink[]> {
        const links: NoteLink[] = [];
        
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const similarity = await this.similarityService
                    .calculateSimilarity(nodes[i].content, nodes[j].content);
                
                if (similarity > this.threshold) {
                    links.push({
                        source: nodes[i],
                        target: nodes[j],
                        similarity: similarity
                    });
                }
            }
        }
        return links;
    }

    private drag() {
        return d3.drag<SVGGElement, NoteNode>()
            .on('start', (event, d) => {
                if (!event.active) this.simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            })
            .on('drag', (event, d) => {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on('end', (event, d) => {
                if (!event.active) this.simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            });
    }

    async onClose() {
        if (this.simulation) {
            this.simulation.stop();
        }
    }
}