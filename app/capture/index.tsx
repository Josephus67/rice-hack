/**
 * Capture Screen - Camera view for taking rice sample photos
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { Select, Button, LoadingOverlay } from '@/components/common';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants';
import { useCaptureStore } from '@/store';
import type { RiceType } from '@/types';

const RICE_TYPE_OPTIONS = [
  { label: 'Paddy Rice', value: 'Paddy' as RiceType },
  { label: 'Brown Rice', value: 'Brown' as RiceType },
  { label: 'White Rice', value: 'White' as RiceType },
];

export default function CaptureScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [isCapturing, setIsCapturing] = useState(false);
  const [showRiceTypeSelect, setShowRiceTypeSelect] = useState(false);

  const { selectedRiceType, setRiceType, setImageUri, isCapturing: storeCapturing } = useCaptureStore();

  useEffect(() => {
    if (!permission?.granted && permission?.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        base64: false,
        exif: true,
      });

      if (photo?.uri) {
        setImageUri(photo.uri);
        router.push('/capture/preview');
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleClose = () => {
    router.back();
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  // Permission not granted
  if (!permission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color={Colors.light.textMuted} />
        <Text style={styles.permissionTitle}>Camera Permission Required</Text>
        <Text style={styles.permissionText}>
          We need camera access to capture rice sample photos for analysis.
        </Text>
        <Button
          title="Grant Permission"
          onPress={requestPermission}
          style={{ marginTop: Spacing.lg }}
        />
        <Button
          title="Go Back"
          variant="ghost"
          onPress={handleClose}
          style={{ marginTop: Spacing.sm }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
      >
        {/* Top Controls */}
        <View style={styles.topControls}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={Colors.light.primaryText} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowRiceTypeSelect(true)}
            style={styles.riceTypeButton}
          >
            <Ionicons name="leaf" size={18} color={Colors.light.primaryText} />
            <Text style={styles.riceTypeText}>{selectedRiceType}</Text>
            <Ionicons name="chevron-down" size={16} color={Colors.light.primaryText} />
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleCameraFacing} style={styles.flipButton}>
            <Ionicons name="camera-reverse" size={24} color={Colors.light.primaryText} />
          </TouchableOpacity>
        </View>

        {/* Guidance Overlay */}
        <View style={styles.guidanceContainer}>
          <View style={styles.guidanceFrame}>
            {/* Corner markers */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          
          <Text style={styles.guidanceText}>
            Place rice sample within the frame
          </Text>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          {/* Tips */}
          <View style={styles.tipsContainer}>
            <View style={styles.tipItem}>
              <Ionicons name="sunny" size={16} color={Colors.light.warning} />
              <Text style={styles.tipText}>Good lighting</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="color-palette" size={16} color={Colors.light.info} />
              <Text style={styles.tipText}>Blue background</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="apps" size={16} color={Colors.light.success} />
              <Text style={styles.tipText}>No overlapping</Text>
            </View>
          </View>

          {/* Capture Button */}
          <View style={styles.captureButtonContainer}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={handleCapture}
              disabled={isCapturing}
              activeOpacity={0.7}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>

      {/* Rice Type Modal */}
      {showRiceTypeSelect && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Rice Type</Text>
            {RICE_TYPE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.riceOption,
                  selectedRiceType === option.value && styles.riceOptionSelected,
                ]}
                onPress={() => {
                  setRiceType(option.value);
                  setShowRiceTypeSelect(false);
                }}
              >
                <Text
                  style={[
                    styles.riceOptionText,
                    selectedRiceType === option.value && styles.riceOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {selectedRiceType === option.value && (
                  <Ionicons name="checkmark" size={20} color={Colors.light.primary} />
                )}
              </TouchableOpacity>
            ))}
            <Button
              title="Cancel"
              variant="ghost"
              onPress={() => setShowRiceTypeSelect(false)}
              style={{ marginTop: Spacing.md }}
            />
          </View>
        </View>
      )}

      <LoadingOverlay visible={isCapturing} message="Capturing..." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.black,
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    padding: Spacing.xl,
  },
  permissionTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.light.text,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: FontSize.md,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: Spacing.md,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  riceTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.round,
    gap: Spacing.xs,
  },
  riceTypeText: {
    color: Colors.light.primaryText,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  flipButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guidanceContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guidanceFrame: {
    width: 280,
    height: 280,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: Colors.light.primaryText,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: BorderRadius.md,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: BorderRadius.md,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: BorderRadius.md,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: BorderRadius.md,
  },
  guidanceText: {
    marginTop: Spacing.lg,
    color: Colors.light.primaryText,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bottomControls: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    paddingHorizontal: Spacing.md,
  },
  tipsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  tipText: {
    color: Colors.light.primaryText,
    fontSize: FontSize.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  captureButtonContainer: {
    alignItems: 'center',
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: Colors.light.primaryText,
    padding: 4,
  },
  captureButtonInner: {
    flex: 1,
    borderRadius: 30,
    backgroundColor: Colors.light.primaryText,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  riceOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  riceOptionSelected: {
    backgroundColor: Colors.light.backgroundSecondary,
  },
  riceOptionText: {
    fontSize: FontSize.md,
    color: Colors.light.text,
  },
  riceOptionTextSelected: {
    fontWeight: FontWeight.semibold,
    color: Colors.light.primary,
  },
});
