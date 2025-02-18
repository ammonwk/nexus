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