/**
 * Application state store using Zustand
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile, ScanResult, ScanSummary, RiceType } from '@/types';

// ============================================================================
// User Store
// ============================================================================

interface UserState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setUser: (user: UserProfile) => void;
  clearUser: () => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  setLoading: (loading: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      
      setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),
      clearUser: () => set({ user: null, isAuthenticated: false, isLoading: false }),
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates, updatedAt: new Date() } : null,
      })),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// ============================================================================
// Scans Store
// ============================================================================

interface ScansState {
  currentScan: ScanResult | null;
  recentScans: ScanSummary[];
  isProcessing: boolean;
  
  // Actions
  setCurrentScan: (scan: ScanResult | null) => void;
  addScan: (scan: ScanResult) => void;
  setRecentScans: (scans: ScanSummary[]) => void;
  removeScan: (id: string) => void;
  setProcessing: (processing: boolean) => void;
  clearCurrentScan: () => void;
}

export const useScansStore = create<ScansState>()((set) => ({
  currentScan: null,
  recentScans: [],
  isProcessing: false,
  
  setCurrentScan: (scan) => set({ currentScan: scan }),
  clearCurrentScan: () => set({ currentScan: null }),
  
  addScan: (scan) => set((state) => {
    const summary: ScanSummary = {
      id: scan.id,
      riceType: scan.riceType,
      capturedAt: scan.capturedAt,
      gradeCode: scan.classifications.millingGrade.code,
      totalCount: scan.rawOutput.count,
      brokenPercent: (scan.rawOutput.broken_count / scan.rawOutput.count) * 100,
    };
    return {
      currentScan: scan,
      recentScans: [summary, ...state.recentScans].slice(0, 10), // Keep last 10
    };
  }),
  
  setRecentScans: (scans) => set({ recentScans: scans }),
  
  removeScan: (id) => set((state) => ({
    recentScans: state.recentScans.filter((s) => s.id !== id),
    currentScan: state.currentScan?.id === id ? null : state.currentScan,
  })),
  
  setProcessing: (isProcessing) => set({ isProcessing }),
}));

// ============================================================================
// Capture Store
// ============================================================================

interface CaptureState {
  selectedRiceType: RiceType;
  capturedImageUri: string | null;
  isCapturing: boolean;
  
  // Actions
  setRiceType: (type: RiceType) => void;
  setImageUri: (uri: string | null) => void;
  setCapturing: (capturing: boolean) => void;
  reset: () => void;
}

export const useCaptureStore = create<CaptureState>()((set) => ({
  selectedRiceType: 'Paddy',
  capturedImageUri: null,
  isCapturing: false,
  
  setRiceType: (selectedRiceType) => set({ selectedRiceType }),
  setImageUri: (capturedImageUri) => set({ capturedImageUri }),
  setCapturing: (isCapturing) => set({ isCapturing }),
  reset: () => set({
    selectedRiceType: 'Paddy',
    capturedImageUri: null,
    isCapturing: false,
  }),
}));

// ============================================================================
// Settings Store
// ============================================================================

interface SettingsState {
  disclaimerAccepted: boolean;
  locationEnabled: boolean;
  
  // Actions
  acceptDisclaimer: () => void;
  setLocationEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      disclaimerAccepted: false,
      locationEnabled: false,
      
      acceptDisclaimer: () => set({ disclaimerAccepted: true }),
      setLocationEnabled: (locationEnabled) => set({ locationEnabled }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
