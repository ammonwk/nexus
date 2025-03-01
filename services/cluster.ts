import { SimilarityService } from './similarity';
import { TFile, App } from 'obsidian';

interface ClusterData {
    id: string;
    label: string;
    noteIds: string[];
    centroid: Float32Array;
    color: string;
    keyTerms?: string[]; // Store key terms that formed this cluster's label
}

export class ClusterService {
    private clusters: Map<string, ClusterData> = new Map();
    private app: App;
    private clusterColors = [
        '#4285F4', '#EA4335', '#FBBC05', '#34A853', // Google colors
        '#00ACC1', '#AB47BC', '#FF7043', '#5C6BC0', // Material design
        '#26A69A', '#EC407A', '#7E57C2', '#66BB6A'  // More MD colors
    ];
    
    constructor(private similarityService: SimilarityService) {
        // The app will be set by the plugin
    }
    
    /**
     * Set the Obsidian app instance
     * This needs to be called before using any vault operations
     */
    setApp(app: App) {
        this.app = app;
    }

    async generateClusters(files: TFile[], numClusters: number = 5): Promise<Map<string, ClusterData>> {
        if (files.length === 0) return this.clusters;
        
        // Clear existing clusters
        this.clusters.clear();
        
        // Extract content from files
        const fileContents = await Promise.all(
            files.map(async file => {
                return {
                    file,
                    content: await this.app.vault.read(file)
                };
            })
        );
        
        // Implement K-means clustering algorithm using semantic similarity
        // This is a simplified version - could be enhanced with more sophisticated algorithms
        
        // 1. Initialize random centroids by selecting random notes
        const centroids: { id: string, content: string }[] = [];
        const selectedIndices = new Set<number>();
        
        while (centroids.length < numClusters && centroids.length < fileContents.length) {
            // Get a random index not already selected
            let randomIndex: number;
            do {
                randomIndex = Math.floor(Math.random() * fileContents.length);
            } while (selectedIndices.has(randomIndex));
            
            selectedIndices.add(randomIndex);
            centroids.push({
                id: `cluster-${centroids.length + 1}`,
                content: fileContents[randomIndex].content
            });
        }
        
        // Initialize clusters with the random centroids
        for (let i = 0; i < centroids.length; i++) {
            this.clusters.set(centroids[i].id, {
                id: centroids[i].id,
                label: `Cluster ${i + 1}`,
                noteIds: [],
                centroid: await this.similarityService.getEmbedding(centroids[i].content),
                color: this.clusterColors[i % this.clusterColors.length]
            });
        }
        
        // 2. Run K-means iterations
        const maxIterations = 10;
        for (let iteration = 0; iteration < maxIterations; iteration++) {
            // Reset cluster assignments
            for (const cluster of this.clusters.values()) {
                cluster.noteIds = [];
            }
            
            // Assign each note to nearest centroid
            for (const {file, content} of fileContents) {
                const embedding = await this.similarityService.getEmbedding(content);
                
                // Find closest centroid
                let bestClusterId = '';
                let bestSimilarity = -1;
                
                for (const cluster of this.clusters.values()) {
                    const similarity = this.cosineSimilarity(embedding, cluster.centroid);
                    if (similarity > bestSimilarity) {
                        bestSimilarity = similarity;
                        bestClusterId = cluster.id;
                    }
                }
                
                // Add note to best cluster
                if (bestClusterId) {
                    const cluster = this.clusters.get(bestClusterId);
                    if (cluster) {
                        cluster.noteIds.push(file.path);
                    }
                }
            }
            
            // Recalculate centroids based on cluster members
            let centroidsChanged = false;
            
            for (const cluster of this.clusters.values()) {
                if (cluster.noteIds.length === 0) continue;
                
                // Get all embeddings for notes in this cluster
                const clusterEmbeddings: Float32Array[] = [];
                for (const noteId of cluster.noteIds) {
                    const file = files.find(f => f.path === noteId);
                    if (file) {
                        const content = await this.app.vault.read(file);
                        clusterEmbeddings.push(await this.similarityService.getEmbedding(content));
                    }
                }
                
                // Calculate new centroid (average of all embeddings)
                const newCentroid = new Float32Array(cluster.centroid.length);
                for (let i = 0; i < newCentroid.length; i++) {
                    let sum = 0;
                    for (const embedding of clusterEmbeddings) {
                        sum += embedding[i];
                    }
                    newCentroid[i] = sum / clusterEmbeddings.length;
                }
                
                // Check if centroid changed significantly
                const centroidSimilarity = this.cosineSimilarity(cluster.centroid, newCentroid);
                if (centroidSimilarity < 0.99) {  // 0.99 threshold for change
                    centroidsChanged = true;
                    cluster.centroid = newCentroid;
                }
            }
            
            // If centroids haven't changed much, we've converged
            if (!centroidsChanged) break;
        }
        
        // 3. Generate labels for each cluster based on common themes
        await this.generateClusterLabels(files);
        
        return this.clusters;
    }
    
    private async generateClusterLabels(files: TFile[]): Promise<void> {
        for (const cluster of this.clusters.values()) {
            if (cluster.noteIds.length === 0) {
                cluster.label = `Empty Cluster`;
                continue;
            }
            
            // Extract content from all files in the cluster
            const clusterContents: string[] = [];
            const clusterFiles: TFile[] = [];
            
            for (const noteId of cluster.noteIds) {
                const file = files.find(f => f.path === noteId);
                if (file) {
                    try {
                        const content = await this.app.vault.read(file);
                        clusterContents.push(content);
                        clusterFiles.push(file);
                    } catch (error) {
                        console.error(`Error reading file ${file.path}:`, error);
                    }
                }
            }
            
            // Generate a descriptive label based on common terms
            const label = await this.generateDescriptiveLabel(clusterContents, clusterFiles, cluster.centroid);
            cluster.label = label;
        }
    }
    
    /**
     * Generate a descriptive label for a cluster based on the content of its notes
     */
    private async generateDescriptiveLabel(contents: string[], files: TFile[], centroid: Float32Array): Promise<string> {
        if (contents.length === 0) return "Empty Cluster";
        if (contents.length === 1) return files[0].basename;
        
        // 1. Extract significant terms from all contents
        const terms = this.extractSignificantTerms(contents);
        
        // 2. Find terms that best represent the centroid
        const representativeTerms = await this.findRepresentativeTerms(terms, centroid);
        
        // 3. Format into a descriptive label
        if (representativeTerms.length > 0) {
            // Store the key terms in the cluster object
            const topTerms = representativeTerms.slice(0, 3); // Use top 3 terms maximum
            
            // Find the cluster this centroid belongs to
            for (const cluster of this.clusters.values()) {
                if (cluster.centroid === centroid) {
                    cluster.keyTerms = [...representativeTerms]; // Store all terms
                    break;
                }
            }
            
            // Generate a smart label based on number of terms
            const formattedTerms = topTerms.map(term => term.charAt(0).toUpperCase() + term.slice(1));
            
            if (formattedTerms.length === 1) {
                // Just use the single term
                return formattedTerms[0];
            } else if (formattedTerms.length === 2) {
                // Join two terms with "and"
                return `${formattedTerms[0]} and ${formattedTerms[1]}`;
            } else {
                // For 3+ terms, show the primary term with a descriptive count
                return `${formattedTerms[0]} (${formattedTerms.length - 1} related topics)`;
            }
        }
        
        // Fallback to most frequent terms if no good semantic terms found
        if (terms.length > 0) {
            // Find the cluster this centroid belongs to
            for (const cluster of this.clusters.values()) {
                if (cluster.centroid === centroid) {
                    cluster.keyTerms = terms.slice(0, 5); // Store top terms by frequency
                    break;
                }
            }
            
            // Use the most frequent term as the label
            return terms[0].charAt(0).toUpperCase() + terms[0].slice(1);
        }
        
        // Last-resort fallback to most central note if no good terms found
        let centralNoteIndex = 0;
        let bestSimilarity = -1;
        
        for (let i = 0; i < contents.length; i++) {
            const embedding = await this.similarityService.getEmbedding(contents[i]);
            const similarity = this.cosineSimilarity(embedding, centroid);
            
            if (similarity > bestSimilarity) {
                bestSimilarity = similarity;
                centralNoteIndex = i;
            }
        }
        
        return files[centralNoteIndex].basename;
    }
    
    /**
     * Extract significant terms from a collection of text documents
     */
    private extractSignificantTerms(contents: string[]): string[] {
        // Combine all content
        const combinedText = contents.join(' ');
        
        // Tokenize and count term frequencies
        const words = combinedText.toLowerCase()
            .replace(/[^\w\s]/g, ' ') // Remove punctuation
            .split(/\s+/) // Split by whitespace
            .filter(word => word.length > 3) // Remove short words
            .filter(word => !this.isStopWord(word)); // Remove stop words
        
        // Count word frequencies
        const wordCounts: Record<string, number> = {};
        for (const word of words) {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
        }
        
        // Extract meaningful phrases (bigrams and trigrams)
        const phrases = this.extractPhrases(contents);
        const phraseCounts: Record<string, number> = {};
        for (const phrase of phrases) {
            phraseCounts[phrase] = (phraseCounts[phrase] || 0) + 1;
        }
        
        // Combine words and phrases, sorting by frequency
        const allTerms = [...Object.keys(wordCounts), ...Object.keys(phraseCounts)];
        allTerms.sort((a, b) => {
            const countA = wordCounts[a] || phraseCounts[a] || 0;
            const countB = wordCounts[b] || phraseCounts[b] || 0;
            return countB - countA;
        });
        
        // Return top terms (limited to reasonable number)
        return allTerms.slice(0, 20);
    }
    
    /**
     * Extract meaningful phrases (bigrams and trigrams) from text
     */
    private extractPhrases(contents: string[]): string[] {
        const phrases: string[] = [];
        
        for (const content of contents) {
            const words = content.toLowerCase()
                .replace(/[^\w\s]/g, ' ') // Remove punctuation
                .split(/\s+/) // Split by whitespace
                .filter(word => word.length > 2) // Remove very short words
                .filter(word => !this.isStopWord(word)); // Remove stop words
            
            // Extract bigrams (two-word phrases)
            for (let i = 0; i < words.length - 1; i++) {
                if (words[i].length > 3 && words[i+1].length > 3) {
                    phrases.push(`${words[i]} ${words[i+1]}`);
                }
            }
            
            // Extract trigrams (three-word phrases)
            for (let i = 0; i < words.length - 2; i++) {
                if (words[i].length > 3 && words[i+1].length > 3 && words[i+2].length > 3) {
                    phrases.push(`${words[i]} ${words[i+1]} ${words[i+2]}`);
                }
            }
        }
        
        return phrases;
    }
    
    /**
     * Find terms that best represent the semantic centroid
     */
    private async findRepresentativeTerms(terms: string[], centroid: Float32Array): Promise<string[]> {
        // Get embeddings for all candidate terms
        const termEmbeddings: {term: string, embedding: Float32Array}[] = [];
        
        for (const term of terms) {
            try {
                const embedding = await this.similarityService.getEmbedding(term);
                termEmbeddings.push({term, embedding});
            } catch (error) {
                console.error(`Error getting embedding for term '${term}':`, error);
            }
        }
        
        // Calculate similarity between each term and the centroid
        const termSimilarities = termEmbeddings.map(({term, embedding}) => {
            return {
                term,
                similarity: this.cosineSimilarity(embedding, centroid)
            };
        });
        
        // Sort by similarity (highest first)
        termSimilarities.sort((a, b) => b.similarity - a.similarity);
        
        // Filter for similarity and limit count
        const filteredTerms = termSimilarities
            .filter(item => item.similarity > 0.4) // Only use terms with reasonable similarity
            .slice(0, 8) // Take more than we need for deduplication
            .map(item => item.term); // Get just the terms
            
        // Remove semantically similar terms to avoid redundancy
        const deduplicatedTerms = await this.deduplicateTerms(filteredTerms);
        
        // Return top terms after deduplication
        return deduplicatedTerms.slice(0, 5); // Take top 5 at most
    }
    
    /**
     * Remove semantically similar terms to avoid redundancy
     */
    private async deduplicateTerms(terms: string[]): Promise<string[]> {
        if (terms.length <= 1) return terms;
        
        const result: string[] = [terms[0]]; // Always keep the first term
        const similarityThreshold = 0.75; // Threshold to consider terms as similar
        
        // Check each term against already selected terms
        for (let i = 1; i < terms.length; i++) {
            let isDuplicate = false;
            
            // Check against all terms we've already added to the result
            for (const selectedTerm of result) {
                // Skip exact same words
                if (terms[i] === selectedTerm) {
                    isDuplicate = true;
                    break;
                }
                
                // Skip terms that are substrings of each other
                if (terms[i].includes(selectedTerm) || selectedTerm.includes(terms[i])) {
                    isDuplicate = true;
                    break;
                }
                
                // Check semantic similarity
                try {
                    const similarity = await this.similarityService.calculateSimilarity(terms[i], selectedTerm);
                    if (similarity > similarityThreshold) {
                        isDuplicate = true;
                        break;
                    }
                } catch (error) {
                    console.error(`Error comparing terms '${terms[i]}' and '${selectedTerm}':`, error);
                }
            }
            
            if (!isDuplicate) {
                result.push(terms[i]);
            }
        }
        
        return result;
    }
    
    /**
     * Check if a word is a common stop word that should be excluded
     */
    private isStopWord(word: string): boolean {
        const stopWords = new Set([
            'the', 'and', 'that', 'this', 'with', 'for', 'from', 'about', 
            'but', 'not', 'have', 'are', 'were', 'was', 'been', 'being',
            'has', 'had', 'its', 'they', 'them', 'their', 'there', 'these',
            'those', 'then', 'than', 'what', 'which', 'who', 'whom', 'when',
            'where', 'why', 'how', 'all', 'any', 'both', 'each', 'more',
            'most', 'some', 'such', 'only', 'own', 'same', 'just', 'very',
            'can', 'will', 'should', 'now', 'also', 'into', 'your', 'our',
            'over', 'under', 'again', 'further', 'while', 'because', 'until',
            'through', 'between', 'during', 'before', 'after', 'here', 'once',
            'other', 'some', 'such', 'does', 'don', 'did'
        ]);
        
        return stopWords.has(word);
    }
    
    async searchSemantically(query: string, files: TFile[], threshold: number = 0.0): Promise<{file: TFile, similarity: number}[]> {
        const results: {file: TFile, similarity: number}[] = [];
        const queryEmbedding = await this.similarityService.getEmbedding(query);
        
        for (const file of files) {
            try {
                const content = await this.app.vault.read(file);
                const embedding = await this.similarityService.getEmbedding(content);
                const similarity = this.cosineSimilarity(queryEmbedding, embedding);
                
                // Add all files to results regardless of threshold
                // We'll filter by count in the view instead
                results.push({file, similarity});
            } catch (error) {
                console.error(`Error processing file ${file.path}:`, error);
            }
        }
        
        // Sort by similarity (highest first)
        results.sort((a, b) => b.similarity - a.similarity);
        
        // Apply threshold filtering only if explicitly requested (non-zero value)
        if (threshold > 0) {
            return results.filter(result => result.similarity >= threshold);
        }
        
        return results;
    }
    
    private cosineSimilarity(a: Float32Array, b: Float32Array): number {
        const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
        const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
        const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
        return dotProduct / (magnitudeA * magnitudeB);
    }
    
    getClusters(): Map<string, ClusterData> {
        return this.clusters;
    }
    
    getClusterForNote(notePath: string): ClusterData | null {
        for (const cluster of this.clusters.values()) {
            if (cluster.noteIds.includes(notePath)) {
                return cluster;
            }
        }
        return null;
    }
}