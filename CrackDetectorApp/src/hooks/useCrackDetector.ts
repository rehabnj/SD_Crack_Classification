import { useState, useCallback, useRef } from 'react';
import { loadTensorflowModel, TensorflowModel } from 'react-native-fast-tflite';
import * as ImageManipulator from 'expo-image-manipulator';
import jpeg from 'jpeg-js';

export type DetectionResult = 'crack' | 'no_crack' | null;

const INPUT_SIZE = 224;

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

export function useCrackDetector(): UseCrackDetectorReturn {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const [modelLoadError, setModelLoadError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<DetectionResult>(null);
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const modelRef = useRef<TensorflowModel | null>(null);

  const loadModel = useCallback(async () => {
    setIsModelLoaded(false);
    setIsModelReady(false);
    setModelLoadError(null);
    try {
      const model = await loadTensorflowModel(
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('../../assets/crack_detector.tflite')
      );
      modelRef.current = model;
      setIsModelLoaded(true);
      setIsModelReady(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setModelLoadError(msg);
      setIsModelLoaded(true); // loading attempt is done
      setIsModelReady(false);
    }
  }, []);

  const detectCrack = useCallback(async (imageUri: string) => {
    if (!modelRef.current) {
      setError('Model not loaded');
      return;
    }

    setIsProcessing(true);
    setResult(null);
    setConfidence(0);
    setError(null);

    try {
      // 1. Resize to 224×224 and get base64 JPEG
      const resized = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: INPUT_SIZE, height: INPUT_SIZE } }],
        { compress: 0.95, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      if (!resized.base64) throw new Error('Failed to encode image as base64');

      // 2. Decode JPEG → raw RGBA pixels
      const binaryStr = atob(resized.base64);
      const rawBytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        rawBytes[i] = binaryStr.charCodeAt(i);
      }
      const decoded = jpeg.decode(rawBytes, { useTArray: true });

      // 3. Build Float32Array [224×224×3] normalised to [-1, 1] (MobileNetV2)
      const input = new Float32Array(INPUT_SIZE * INPUT_SIZE * 3);
      const { data } = decoded;
      for (let i = 0, j = 0; i < data.length; i += 4, j += 3) {
        input[j]     = (data[i]     / 127.5) - 1.0; // R
        input[j + 1] = (data[i + 1] / 127.5) - 1.0; // G
        input[j + 2] = (data[i + 2] / 127.5) - 1.0; // B
        // skip alpha channel (data[i+3])
      }

      // 4. Run TFLite inference — sigmoid output: 0 = no crack, 1 = crack
      const outputs = await modelRef.current.run([input]);
      const prob = (outputs[0] as Float32Array)[0];

      const isCrack = prob >= 0.5;
      const conf = Math.round(isCrack ? prob * 100 : (1 - prob) * 100);

      setResult(isCrack ? 'crack' : 'no_crack');
      setConfidence(conf);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Inference failed';
      setError(msg);
      setResult(null);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setConfidence(0);
    setError(null);
    setIsProcessing(false);
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
    retryLoadModel: loadModel,
    detectCrack,
    reset,
  };
}
