// Map options - official Arc Raiders maps
export const MAPS = [
  'Dam Battlegrounds',
  'Buried City',
  'Spaceport',
  'Stella Montis',
  'Blue Gate',
] as const;

export type MapName = (typeof MAPS)[number];

// Map conditions/variations
export const MAP_CONDITIONS = [
  'Normal',
  'Cold Snap',
  'Night Raid',
  'Electromagnetic Storm',
  'Hidden Bunker',    // Spaceport only
  'Locked Gate',      // Blue Gate only
] as const;

export type MapCondition = (typeof MAP_CONDITIONS)[number];

// Map-specific conditions
export const MAP_SPECIFIC_CONDITIONS: Record<string, MapCondition[]> = {
  'Spaceport': ['Hidden Bunker'],
  'Blue Gate': ['Locked Gate'],
};

// Conditions available for all maps
export const UNIVERSAL_CONDITIONS: MapCondition[] = [
  'Normal',
  'Cold Snap',
  'Night Raid',
  'Electromagnetic Storm',
];

// Get available conditions for a specific map
export function getConditionsForMap(map: string): MapCondition[] {
  const specific = MAP_SPECIFIC_CONDITIONS[map] || [];
  return [...UNIVERSAL_CONDITIONS, ...specific];
}

// Predefined inventory values for quick selection (in credits)
export const INVENTORY_VALUES = [
  100000,
  90000,
  80000,
  75000,
  70000,
  65000,
  60000,
  55000,
  50000,
  45000,
  40000,
  35000,
  30000,
  25000,
  20000,
  15000,
  10000,
] as const;

// Predefined raid durations in minutes
export const RAID_DURATIONS = [
  10,
  15,
  20,
  25,
  30,
  35,
  40,
  45,
] as const;

// Quick squad kill options
export const SQUAD_KILLS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

// Format helpers
export function formatInventoryValue(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '-';
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}k`;
  }
  return value.toString();
}

export function formatDuration(minutes: number): string {
  return `${minutes} min`;
}

export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString([], { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
