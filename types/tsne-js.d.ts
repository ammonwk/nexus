// types/tsne-js.d.ts

declare module 'tsne-js' {
    interface TSNEConfiguration {
        dim: number;
        perplexity: number;
        earlyExaggeration: number;
        learningRate: number;
        nIter: number;
        metric: string;
    }

    interface TSNEInitOptions {
        data: number[][];
        type: 'dense' | 'distance';
    }

    export default class TSNE {
        constructor(config: TSNEConfiguration);
        init(options: TSNEInitOptions): void;
        step(): number;
        getOutput(): number[][];
    }
}