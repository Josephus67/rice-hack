/**
 * User-related type definitions
 */

export type UserRole = 'Buyer' | 'Miller' | 'Trader' | 'Quality Assessor' | 'Other';

export interface UserProfile {
  id: string;
  username: string;
  role: UserRole;
  organization?: string;
  locationOptIn: boolean;
  disclaimerAcceptedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  username: string;
  role: UserRole;
  organization?: string;
  locationOptIn: boolean;
}

export interface UserSettings {
  key: string;
  value: string;
}
