export interface Raid {
  id: string;
  createdAt: string; // ISO timestamp
  successful: boolean;
  map: string;
  mapCondition: string | null; // e.g., "Cold Snap", "Night Raid"
  teammates: string[];
  bringInValue: number | null; // What you brought into the raid (potential loss)
  extractValue: number | null; // What you extracted with (only if successful)
  inventoryValue?: number | null; // LEGACY: Old field, kept for backward compatibility
  raidDurationMins: number | null; // How long you were in the raid
  raidStartMins: number | null; // In-game countdown time when you started (e.g., 30, 18, etc.)
  squadKills: number | null;
}

export type RaidFormData = Omit<Raid, 'id' | 'createdAt'>;

export interface Teammate {
  username: string;
  lastPlayed: string; // ISO timestamp for sorting by recency
}
