/**
 * API Client for Backend Communication
 * 
 * Handles authentication and data sync with the FastAPI backend.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants/app';
import type { ScanResult, UserProfile } from '@/types';

// API Configuration
const API_CONFIG = {
  // Change this to your actual backend URL
  BASE_URL: __DEV__ ? 'http://localhost:8000/api/v1' : 'https://api.riceanalyzer.app/api/v1',
  TIMEOUT: 30000,
};

// Token management
let accessToken: string | null = null;
let refreshToken: string | null = null;

/**
 * Initialize tokens from storage
 */
export async function initializeTokens(): Promise<void> {
  try {
    accessToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  } catch (error) {
    console.error('Error loading tokens:', error);
  }
}

/**
 * Save tokens to storage
 */
async function saveTokens(access: string, refresh: string): Promise<void> {
  accessToken = access;
  refreshToken = refresh;
  await AsyncStorage.multiSet([
    [STORAGE_KEYS.ACCESS_TOKEN, access],
    [STORAGE_KEYS.REFRESH_TOKEN, refresh],
  ]);
}

/**
 * Clear tokens from storage
 */
export async function clearTokens(): Promise<void> {
  accessToken = null;
  refreshToken = null;
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.ACCESS_TOKEN,
    STORAGE_KEYS.REFRESH_TOKEN,
  ]);
}

/**
 * Check if user is authenticated with backend
 */
export function isAuthenticated(): boolean {
  return !!accessToken;
}

/**
 * Make an authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (accessToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
  }
  
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    
    clearTimeout(timeout);
    
    // Handle 401 - try to refresh token
    if (response.status === 401 && refreshToken) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry with new token
        (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
        const retryResponse = await fetch(url, { ...options, headers });
        if (!retryResponse.ok) {
          throw new ApiError(retryResponse.status, await retryResponse.text());
        }
        return retryResponse.json();
      }
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(response.status, errorText);
    }
    
    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }
    
    return response.json();
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, error instanceof Error ? error.message : 'Network error');
  }
}

/**
 * Refresh the access token
 */
async function refreshAccessToken(): Promise<boolean> {
  if (!refreshToken) return false;
  
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    
    if (!response.ok) {
      await clearTokens();
      return false;
    }
    
    const data = await response.json();
    await saveTokens(data.access_token, data.refresh_token);
    return true;
  } catch {
    await clearTokens();
    return false;
  }
}

// ============================================================================
// Auth API
// ============================================================================

export interface RegisterInput {
  username: string;
  role: string;
  organization?: string;
  email?: string;
  password?: string;
  disclaimer_accepted: boolean;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export async function register(input: RegisterInput): Promise<UserProfile> {
  const user = await apiRequest<any>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return transformUserResponse(user);
}

export async function login(input: LoginInput): Promise<TokenResponse> {
  const formData = new URLSearchParams();
  formData.append('username', input.username);
  formData.append('password', input.password);
  
  const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  });
  
  if (!response.ok) {
    throw new ApiError(response.status, await response.text());
  }
  
  const tokens = await response.json();
  await saveTokens(tokens.access_token, tokens.refresh_token);
  return tokens;
}

export async function logout(): Promise<void> {
  await clearTokens();
}

export async function getRemoteUser(): Promise<UserProfile> {
  const user = await apiRequest<any>('/auth/me');
  return transformUserResponse(user);
}

// ============================================================================
// Scans API
// ============================================================================

export async function syncScans(scans: ScanResult[]): Promise<{
  synced_count: number;
  failed_ids: string[];
  errors: string[];
}> {
  const payload = {
    scans: scans.map((scan) => ({
      id: scan.id,
      user_id: scan.userId,
      rice_type: scan.riceType,
      raw_output: {
        count: scan.rawOutput.count,
        broken_count: scan.rawOutput.broken_count,
        long_count: scan.rawOutput.long_count,
        medium_count: scan.rawOutput.medium_count,
        black_count: scan.rawOutput.black_count,
        chalky_count: scan.rawOutput.chalky_count,
        red_count: scan.rawOutput.red_count,
        yellow_count: scan.rawOutput.yellow_count,
        green_count: scan.rawOutput.green_count,
        wk_length_avg: scan.rawOutput.wk_length_avg,
        wk_width_avg: scan.rawOutput.wk_width_avg,
        wk_lw_ratio_avg: scan.rawOutput.wk_lw_ratio_avg,
        average_l: scan.rawOutput.average_l,
        average_a: scan.rawOutput.average_a,
        average_b: scan.rawOutput.average_b,
      },
      classifications: scan.classifications,
      inference_time_ms: scan.inferenceTimeMs,
      captured_at: scan.capturedAt.toISOString(),
    })),
  };
  
  return apiRequest('/scans/sync', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getScans(skip = 0, limit = 50): Promise<any[]> {
  return apiRequest(`/scans?skip=${skip}&limit=${limit}`);
}

export async function getScanStats(): Promise<{
  total_scans: number;
  avg_broken_percent: number;
  total_grains_analyzed: number;
  grade_distribution: Record<string, number>;
}> {
  return apiRequest('/scans/stats/summary');
}

// ============================================================================
// Helpers
// ============================================================================

function transformUserResponse(data: any): UserProfile {
  return {
    id: data.id,
    username: data.username,
    role: data.role,
    organization: data.organization || undefined,
    locationOptIn: data.location_opt_in ?? false,
    disclaimerAcceptedAt: new Date(data.disclaimer_accepted_at || data.created_at),
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at || data.created_at),
  };
}

/**
 * Custom API error class
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public body: string,
  ) {
    super(`API Error ${status}: ${body}`);
    this.name = 'ApiError';
  }
  
  get isUnauthorized(): boolean {
    return this.status === 401;
  }
  
  get isNotFound(): boolean {
    return this.status === 404;
  }
  
  get isServerError(): boolean {
    return this.status >= 500;
  }
}
