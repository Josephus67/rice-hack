/**
 * User Repository
 * CRUD operations for user data
 */

import { getDatabase } from './database-manager';
import type { UserProfile, CreateUserInput } from '@/types';

/**
 * Create a new user
 */
export async function createUser(input: CreateUserInput & { id: string }): Promise<UserProfile> {
  const db = await getDatabase();
  const now = new Date();
  
  const user: UserProfile = {
    id: input.id,
    username: input.username,
    role: input.role,
    organization: input.organization,
    locationOptIn: input.locationOptIn,
    disclaimerAcceptedAt: now,
    createdAt: now,
    updatedAt: now,
  };

  await db.runAsync(
    `INSERT INTO users (id, username, role, organization, location_opt_in, disclaimer_accepted_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user.id,
      user.username,
      user.role,
      user.organization ?? null,
      user.locationOptIn ? 1 : 0,
      user.disclaimerAcceptedAt.toISOString(),
      user.createdAt.toISOString(),
      user.updatedAt.toISOString(),
    ]
  );

  return user;
}

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<UserProfile | null> {
  const db = await getDatabase();
  
  const row = await db.getFirstAsync<{
    id: string;
    username: string;
    role: string;
    organization: string | null;
    location_opt_in: number;
    disclaimer_accepted_at: string;
    created_at: string;
    updated_at: string;
  }>(
    'SELECT * FROM users WHERE id = ?',
    [id]
  );

  if (!row) return null;

  return {
    id: row.id,
    username: row.username,
    role: row.role as UserProfile['role'],
    organization: row.organization ?? undefined,
    locationOptIn: row.location_opt_in === 1,
    disclaimerAcceptedAt: new Date(row.disclaimer_accepted_at),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * Get the first/current user
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  const db = await getDatabase();
  
  const row = await db.getFirstAsync<{
    id: string;
    username: string;
    role: string;
    organization: string | null;
    location_opt_in: number;
    disclaimer_accepted_at: string;
    created_at: string;
    updated_at: string;
  }>(
    'SELECT * FROM users ORDER BY created_at DESC LIMIT 1'
  );

  if (!row) return null;

  return {
    id: row.id,
    username: row.username,
    role: row.role as UserProfile['role'],
    organization: row.organization ?? undefined,
    locationOptIn: row.location_opt_in === 1,
    disclaimerAcceptedAt: new Date(row.disclaimer_accepted_at),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * Update user
 */
export async function updateUser(
  id: string,
  updates: Partial<Omit<UserProfile, 'id' | 'createdAt'>>
): Promise<void> {
  const db = await getDatabase();
  
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (updates.username !== undefined) {
    fields.push('username = ?');
    values.push(updates.username);
  }
  if (updates.role !== undefined) {
    fields.push('role = ?');
    values.push(updates.role);
  }
  if (updates.organization !== undefined) {
    fields.push('organization = ?');
    values.push(updates.organization ?? null);
  }
  if (updates.locationOptIn !== undefined) {
    fields.push('location_opt_in = ?');
    values.push(updates.locationOptIn ? 1 : 0);
  }

  fields.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(id);

  await db.runAsync(
    `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
}

/**
 * Delete user
 */
export async function deleteUser(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM users WHERE id = ?', [id]);
}
