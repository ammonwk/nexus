import { ItemView, WorkspaceLeaf, TFile } from 'obsidian';
import { SimilarityService } from '../services/similarity';
import { ClusterService } from '../services/cluster';

export class SemanticSearchView extends ItemView {
    private container: HTMLElement;
    private searchContainer: HTMLElement;
    private resultsContainer: HTMLElement;
    private clusterContainer: HTMLElement;
    private clusterSlider: HTMLInputElement;
    private clusterService: ClusterService;
    
    constructor(
        leaf: WorkspaceLeaf, 
        private similarityService: SimilarityService
    ) {
        super(leaf);
        this.clusterService = new ClusterService(similarityService);
    }
    
    onload() {
        super.onload();
        // Set the app instance for the cluster service
        this.clusterService.setApp(this.app);
    }

    getViewType(): string {
        return 'semantic-search-view';
    }

    getDisplayText(): string {
        return 'Semantic Search';
    }

    async onOpen() {
        this.containerEl.empty();
        this.container = this.containerEl.createDiv({
            cls: 'semantic-search-container'
        });
        
        // Create search section
        this.searchContainer = this.container.createDiv({
            cls: 'search-section'
        });
        
        this.createSearchInterface();
        
        // Create results section
        this.resultsContainer = this.container.createDiv({
            cls: 'search-results'
        });
        
        // Create clusters section
        this.clusterContainer = this.container.createDiv({
            cls: 'cluster-section'
        });
        
        this.createClusterInterface();
        
        // Initialize with default clusters
        await this.generateClusters();
    }
    
    // Implement a debounce function for efficient searching
    private debounce(func: Function, wait: number): (...args: any[]) => void {
        let timeout: NodeJS.Timeout;
        return (...args: any[]) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }
    
    private createSearchInterface() {
        const searchHeader = this.searchContainer.createEl('h2', {
            text: 'Semantic Search'
        });
        
        const searchForm = this.searchContainer.createEl('div', {
            cls: 'search-form'
        });
        
        const searchInput = searchForm.createEl('input', {
            type: 'text',
            placeholder: 'Enter search query...',
            cls: 'search-input'
        });
        
        // Create debounced search function (0.1 second delay)
        const debouncedSearch = this.debounce(async (query: string) => {
            if (query.length === 0) return;
            // Always show top 20 results by setting a very low threshold
            await this.performSearch(query, 0.0, 20);
        }, 100);
        
        // Trigger search on any input change with debounce
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim();
            debouncedSearch(query);
        });
    }
    
    private createClusterInterface() {
        const clusterHeader = this.clusterContainer.createEl('h2', {
            text: 'Semantic Clusters'
        });
        
        const clusterControls = this.clusterContainer.createEl('div', {
            cls: 'cluster-controls'
        });
        
        const clusterCountLabel = clusterControls.createEl('label', {
            text: 'Number of clusters: ',
            attr: {
                for: 'cluster-count'
            }
        });
        
        const clusterCountValue = clusterCountLabel.createSpan({
            cls: 'cluster-count-value',
            text: '5'
        });
        
        this.clusterSlider = clusterControls.createEl('input', {
            type: 'range',
            cls: 'cluster-count',
            attr: {
                id: 'cluster-count',
                min: '2',
                max: '10',
                step: '1',
                value: '5'
            }
        });
        
        this.clusterSlider.addEventListener('input', (e) => {
            const value = (e.target as HTMLInputElement).value;
            clusterCountValue.textContent = value;
        });
        
        const generateButton = clusterControls.createEl('button', {
            text: 'Generate Clusters',
            cls: 'generate-button'
        });
        
        // Handle generate button click
        generateButton.addEventListener('click', async () => {
            const count = parseInt(this.clusterSlider.value);
            await this.generateClusters(count);
        });
        
        // Add container for cluster visualization
        const clusterViz = this.clusterContainer.createEl('div', {
            cls: 'cluster-visualization'
        });
    }
    
    private async performSearch(query: string, threshold: number = 0.0, maxResults: number = 20) {
        this.resultsContainer.empty();
        
        const loadingElem = this.resultsContainer.createEl('div', {
            text: 'Searching...',
            cls: 'loading-indicator'
        });
        
        try {
            const files = this.app.vault.getMarkdownFiles();
            let results = await this.clusterService.searchSemantically(query, files, threshold);
            // Limit to top maxResults results
            results = results.slice(0, maxResults);
            
            loadingElem.remove();
            
            // Create header with result count
            this.resultsContainer.createEl('h3', {
                text: `Results (${results.length})`,
                cls: 'results-header'
            });
            
            if (results.length === 0) {
                this.resultsContainer.createEl('p', {
                    text: 'No matching results found. Try lowering the similarity threshold or using different search terms.',
                    cls: 'no-results'
                });
                return;
            }
            
            // Create results list
            const resultsList = this.resultsContainer.createEl('div', {
                cls: 'results-list'
            });
            
            for (const result of results) {
                const resultItem = resultsList.createEl('div', {
                    cls: 'result-item'
                });
                
                // Add visual similarity indicator
                resultItem.createEl('div', {
                    cls: 'similarity-indicator',
                    attr: {
                        style: `width: ${result.similarity * 100}%`
                    }
                });
                
                const resultHeader = resultItem.createEl('div', {
                    cls: 'result-header'
                });
                
                // Create file link
                const fileLink = resultHeader.createEl('a', {
                    text: result.file.basename,
                    cls: 'file-link'
                });
                
                fileLink.addEventListener('click', () => {
                    // Open the file in a new pane
                    this.app.workspace.getLeaf(false).openFile(result.file);
                });
                
                // Show similarity score
                resultHeader.createEl('span', {
                    text: `${(result.similarity * 100).toFixed(1)}%`,
                    cls: 'similarity-score'
                });
                
                // Get cluster tag if available
                const cluster = this.clusterService.getClusterForNote(result.file.path);
                if (cluster) {
                    const clusterTag = resultItem.createEl('div', {
                        cls: 'cluster-tag',
                        attr: {
                            style: `background-color: ${cluster.color}`
                        },
                        text: cluster.label
                    });
                }
                
                // Add file preview
                try {
                    const content = await this.app.vault.read(result.file);
                    const preview = content.substring(0, 200) + (content.length > 200 ? '...' : '');
                    
                    resultItem.createEl('div', {
                        text: preview,
                        cls: 'result-preview'
                    });
                } catch (error) {
                    console.error(`Failed to read file content: ${error}`);
                }
            }
        } catch (error) {
            loadingElem.remove();
            this.resultsContainer.createEl('p', {
                text: `Error performing search: ${error.message}`,
                cls: 'error-message'
            });
        }
    }
    
    private async generateClusters(clusterCount: number = 5) {
        // Clear existing clusters visualization
        const clusterViz = this.clusterContainer.querySelector('.cluster-visualization');
        if (clusterViz) {
            clusterViz.empty();
            
            const loadingElem = clusterViz.createEl('div', {
                text: 'Generating clusters...',
                cls: 'loading-indicator'
            });
            
            try {
                const files = this.app.vault.getMarkdownFiles();
                const clusters = await this.clusterService.generateClusters(files, clusterCount);
                
                loadingElem.remove();
                
                // Create visualization for each cluster
                for (const cluster of clusters.values()) {
                    const clusterElem = clusterViz.createEl('div', {
                        cls: 'cluster-group'
                    });
                    
                    // Cluster header with color indicator
                    const clusterHeader = clusterElem.createEl('div', {
                        cls: 'cluster-header'
                    });
                    
                    clusterHeader.createEl('div', {
                        cls: 'cluster-color',
                        attr: {
                            style: `background-color: ${cluster.color}`
                        }
                    });
                    
                    const clusterName = clusterHeader.createEl('h4', {
                        text: cluster.label,
                        cls: 'cluster-name'
                    });
                    
                    // Add a tooltip with explanation
                    const tooltipText = cluster.keyTerms && cluster.keyTerms.length > 0 ?
                        `Common themes: ${cluster.keyTerms.join(', ')}` :
                        `This cluster contains notes with similar content related to "${cluster.label}"`;
                    clusterName.setAttribute('title', tooltipText);
                    
                    // If we have key terms, show them as tags
                    if (cluster.keyTerms && cluster.keyTerms.length > 0) {
                        const tagContainer = clusterElem.createEl('div', {
                            cls: 'cluster-tags'
                        });
                        
                        // Show up to 5 key terms as tags
                        for (const term of cluster.keyTerms.slice(0, 5)) {
                            tagContainer.createEl('span', {
                                text: term,
                                cls: 'cluster-term-tag'
                            });
                        }
                    }
                    
                    clusterHeader.createEl('span', {
                        text: `${cluster.noteIds.length} notes`,
                        cls: 'note-count'
                    });
                    
                    // Create list of files in cluster
                    if (cluster.noteIds.length > 0) {
                        const fileList = clusterElem.createEl('ul', {
                            cls: 'cluster-files'
                        });
                        
                        for (const noteId of cluster.noteIds) {
                            const file = files.find(f => f.path === noteId);
                            if (file) {
                                const fileItem = fileList.createEl('li');
                                
                                const fileLink = fileItem.createEl('a', {
                                    text: file.basename,
                                    cls: 'cluster-file-link'
                                });
                                
                                fileLink.addEventListener('click', () => {
                                    // Open the file in a new pane
                                    this.app.workspace.getLeaf(false).openFile(file);
                                });
                            }
                        }
                    } else {
                        clusterElem.createEl('p', {
                            text: 'No files in this cluster',
                            cls: 'empty-cluster'
                        });
                    }
                }
            } catch (error) {
                loadingElem.remove();
                clusterViz.createEl('p', {
                    text: `Error generating clusters: ${error.message}`,
                    cls: 'error-message'
                });
            }
        }
    }

    async onClose() {
        // Clean up resources if needed
    }
}