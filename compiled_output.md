# Directory Structure

```
├── README.md
├── compiled_output.md
├── main.css
├── main.ts
├── services
│   ├── embedding.ts
│   └── similarity.ts
├── styles.css
└── views
    ├── masonry-view.ts
    └── network-view.ts
```

# Source Code

## README.md

```markdown
# Obsidian Semantic Layout Plugin

A plugin for Obsidian that provides semantic visualization of your notes using machine learning-powered layouts.

## Features

- Masonry grid layout for visual note organization
- Semantic network view showing note relationships
- Automatic discovery of note relationships using TensorFlow.js
- Real-time updates as notes change
- Responsive and performant with large note collections

## Installation

1. Download the latest release from the releases page
2. Extract the zip file in your Obsidian plugins folder
3. Enable the plugin in Obsidian settings

## Usage

### Masonry View
- Click the grid icon in the ribbon to open
- Notes are automatically arranged in a responsive grid
- Search and filter notes using the search bar
- Click notes to edit or preview

### Network View
- Click the graph icon in the ribbon to open
- Notes are connected based on semantic similarity
- Zoom and pan to explore relationships
- Click nodes to view note content

## Development

1. Clone this repository
2. Run `npm install`
3. Run `npm run dev` to start development build
4. Copy built files to your Obsidian plugins folder

## License

MIT License

```

## compiled_output.md

```markdown

```

## main.css

```css
/* styles.css */
.workspace-leaf-content[data-type=masonry-view] {
  overflow-y: auto;
}
.masonry-grid {
  width: 100%;
  height: 100%;
  padding: 10px;
  position: relative;
}
.note-card {
  position: absolute;
  width: 200px;
  margin-bottom: 10px;
  padding: 10px;
  background-color: var(--background-primary);
  border: 1px solid var(--background-modifier-border);
  border-radius: 4px;
}
.note-card h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
}
.note-card .preview {
  font-size: 12px;
  color: var(--text-muted);
}
.network-view svg {
  width: 100%;
  height: 100%;
}
.network-view .node circle {
  fill: var(--interactive-accent);
}
.network-view .node text {
  font-size: 12px;
  fill: var(--text-normal);
}
.network-view .link {
  stroke: var(--background-modifier-border);
}
.network-view .note-box {
  fill: var(--background-primary);
  stroke: var(--background-modifier-border);
  stroke-width: 1px;
}
.network-view .note-title {
  font-weight: bold;
  font-size: 14px;
  fill: var(--text-normal);
}
.network-view .note-content {
  font-size: 12px;
  fill: var(--text-muted);
}
.network-view .link {
  stroke-opacity: 0.6;
}
.network-controls {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1000;
  background: var(--background-primary);
  padding: 10px;
  border-radius: 4px;
  border: 1px solid var(--background-modifier-border);
}
.slider-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.slider-container label {
  font-size: 12px;
  color: var(--text-muted);
}
.slider-container input[type=range] {
  width: 200px;
}
.threshold-value {
  font-weight: bold;
}
/*# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3R5bGVzLmNzcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLyogTWFzb25yeSBWaWV3IFN0eWxlcyAqL1xyXG4ud29ya3NwYWNlLWxlYWYtY29udGVudFtkYXRhLXR5cGU9XCJtYXNvbnJ5LXZpZXdcIl0ge1xyXG4gICAgb3ZlcmZsb3cteTogYXV0bzsgIC8qIEVuYWJsZSBzY3JvbGxpbmcgKi9cclxufVxyXG5cclxuLm1hc29ucnktZ3JpZCB7XHJcbiAgICB3aWR0aDogMTAwJTtcclxuICAgIGhlaWdodDogMTAwJTtcclxuICAgIHBhZGRpbmc6IDEwcHg7XHJcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7IC8qIEFkZCB0aGlzICovXHJcbn1cclxuXHJcbi5ub3RlLWNhcmQge1xyXG4gICAgcG9zaXRpb246IGFic29sdXRlOyAvKiBBZGQgdGhpcyAqL1xyXG4gICAgd2lkdGg6IDIwMHB4O1xyXG4gICAgbWFyZ2luLWJvdHRvbTogMTBweDtcclxuICAgIHBhZGRpbmc6IDEwcHg7XHJcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1iYWNrZ3JvdW5kLXByaW1hcnkpO1xyXG4gICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tYmFja2dyb3VuZC1tb2RpZmllci1ib3JkZXIpO1xyXG4gICAgYm9yZGVyLXJhZGl1czogNHB4O1xyXG59XHJcblxyXG4ubm90ZS1jYXJkIGgzIHtcclxuICAgIG1hcmdpbjogMCAwIDEwcHggMDtcclxuICAgIGZvbnQtc2l6ZTogMTZweDtcclxufVxyXG5cclxuLm5vdGUtY2FyZCAucHJldmlldyB7XHJcbiAgICBmb250LXNpemU6IDEycHg7XHJcbiAgICBjb2xvcjogdmFyKC0tdGV4dC1tdXRlZCk7XHJcbn1cclxuXHJcbi8qIE5ldHdvcmsgVmlldyBTdHlsZXMgKi9cclxuLm5ldHdvcmstdmlldyBzdmcge1xyXG4gICAgd2lkdGg6IDEwMCU7XHJcbiAgICBoZWlnaHQ6IDEwMCU7XHJcbn1cclxuXHJcbi5uZXR3b3JrLXZpZXcgLm5vZGUgY2lyY2xlIHtcclxuICAgIGZpbGw6IHZhcigtLWludGVyYWN0aXZlLWFjY2VudCk7XHJcbn1cclxuXHJcbi5uZXR3b3JrLXZpZXcgLm5vZGUgdGV4dCB7XHJcbiAgICBmb250LXNpemU6IDEycHg7XHJcbiAgICBmaWxsOiB2YXIoLS10ZXh0LW5vcm1hbCk7XHJcbn1cclxuXHJcbi5uZXR3b3JrLXZpZXcgLmxpbmsge1xyXG4gICAgc3Ryb2tlOiB2YXIoLS1iYWNrZ3JvdW5kLW1vZGlmaWVyLWJvcmRlcik7XHJcbn1cclxuXHJcbi5uZXR3b3JrLXZpZXcgLm5vdGUtYm94IHtcclxuICAgIGZpbGw6IHZhcigtLWJhY2tncm91bmQtcHJpbWFyeSk7XHJcbiAgICBzdHJva2U6IHZhcigtLWJhY2tncm91bmQtbW9kaWZpZXItYm9yZGVyKTtcclxuICAgIHN0cm9rZS13aWR0aDogMXB4O1xyXG59XHJcblxyXG4ubmV0d29yay12aWV3IC5ub3RlLXRpdGxlIHtcclxuICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xyXG4gICAgZm9udC1zaXplOiAxNHB4O1xyXG4gICAgZmlsbDogdmFyKC0tdGV4dC1ub3JtYWwpO1xyXG59XHJcblxyXG4ubmV0d29yay12aWV3IC5ub3RlLWNvbnRlbnQge1xyXG4gICAgZm9udC1zaXplOiAxMnB4O1xyXG4gICAgZmlsbDogdmFyKC0tdGV4dC1tdXRlZCk7XHJcbn1cclxuXHJcbi5uZXR3b3JrLXZpZXcgLmxpbmsge1xyXG4gICAgc3Ryb2tlLW9wYWNpdHk6IDAuNjtcclxufVxyXG5cclxuLm5ldHdvcmstY29udHJvbHMge1xyXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xyXG4gICAgdG9wOiAxMHB4O1xyXG4gICAgbGVmdDogMTBweDtcclxuICAgIHotaW5kZXg6IDEwMDA7XHJcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1iYWNrZ3JvdW5kLXByaW1hcnkpO1xyXG4gICAgcGFkZGluZzogMTBweDtcclxuICAgIGJvcmRlci1yYWRpdXM6IDRweDtcclxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWJhY2tncm91bmQtbW9kaWZpZXItYm9yZGVyKTtcclxufVxyXG5cclxuLnNsaWRlci1jb250YWluZXIge1xyXG4gICAgZGlzcGxheTogZmxleDtcclxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XHJcbiAgICBnYXA6IDVweDtcclxufVxyXG5cclxuLnNsaWRlci1jb250YWluZXIgbGFiZWwge1xyXG4gICAgZm9udC1zaXplOiAxMnB4O1xyXG4gICAgY29sb3I6IHZhcigtLXRleHQtbXV0ZWQpO1xyXG59XHJcblxyXG4uc2xpZGVyLWNvbnRhaW5lciBpbnB1dFt0eXBlPVwicmFuZ2VcIl0ge1xyXG4gICAgd2lkdGg6IDIwMHB4O1xyXG59XHJcblxyXG4udGhyZXNob2xkLXZhbHVlIHtcclxuICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xyXG59Il0sCiAgIm1hcHBpbmdzIjogIjtBQUNBO0FBQ0k7QUFBQTtBQUdKO0FBQ0k7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUdKO0FBQ0k7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUdKO0FBQ0k7QUFDQTtBQUFBO0FBR0o7QUFDSTtBQUNBO0FBQUE7QUFJSjtBQUNJO0FBQ0E7QUFBQTtBQUdKO0FBQ0k7QUFBQTtBQUdKO0FBQ0k7QUFDQTtBQUFBO0FBR0o7QUFDSTtBQUFBO0FBR0o7QUFDSTtBQUNBO0FBQ0E7QUFBQTtBQUdKO0FBQ0k7QUFDQTtBQUNBO0FBQUE7QUFHSjtBQUNJO0FBQ0E7QUFBQTtBQUdKO0FBQ0k7QUFBQTtBQUdKO0FBQ0k7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBR0o7QUFDSTtBQUNBO0FBQ0E7QUFBQTtBQUdKO0FBQ0k7QUFDQTtBQUFBO0FBR0o7QUFDSTtBQUFBO0FBR0o7QUFDSTtBQUFBOyIsCiAgIm5hbWVzIjogW10KfQo= */

```

## main.ts

```typescript
import { Plugin, WorkspaceLeaf, addIcon } from 'obsidian';
import { MasonryView } from './views/masonry-view';
import { NetworkView } from './views/network-view';
import { EmbeddingService } from './services/embedding';
import { SimilarityService } from './services/similarity';
import './styles.css';

export default class SemanticLayoutPlugin extends Plugin {
    private embeddingService: EmbeddingService;
    private similarityService: SimilarityService;

    async onload() {
        this.embeddingService = new EmbeddingService();
        this.similarityService = new SimilarityService(this.embeddingService);

        try {
            await this.embeddingService.initialize();
            console.log('TensorFlow backend and model initialized successfully');
        } catch (error) {
            console.error('Failed to initialize TensorFlow:', error);
        }

        // Register views
        this.registerView(
            'masonry-view',
            (leaf: WorkspaceLeaf) => new MasonryView(leaf, this.similarityService)
        );

        this.registerView(
            'network-view',
            (leaf: WorkspaceLeaf) => new NetworkView(leaf, this.similarityService)
        );

        // Add commands
        this.addCommand({
            id: 'open-masonry-view',
            name: 'Open Masonry View',
            callback: () => this.activateView('masonry-view'),
        });

        this.addCommand({
            id: 'open-network-view',
            name: 'Open Network View',
            callback: () => this.activateView('network-view'),
        });

        // Add ribbon icons
        this.addRibbonIcon('layout-grid', 'Masonry View', () => {
            this.activateView('masonry-view');
        });

        this.addRibbonIcon('network', 'Network View', () => {
            this.activateView('network-view');
        });
    }

    async activateView(type: string) {
        const { workspace } = this.app;
        
        // Deactivate existing view if it exists
        workspace.detachLeavesOfType(type);

        // Create and activate new leaf as a tab
        const leaf = workspace.getLeaf('tab'); // This creates a new tab instead of using the sidebar
        
        if (leaf) {
            await leaf.setViewState({
                type,
                active: true,
            });
            workspace.revealLeaf(leaf);
        }
    }

    onunload() {
        this.app.workspace.detachLeavesOfType('masonry-view');
        this.app.workspace.detachLeavesOfType('network-view');
    }
}
```

## styles.css

```css
/* Masonry View Styles */
.workspace-leaf-content[data-type="masonry-view"] {
    overflow-y: auto;  /* Enable scrolling */
}

.masonry-grid {
    width: 100%;
    height: 100%;
    padding: 10px;
    position: relative; /* Add this */
}

.note-card {
    position: absolute; /* Add this */
    width: 200px;
    margin-bottom: 10px;
    padding: 10px;
    background-color: var(--background-primary);
    border: 1px solid var(--background-modifier-border);
    border-radius: 4px;
}

.note-card h3 {
    margin: 0 0 10px 0;
    font-size: 16px;
}

.note-card .preview {
    font-size: 12px;
    color: var(--text-muted);
}

/* Network View Styles */
.network-view svg {
    width: 100%;
    height: 100%;
}

.network-view .node circle {
    fill: var(--interactive-accent);
}

.network-view .node text {
    font-size: 12px;
    fill: var(--text-normal);
}

.network-view .link {
    stroke: var(--background-modifier-border);
}

.network-view .note-box {
    fill: var(--background-primary);
    stroke: var(--background-modifier-border);
    stroke-width: 1px;
}

.network-view .note-title {
    font-weight: bold;
    font-size: 14px;
    fill: var(--text-normal);
}

.network-view .note-content {
    font-size: 12px;
    fill: var(--text-muted);
}

.network-view .link {
    stroke-opacity: 0.6;
}

.network-controls {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 1000;
    background: var(--background-primary);
    padding: 10px;
    border-radius: 4px;
    border: 1px solid var(--background-modifier-border);
}

.slider-container {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.slider-container label {
    font-size: 12px;
    color: var(--text-muted);
}

.slider-container input[type="range"] {
    width: 200px;
}

.threshold-value {
    font-weight: bold;
}
```

## services\embedding.ts

```typescript
import * as tf from '@tensorflow/tfjs';
import * as USE from '@tensorflow-models/universal-sentence-encoder';

export class EmbeddingService {
    private model: any;
    
    async initialize() {
        // Initialize TensorFlow backend first
        await tf.ready();
        await tf.setBackend('cpu');  // or 'webgl' if you prefer GPU acceleration
        
        // Then load the model
        this.model = await USE.load();
    }

    async embedText(text: string): Promise<Float32Array> {
        const embeddings = await this.model.embed([text]);
        return embeddings.dataSync();
    }

    async embedBatch(texts: string[]): Promise<Float32Array[]> {
        const embeddings = await this.model.embed(texts);
        return Array.from(embeddings.dataSync());
    }
}
```

## services\similarity.ts

```typescript
import { EmbeddingService } from './embedding';

export class SimilarityService {
    private embeddings: Map<string, Float32Array> = new Map();
    
    constructor(private embeddingService: EmbeddingService) {}

    async calculateSimilarity(text1: string, text2: string): Promise<number> {
        const [embedding1, embedding2] = await Promise.all([
            this.getEmbedding(text1),
            this.getEmbedding(text2)
        ]);
        
        return this.cosineSimilarity(embedding1, embedding2);
    }

    private async getEmbedding(text: string): Promise<Float32Array> {
        if (!this.embeddings.has(text)) {
            const embedding = await this.embeddingService.embedText(text);
            this.embeddings.set(text, embedding);
        }
        return this.embeddings.get(text)!;
    }

    private cosineSimilarity(a: Float32Array, b: Float32Array): number {
        const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
        const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
        const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
        return dotProduct / (magnitudeA * magnitudeB);
    }
}

```

## views\masonry-view.ts

```typescript
import { ItemView, WorkspaceLeaf } from 'obsidian';
import { SimilarityService } from '../services/similarity';
const Masonry = require('masonry-layout');

export class MasonryView extends ItemView {
    private masonry: typeof Masonry | undefined;
    private container: HTMLElement;

    constructor(
        leaf: WorkspaceLeaf,
        private similarityService: SimilarityService
    ) {
        super(leaf);
    }

    getViewType(): string {
        return 'masonry-view';
    }

    getDisplayText(): string {
        return 'Masonry View';
    }

    async onOpen() {
        // Create container with proper class
        this.containerEl.empty();
        this.container = this.containerEl.createDiv({
            cls: 'masonry-grid'
        });
        
        // First render all notes
        await this.renderNotes();
        
        // Then initialize masonry
        try {
            this.masonry = new Masonry(this.container, {
                itemSelector: '.note-card',
                columnWidth: 200,
                gutter: 10,
                percentPosition: true,
                transitionDuration: 0,
                initLayout: true, // Make sure initial layout happens
                fitWidth: true // Center the grid in the container
            });
            
            // Force a layout update
            this.masonry.layout();
            
        } catch (error) {
            console.error('Failed to initialize Masonry:', error);
        }
    }

    private async renderNotes() {
        try {
            const files = this.app.vault.getMarkdownFiles();
            
            for (const file of files) {
                const content = await this.app.vault.read(file);
                const card = this.createNoteCard(file.basename, content);
                this.container.appendChild(card);
            }
        } catch (error) {
            console.error('Failed to render notes:', error);
        }
    }    
 
    private createNoteCard(title: string, content: string): HTMLElement {
        const card = document.createElement('div');
        card.className = 'note-card';
        
        // Add some minimum dimensions to ensure cards are visible
        card.style.minHeight = '100px';
        card.style.minWidth = '200px';
        
        card.innerHTML = `
            <h3>${title}</h3>
            <div class="preview">${content.substring(0, 400)}...</div>
        `;
        return card;
    }

    async onClose() {
        if (this.masonry) {
            // Clean up masonry instance
            this.masonry.destroy();
        }
    }
}
```

## views\network-view.ts

```typescript
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
```

