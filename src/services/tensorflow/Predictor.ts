// Predictor.ts
import * as tf from '@tensorflow/tfjs';
import { ModelLoader } from './ModelLoader';

export interface PredictionResult {
  prediction: number[];
  confidence: number;
  inferenceTime: number;
}

export class Predictor {
  private modelLoader: ModelLoader;

  constructor(modelLoader: ModelLoader) {
    this.modelLoader = modelLoader;
  }

  async predict(input: number[]): Promise<PredictionResult> {
    const startTime = Date.now();

    try {
      const inputTensor = tf.tensor(input);
      const prediction = await this.modelLoader.model?.predict(inputTensor);
      
      if (!prediction) {
        throw new Error('Prediction failed');
      }

      const predictionData = await prediction.data();
      const inferenceTime = Date.now() - startTime;

      // Calculate confidence (example implementation)
      const confidence = Math.max(...Array.from(predictionData));

      // Cleanup
      inputTensor.dispose();
      prediction.dispose();

      return {
        prediction: Array.from(predictionData),
        confidence,
        inferenceTime
      };
    } catch (error) {
      console.error('Error making prediction:', error);
      throw new Error('Failed to make prediction');
    }
  }
}