import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { DetectionResult } from '../hooks/useCrackDetector';

interface ResultCardProps {
  isProcessing: boolean;
  result: DetectionResult;
  confidence: number;
}

export default function ResultCard({ isProcessing, result, confidence }: ResultCardProps) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (result) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
    }
  }, [result]);

  if (isProcessing) {
    return (
      <View style={styles.container}>
        <View style={styles.processingCard}>
          <ActivityIndicator size="large" color="#22d3ee" />
          <Text style={styles.processingText}>Analyzing surface...</Text>
          <Text style={styles.processingSubtext}>AI is examining the image</Text>
        </View>
      </View>
    );
  }

  if (!result) {
    return null;
  }

  const isCrack = result === 'crack';

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.resultCard,
          isCrack ? styles.crackCard : styles.noCrackCard,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        {/* Result Icon */}
        <View style={[styles.iconContainer, isCrack ? styles.crackIcon : styles.noCrackIcon]}>
          {isCrack ? (
            <View style={styles.warningIcon}>
              <View style={styles.warningTriangle} />
              <Text style={styles.warningExclamation}>!</Text>
            </View>
          ) : (
            <View style={styles.checkIcon}>
              <View style={styles.checkmarkShort} />
              <View style={styles.checkmarkLong} />
            </View>
          )}
        </View>

        {/* Result Text */}
        <Text style={[styles.resultTitle, isCrack ? styles.crackTitle : styles.noCrackTitle]}>
          {isCrack ? 'Crack Detected' : 'No Crack Found'}
        </Text>
        
        <Text style={styles.resultDescription}>
          {isCrack
            ? 'A crack has been detected in this surface. Consider inspection or repair.'
            : 'The surface appears to be intact with no visible cracks detected.'}
        </Text>

        {/* Confidence Meter */}
        <View style={styles.confidenceContainer}>
          <Text style={styles.confidenceLabel}>Confidence</Text>
          <View style={styles.confidenceBarBg}>
            <View
              style={[
                styles.confidenceBar,
                isCrack ? styles.crackBar : styles.noCrackBar,
                { width: `${confidence}%` },
              ]}
            />
          </View>
          <Text style={[styles.confidenceValue, isCrack ? styles.crackValue : styles.noCrackValue]}>
            {confidence}%
          </Text>
        </View>

        {/* Recommendation */}
        <View style={[styles.recommendationBox, isCrack ? styles.crackRecommendation : styles.noCrackRecommendation]}>
          <View style={[styles.recommendationIconContainer, isCrack ? styles.recommendationIconCrack : styles.recommendationIconGood]}>
            {isCrack ? (
              <View style={styles.wrenchIcon}>
                <View style={styles.wrenchHead} />
                <View style={styles.wrenchHandle} />
              </View>
            ) : (
              <View style={styles.thumbIcon}>
                <View style={styles.thumbUp} />
              </View>
            )}
          </View>
          <Text style={styles.recommendationText}>
            {isCrack
              ? 'Recommended: Schedule professional inspection'
              : 'Surface condition: Good'}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  
  processingCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.3)',
  },
  processingText: {
    color: '#f1f5f9',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
  },
  processingSubtext: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 8,
  },

  resultCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
  },
  crackCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  noCrackCard: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.4)',
  },

  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  crackIcon: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  noCrackIcon: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  warningIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 18,
    borderRightWidth: 18,
    borderBottomWidth: 32,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#ef4444',
    borderRadius: 4,
  },
  warningExclamation: {
    position: 'absolute',
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    top: 10,
  },
  checkIcon: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkShort: {
    position: 'absolute',
    width: 4,
    height: 12,
    backgroundColor: '#22c55e',
    borderRadius: 2,
    transform: [{ rotate: '-45deg' }],
    left: 8,
    top: 16,
  },
  checkmarkLong: {
    position: 'absolute',
    width: 4,
    height: 24,
    backgroundColor: '#22c55e',
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
    right: 8,
    top: 6,
  },

  resultTitle: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  crackTitle: {
    color: '#ef4444',
  },
  noCrackTitle: {
    color: '#22c55e',
  },

  resultDescription: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },

  confidenceContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  confidenceLabel: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  confidenceBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(100, 116, 139, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceBar: {
    height: '100%',
    borderRadius: 4,
  },
  crackBar: {
    backgroundColor: '#ef4444',
  },
  noCrackBar: {
    backgroundColor: '#22c55e',
  },
  confidenceValue: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 8,
  },
  crackValue: {
    color: '#ef4444',
  },
  noCrackValue: {
    color: '#22c55e',
  },

  recommendationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  crackRecommendation: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  noCrackRecommendation: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  recommendationIconContainer: {
    width: 28,
    height: 28,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationIconCrack: {
    // wrench styling handled inline
  },
  recommendationIconGood: {
    // thumb styling handled inline
  },
  wrenchIcon: {
    alignItems: 'center',
  },
  wrenchHead: {
    width: 12,
    height: 8,
    borderWidth: 2,
    borderColor: '#ef4444',
    borderRadius: 2,
  },
  wrenchHandle: {
    width: 4,
    height: 14,
    backgroundColor: '#ef4444',
    marginTop: -2,
  },
  thumbIcon: {
    alignItems: 'center',
  },
  thumbUp: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#22c55e',
  },
  recommendationText: {
    flex: 1,
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '500',
  },
});

