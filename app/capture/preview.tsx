/**
 * Image Preview Screen
 * Shows captured image before analysis
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, LoadingOverlay } from '@/components/common';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants';
import { useCaptureStore, useScansStore, useUserStore } from '@/store';
import { validateImage, runInference, createScan } from '@/services';
import { applyClassifications } from '@/utils/quality-rules';
import { generateUUID } from '@/utils/uuid';
import type { ImageValidationResult } from '@/types/inference.types';

export default function PreviewScreen() {
  const router = useRouter();
  const { capturedImageUri, selectedRiceType, reset } = useCaptureStore();
  const { addScan, setProcessing } = useScansStore();
  const { user } = useUserStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isNavigatingToResults, setIsNavigatingToResults] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [validationResult, setValidationResult] = useState<ImageValidationResult | null>(null);

  // Validate image on mount
  useEffect(() => {
    if (capturedImageUri) {
      runValidation();
    }
  }, [capturedImageUri]);

  const runValidation = async () => {
    if (!capturedImageUri) return;
    setIsValidating(true);
    try {
      const result = await validateImage(capturedImageUri);
      setValidationResult(result);
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleRetake = () => {
    setIsNavigatingToResults(false);
    reset();
    router.back();
  };

  const handleAnalyze = async () => {
    if (!capturedImageUri || !user?.id) {
      Alert.alert('Error', 'Missing image or user information');
      return;
    }

    // Warn if validation failed but allow to continue
    if (validationResult && !validationResult.isValid) {
      Alert.alert(
        'Image Quality Warning',
        'The image may not produce optimal results. Continue anyway?',
        [
          { text: 'Retake', style: 'cancel', onPress: handleRetake },
          { text: 'Continue', onPress: () => runAnalysis() },
        ]
      );
      return;
    }

    await runAnalysis();
  };

  const runAnalysis = async () => {
    if (!capturedImageUri || !user?.id) return;

    try {
      setIsAnalyzing(true);
      setProcessing(true);

      // Run inference using the inference service
      const inferenceResult = await runInference(capturedImageUri, selectedRiceType);
      
      if (!inferenceResult.success || !inferenceResult.output) {
        throw new Error(inferenceResult.error || 'Inference failed');
      }

      // Apply quality classifications
      const classifications = applyClassifications(inferenceResult.output);

      // Create scan result
      const scanResult = {
        id: generateUUID(),
        userId: user.id,
        imageUri: capturedImageUri,
        riceType: selectedRiceType,
        capturedAt: new Date(),
        rawOutput: inferenceResult.output,
        classifications,
        inferenceTimeMs: inferenceResult.inferenceTimeMs,
      };

      // Persist to SQLite so History tab (which reads from DB) stays in sync.
      await createScan(scanResult);
      addScan(scanResult);

      // Reset capture state and navigate to results
      setIsNavigatingToResults(true);
      reset();
      router.replace(`/results/${scanResult.id}`);
    } catch (error) {
      console.error('Analysis error:', error);
      setIsNavigatingToResults(false);
      Alert.alert('Analysis Failed', 'Unable to analyze the image. Please try again.');
    } finally {
      setIsAnalyzing(false);
      setProcessing(false);
    }
  };

  if (!capturedImageUri) {
    if (isAnalyzing || isNavigatingToResults) {
      return (
        <SafeAreaView style={styles.container}>
          <LoadingOverlay visible={true} message="Opening results..." />
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No image captured</Text>
        <Button title="Go Back" onPress={handleRetake} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Preview */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: capturedImageUri }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Info Card */}
        <Card variant="filled" style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Rice Type</Text>
            <Text style={styles.infoValue}>{selectedRiceType}</Text>
          </View>
        </Card>

        {/* Validation Results */}
        {isValidating ? (
          <Card variant="outlined" style={styles.validationCard}>
            <Text style={styles.validationTitle}>Checking image quality...</Text>
          </Card>
        ) : validationResult ? (
          <Card
            variant="outlined"
            style={
              validationResult.isValid
                ? styles.validationCard
                : [styles.validationCard, styles.validationCardWarning]
            }
          >
            <View style={styles.validationHeader}>
              <Ionicons
                name={validationResult.isValid ? 'checkmark-circle' : 'warning'}
                size={20}
                color={validationResult.isValid ? Colors.light.success : Colors.light.warning}
              />
              <Text style={styles.validationTitle}>
                {validationResult.isValid ? 'Image Quality OK' : 'Quality Issues Detected'}
              </Text>
            </View>
            {validationResult.checks.map((check, index) => (
              <View key={index} style={styles.checkRow}>
                <Ionicons
                  name={check.passed ? 'checkmark' : 'close'}
                  size={16}
                  color={check.passed ? Colors.light.success : Colors.light.error}
                />
                <Text style={styles.checkText}>{check.message}</Text>
              </View>
            ))}
          </Card>
        ) : null}

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Retake"
            variant="outline"
            onPress={handleRetake}
            style={styles.actionButton}
          />
          <Button
            title="Analyze"
            onPress={handleAnalyze}
            loading={isAnalyzing}
            disabled={isValidating}
            style={styles.actionButton}
          />
        </View>
      </ScrollView>

      <LoadingOverlay visible={isAnalyzing} message="Analyzing rice sample..." />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: Spacing.md,
  },
  imageContainer: {
    height: 280,
    backgroundColor: Colors.light.black,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.lg,
  },
  infoCard: {
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: FontSize.md,
    color: Colors.light.textSecondary,
  },
  infoValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.light.text,
  },
  validationCard: {
    marginBottom: Spacing.md,
  },
  validationCardWarning: {
    borderColor: Colors.light.warning,
  },
  validationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  validationTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.light.text,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  checkText: {
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  errorText: {
    fontSize: FontSize.lg,
    color: Colors.light.error,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
});
