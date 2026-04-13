import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Animated,
  Platform,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useCrackDetector } from './src/hooks/useCrackDetector';
import ResultCard from './src/components/ResultCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type AppMode = 'camera' | 'preview' | 'result';

export default function App() {
  const [mode, setMode] = useState<AppMode>('camera');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  
  const cameraRef = useRef<CameraView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const {
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
    reset
  } = useCrackDetector();

  useEffect(() => {
    loadModel();
  }, []);

  useEffect(() => {
    if (mode === 'result') {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [mode]);

  const handleCapture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        if (photo?.uri) {
          setImageUri(photo.uri);
          setMode('preview');
        }
      } catch (error) {
        console.error('Failed to capture photo:', error);
      }
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setMode('preview');
    }
  };

  const handleAnalyze = async () => {
    if (imageUri) {
      setMode('result');
      await detectCrack(imageUri);
    }
  };

  const handleRetake = () => {
    setImageUri(null);
    setMode('camera');
    reset();
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  // Loading screen while model loads
  if (!isModelLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <View style={styles.loadingIconContainer}>
            <View style={styles.loadingIconInner}>
              <View style={styles.loadingIconCircle} />
              <View style={styles.loadingIconLine} />
            </View>
          </View>
          <Text style={styles.loadingTitle}>Crack Detector</Text>
          <Text style={styles.loadingSubtitle}>Loading AI Model...</Text>
          <ActivityIndicator size="large" color="#22d3ee" style={{ marginTop: 24 }} />
        </View>
      </SafeAreaView>
    );
  }

  if (!isModelReady) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <Text style={styles.permissionTitle}>Model Not Available</Text>
          <Text style={[styles.permissionText, { marginBottom: 16 }]}>
            The on-device model did not load, so analysis cannot run. You will not see confidence scores until this works.
          </Text>
          <Text
            style={[styles.permissionText, { fontSize: 13, color: '#64748b' }]}
            selectable
          >
            {modelLoadError ?? 'Unknown error'}
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={() => retryLoadModel()}>
            <Text style={styles.permissionButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Permission request screen
  if (!cameraPermission?.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.permissionContainer}>
          <View style={styles.cameraIconContainer}>
            <View style={styles.cameraIconBody} />
            <View style={styles.cameraIconLens} />
          </View>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            To detect cracks, we need access to your camera to capture images of surfaces.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestCameraPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.galleryButton} onPress={handlePickImage}>
            <Text style={styles.galleryButtonText}>Or Select from Gallery</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Crack Detector</Text>
        <Text style={styles.headerSubtitle}>
          {mode === 'camera' && 'Point camera at surface'}
          {mode === 'preview' && 'Review your image'}
          {mode === 'result' && 'Analysis complete'}
        </Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {mode === 'camera' && (
          <View style={styles.cameraContainer}>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing={facing}
            >
              {/* Camera overlay with scanning frame */}
              <View style={styles.cameraOverlay}>
                <View style={styles.scanFrame}>
                  <View style={[styles.corner, styles.cornerTL]} />
                  <View style={[styles.corner, styles.cornerTR]} />
                  <View style={[styles.corner, styles.cornerBL]} />
                  <View style={[styles.corner, styles.cornerBR]} />
                </View>
                <Text style={styles.scanText}>Position surface within frame</Text>
              </View>
            </CameraView>
          </View>
        )}

        {mode === 'preview' && imageUri && (
          <View style={styles.previewContainer}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
            <View style={styles.previewOverlay}>
              <Text style={styles.previewText}>Ready to analyze</Text>
            </View>
          </View>
        )}

        {mode === 'result' && imageUri && (
          <ScrollView 
            style={styles.resultScrollView}
            contentContainerStyle={styles.resultScrollContent}
            showsVerticalScrollIndicator={true}
          >
            <Animated.View style={[styles.resultContainer, { opacity: fadeAnim }]}>
              <Image source={{ uri: imageUri }} style={styles.resultImage} />
              <ResultCard
                isProcessing={isProcessing}
                result={result}
                confidence={confidence}
                error={error}
              />
            </Animated.View>
          </ScrollView>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {mode === 'camera' && (
          <>
            <TouchableOpacity style={styles.secondaryButton} onPress={handlePickImage}>
              <View style={styles.galleryIcon}>
                <View style={styles.galleryIconInner} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryButton} onPress={toggleCameraFacing}>
              <View style={styles.flipIcon}>
                <View style={styles.flipIconArrow} />
                <View style={styles.flipIconArrowReverse} />
              </View>
            </TouchableOpacity>
          </>
        )}

        {mode === 'preview' && (
          <>
            <TouchableOpacity style={styles.actionButton} onPress={handleRetake}>
              <Text style={styles.actionButtonText}>Retake</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.analyzeButton]} 
              onPress={handleAnalyze}
            >
              <Text style={styles.analyzeButtonText}>Analyze</Text>
            </TouchableOpacity>
          </>
        )}

        {mode === 'result' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.newScanButton]} 
            onPress={handleRetake}
          >
            <Text style={styles.newScanButtonText}>New Scan</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingIconInner: {
    alignItems: 'center',
  },
  loadingIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#22d3ee',
  },
  loadingIconLine: {
    width: 4,
    height: 24,
    backgroundColor: '#22d3ee',
    marginTop: -4,
    transform: [{ rotate: '45deg' }],
    marginLeft: 20,
  },
  loadingTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#f1f5f9',
    letterSpacing: -0.5,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 8,
  },

  // Permission styles
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  cameraIconContainer: {
    width: 80,
    height: 60,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconBody: {
    width: 64,
    height: 44,
    borderRadius: 8,
    borderWidth: 4,
    borderColor: '#94a3b8',
  },
  cameraIconLens: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 4,
    borderColor: '#94a3b8',
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f1f5f9',
    textAlign: 'center',
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#22d3ee',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  permissionButtonText: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '600',
  },
  galleryButton: {
    marginTop: 16,
    padding: 12,
  },
  galleryButtonText: {
    color: '#22d3ee',
    fontSize: 16,
  },

  // Header styles
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 48 : 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f1f5f9',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#64748b',
    marginTop: 4,
  },

  // Content styles
  content: {
    flex: 1,
    padding: 16,
  },

  // Camera styles
  cameraContainer: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  scanFrame: {
    width: SCREEN_WIDTH - 80,
    height: SCREEN_WIDTH - 80,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#22d3ee',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  scanText: {
    marginTop: 24,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },

  // Preview styles
  previewContainer: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  previewImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
  },
  previewText: {
    color: '#22d3ee',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Result styles
  resultScrollView: {
    flex: 1,
  },
  resultScrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  resultContainer: {
    flex: 1,
  },
  resultImage: {
    width: '100%',
    height: 280,
    borderRadius: 24,
    resizeMode: 'cover',
  },

  // Action button styles
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 24,
    gap: 20,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(34, 211, 238, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#22d3ee',
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#22d3ee',
  },
  secondaryButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(100, 116, 139, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryIcon: {
    width: 24,
    height: 20,
    borderWidth: 2,
    borderColor: '#f1f5f9',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryIconInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f1f5f9',
  },
  flipIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipIconArrow: {
    width: 20,
    height: 20,
    borderWidth: 3,
    borderColor: '#f1f5f9',
    borderRadius: 10,
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  flipIconArrowReverse: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#f1f5f9',
    top: 0,
    right: 2,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(100, 116, 139, 0.3)',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#f1f5f9',
    fontSize: 18,
    fontWeight: '600',
  },
  analyzeButton: {
    backgroundColor: '#22d3ee',
  },
  analyzeButtonText: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '700',
  },
  newScanButton: {
    backgroundColor: '#22d3ee',
    flex: 0,
    paddingHorizontal: 48,
  },
  newScanButtonText: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '700',
  },
});

