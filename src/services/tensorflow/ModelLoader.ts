// ModelLoader.ts
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';

export interface ModelConfig {
  modelUrl: string;
  modelType: 'tflite' | 'tfjs';
  inputShape: number[];
  outputShape: number[];
}

export class ModelLoader {
  private model: tf.LayersModel | null = null;
  private isInitialized: boolean = false;

  async initialize(config: ModelConfig): Promise<void> {
    try {
      await tf.ready();
      this.model = await tf.loadLayersModel(config.modelUrl);
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing TensorFlow model:', error);
      throw new Error('Failed to initialize TensorFlow model');
    }
  }

  async warmup(): Promise<void> {
    if (!this.isInitialized || !this.model) {
      throw new Error('Model not initialized');
    }

    try {
      // Run a dummy prediction to warm up the model
      const dummyInput = tf.zeros(this.model.inputs[0].shape);
      await this.model.predict(dummyInput).dispose();
      dummyInput.dispose();
    } catch (error) {
      console.error('Error warming up model:', error);
      throw new Error('Failed to warm up model');
    }
  }

  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
      this.isInitialized = false;
    }
  }
}