import { Plugin, WorkspaceLeaf, addIcon } from 'obsidian';
import { MasonryView } from './views/masonry-view';
import { NetworkView } from './views/network-view';
import { SemanticSearchView } from './views/semantic-search-view';
import { EmbeddingService } from './services/embedding';
import { SimilarityService } from './services/similarity';
import { ClusterService } from './services/cluster';
import './styles.css';

export default class SemanticLayoutPlugin extends Plugin {
    private embeddingService: EmbeddingService;
    private similarityService: SimilarityService;
    private clusterService: ClusterService;

    async onload() {
        this.embeddingService = new EmbeddingService();
        this.similarityService = new SimilarityService(this.embeddingService);
        this.clusterService = new ClusterService(this.similarityService);
        
        // Set the app instance in the cluster service
        this.clusterService.setApp(this.app);

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
        
        this.registerView(
            'semantic-search-view',
            (leaf: WorkspaceLeaf) => new SemanticSearchView(leaf, this.similarityService)
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
        
        this.addCommand({
            id: 'open-semantic-search-view',
            name: 'Open Semantic Search',
            callback: () => this.activateView('semantic-search-view'),
        });

        // Add ribbon icons
        this.addRibbonIcon('layout-grid', 'Masonry View', () => {
            this.activateView('masonry-view');
        });

        this.addRibbonIcon('network', 'Network View', () => {
            this.activateView('network-view');
        });
        
        this.addRibbonIcon('search', 'Semantic Search', () => {
            this.activateView('semantic-search-view');
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
        this.app.workspace.detachLeavesOfType('semantic-search-view');
    }
}