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