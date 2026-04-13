import { useState, useCallback } from 'react';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import * as tf from '@tensorflow/tfjs';
// Import platform adapter directly to get WebGL backend without react-native-fs
import '@tensorflow/tfjs-react-native/dist/platform_react_native';
import jpeg from 'jpeg-js';

const MODEL_INPUT_SIZE = 224;
const CONFIDENCE_THRESHOLD = 0.5;

export type DetectionResult = 'crack' | 'no_crack' | null;

interface UseCrackDetectorReturn {
  isModelLoaded: boolean;
  isModelReady: boolean;
  modelLoadError: string | null;
  isProcessing: boolean;
  result: DetectionResult;
  confidence: number;
  error: string | null;
  loadModel: () => Promise<void>;
  retryLoadModel: () => Promise<void>;
  detectCrack: (imageUri: string) => Promise<void>;
  reset: () => void;
}

let tfjsModel: tf.LayersModel | null = null;

async function loadModelFromAssets(): Promise<tf.LayersModel> {
  // tf.ready() will use WebGL via expo-gl (GPU) if available, falling back to CPU
  await tf.ready();

  // Metro parses JSON files directly — require() returns the object, not an asset ID
  const modelJson = require('../../assets/model/model.json');

  // Load weight binary
  const weightsAsset = Asset.fromModule(require('../../assets/model/group1-shard1of1.bin'));
  await weightsAsset.downloadAsync();
  const weightsB64 = await FileSystem.readAsStringAsync(weightsAsset.localUri!, {
    encoding: 'base64' as any,
  });

  // base64 → ArrayBuffer using fetch (much faster than manual char loop)
  const dataUri = `data:application/octet-stream;base64,${weightsB64}`;
  const response = await fetch(dataUri);
  const weightsBuffer = await response.arrayBuffer();
  const weightsBytes = new Uint8Array(weightsBuffer);

  // Build TF.js model from topology + weights
  const model = await tf.loadLayersModel({
    load: async () => ({
      modelTopology: modelJson.modelTopology,
      weightSpecs: modelJson.weightsManifest[0].weights,
      weightData: weightsBytes.buffer,
      format: modelJson.format,
      generatedBy: modelJson.generatedBy,
      convertedBy: modelJson.convertedBy,
    }),
  });

  return model;
}

export function useCrackDetector(): UseCrackDetectorReturn {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const [modelLoadError, setModelLoadError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<DetectionResult>(null);
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const loadModel = useCallback(async () => {
    setIsModelLoaded(false);
    setModelLoadError(null);
    setIsModelReady(false);
    try {
      tfjsModel = await loadModelFromAssets();
      setIsModelReady(true);
      setIsModelLoaded(true);
    } catch (e: any) {
      setModelLoadError(e?.message ?? String(e));
      setIsModelLoaded(true);
    }
  }, []);

  const retryLoadModel = useCallback(async () => {
    tfjsModel = null;
    await loadModel();
  }, [loadModel]);

  const detectCrack = useCallback(async (imageUri: string) => {
    if (!tfjsModel) {
      setError('Model not loaded');
      return;
    }
    setIsProcessing(true);
    setResult(null);
    setConfidence(0);
    setError(null);

    try {
      // Resize to 224x224 JPEG and get base64
      const manipulated = await manipulateAsync(
        imageUri,
        [{ resize: { width: MODEL_INPUT_SIZE, height: MODEL_INPUT_SIZE } }],
        { format: SaveFormat.JPEG, base64: true }
      );
      if (!manipulated.base64) throw new Error('Failed to get image data');

      // base64 → Uint8Array JPEG bytes
      const binaryStr = atob(manipulated.base64);
      const jpegBytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        jpegBytes[i] = binaryStr.charCodeAt(i);
      }

      // Decode JPEG → raw RGBA pixels
      const rawImage = jpeg.decode(jpegBytes, { useTArray: true });
      if (!rawImage?.data) throw new Error('JPEG decode failed');

      // RGBA → Float32 RGB, MobileNetV2 preprocessing: [0,255] → [-1,1]
      const inputData = new Float32Array(MODEL_INPUT_SIZE * MODEL_INPUT_SIZE * 3);
      for (let i = 0; i < MODEL_INPUT_SIZE * MODEL_INPUT_SIZE; i++) {
        inputData[i * 3 + 0] = rawImage.data[i * 4 + 0] / 127.5 - 1.0;
        inputData[i * 3 + 1] = rawImage.data[i * 4 + 1] / 127.5 - 1.0;
        inputData[i * 3 + 2] = rawImage.data[i * 4 + 2] / 127.5 - 1.0;
      }

      // Run inference
      const outputTensor = tf.tidy(() => {
        const imgTensor = tf.tensor(inputData, [1, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE, 3]);
        return tfjsModel!.predict(imgTensor) as tf.Tensor;
      });

      const prob = (await outputTensor.data())[0];
      outputTensor.dispose();

      const isCrack = prob >= CONFIDENCE_THRESHOLD;
      const conf = Math.round(isCrack ? prob * 100 : (1 - prob) * 100);

      setResult(isCrack ? 'crack' : 'no_crack');
      setConfidence(conf);
    } catch (e: any) {
      setError(e?.message ?? 'Inference failed');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setConfidence(0);
    setIsProcessing(false);
    setError(null);
  }, []);

  return {
    isModelLoaded,
    isModelReady,
    modelLoadError,
    isProcessing,
    result,
    confidence,
    error,
    loadModel,
    retryLoadModel,
    detectCrack,
    reset,
  };
}
