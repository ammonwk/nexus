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

    public async getEmbedding(text: string): Promise<Float32Array> {
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
