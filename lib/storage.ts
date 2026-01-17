import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import type { Raid, RaidFormData, Teammate } from '@/types/raid';

const RAIDS_KEY = '@raids';
const TEAMMATES_KEY = '@teammates';

// ============ RAIDS ============

export async function getRaids(): Promise<Raid[]> {
  try {
    const data = await AsyncStorage.getItem(RAIDS_KEY);
    if (!data) return [];
    return JSON.parse(data) as Raid[];
  } catch (error) {
    console.error('Error reading raids:', error);
    return [];
  }
}

export async function saveRaid(formData: RaidFormData): Promise<Raid> {
  const raids = await getRaids();
  
  const newRaid: Raid = {
    ...formData,
    id: Crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  
  // Add new raid at the beginning (most recent first)
  raids.unshift(newRaid);
  
  await AsyncStorage.setItem(RAIDS_KEY, JSON.stringify(raids));
  
  // Also update teammates list with any new teammates
  if (formData.teammates.length > 0) {
    await addTeammates(formData.teammates);
  }
  
  return newRaid;
}

export async function updateRaid(id: string, updates: Partial<RaidFormData>): Promise<Raid | null> {
  const raids = await getRaids();
  const index = raids.findIndex((r) => r.id === id);
  
  if (index === -1) return null;
  
  raids[index] = { ...raids[index], ...updates };
  await AsyncStorage.setItem(RAIDS_KEY, JSON.stringify(raids));
  
  return raids[index];
}

export async function deleteRaid(id: string): Promise<boolean> {
  const raids = await getRaids();
  const filtered = raids.filter((r) => r.id !== id);
  
  if (filtered.length === raids.length) return false;
  
  await AsyncStorage.setItem(RAIDS_KEY, JSON.stringify(filtered));
  return true;
}

export async function getLastRaid(): Promise<Raid | null> {
  const raids = await getRaids();
  return raids[0] || null;
}

// ============ TEAMMATES ============

export async function getTeammates(): Promise<Teammate[]> {
  try {
    const data = await AsyncStorage.getItem(TEAMMATES_KEY);
    if (!data) return [];
    return JSON.parse(data) as Teammate[];
  } catch (error) {
    console.error('Error reading teammates:', error);
    return [];
  }
}

export async function addTeammates(usernames: string[]): Promise<void> {
  const teammates = await getTeammates();
  const now = new Date().toISOString();
  
  for (const username of usernames) {
    const normalized = username.trim();
    if (!normalized) continue;
    
    const existingIndex = teammates.findIndex(
      (t) => t.username.toLowerCase() === normalized.toLowerCase()
    );
    
    if (existingIndex >= 0) {
      // Update lastPlayed
      teammates[existingIndex].lastPlayed = now;
    } else {
      // Add new teammate
      teammates.push({ username: normalized, lastPlayed: now });
    }
  }
  
  // Sort by lastPlayed (most recent first)
  teammates.sort((a, b) => 
    new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime()
  );
  
  await AsyncStorage.setItem(TEAMMATES_KEY, JSON.stringify(teammates));
}

export async function addTeammate(username: string): Promise<Teammate> {
  await addTeammates([username]);
  const teammates = await getTeammates();
  return teammates.find((t) => t.username.toLowerCase() === username.toLowerCase())!;
}

export async function deleteTeammate(username: string): Promise<boolean> {
  const teammates = await getTeammates();
  const filtered = teammates.filter(
    (t) => t.username.toLowerCase() !== username.toLowerCase()
  );
  
  if (filtered.length === teammates.length) return false;
  
  await AsyncStorage.setItem(TEAMMATES_KEY, JSON.stringify(filtered));
  return true;
}

// ============ EXPORT ============

export async function exportData(): Promise<{ raids: Raid[]; teammates: Teammate[] }> {
  const [raids, teammates] = await Promise.all([getRaids(), getTeammates()]);
  return { raids, teammates };
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove([RAIDS_KEY, TEAMMATES_KEY]);
}
