import type { Raid } from '@/types/raid';

// ============ TYPES ============

export interface StatGroup {
  label: string;
  total: number;
  successful: number;
  successRate: number;
  avgLoot: number;
  totalLoot: number;
}

export interface StreakData {
  current: { type: 'win' | 'loss' | 'none'; count: number };
  bestWin: number;
  worstLoss: number;
}

export interface LootAnalysis {
  totalLoot: number;
  totalLoss: number;
  avgLootOnWin: number;
  avgLossOnDeath: number;
  lootPerMinute: number;
  byMap: Record<string, { avgLoot: number; totalLoot: number; count: number }>;
  byCondition: Record<string, { avgLoot: number; totalLoot: number; count: number }>;
}

export interface PerformanceTrend {
  recent: number; // Last 10 raids success rate
  overall: number;
  trend: 'improving' | 'declining' | 'stable';
}

// ============ STREAK CALCULATIONS ============

export function getStreaks(raids: Raid[]): StreakData {
  if (raids.length === 0) {
    return { current: { type: 'none', count: 0 }, bestWin: 0, worstLoss: 0 };
  }

  // Raids are sorted newest first, so reverse for chronological order
  const chronological = [...raids].reverse();
  
  let currentStreak = 0;
  let currentType: 'win' | 'loss' = chronological[chronological.length - 1].successful ? 'win' : 'loss';
  let bestWin = 0;
  let worstLoss = 0;
  let tempStreak = 0;
  let tempType: 'win' | 'loss' | null = null;

  for (const raid of chronological) {
    const isWin = raid.successful;
    
    if (tempType === null) {
      tempType = isWin ? 'win' : 'loss';
      tempStreak = 1;
    } else if ((isWin && tempType === 'win') || (!isWin && tempType === 'loss')) {
      tempStreak++;
    } else {
      // Streak broken, record it
      if (tempType === 'win' && tempStreak > bestWin) {
        bestWin = tempStreak;
      } else if (tempType === 'loss' && tempStreak > worstLoss) {
        worstLoss = tempStreak;
      }
      tempType = isWin ? 'win' : 'loss';
      tempStreak = 1;
    }
  }

  // Don't forget the final streak
  if (tempType === 'win' && tempStreak > bestWin) {
    bestWin = tempStreak;
  } else if (tempType === 'loss' && tempStreak > worstLoss) {
    worstLoss = tempStreak;
  }

  // Current streak (from most recent raids)
  currentStreak = tempStreak;
  currentType = tempType as 'win' | 'loss';

  return {
    current: { type: currentType, count: currentStreak },
    bestWin,
    worstLoss,
  };
}

// ============ TIME PATTERNS ============

export function getStatsByDayOfWeek(raids: Raid[]): StatGroup[] {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const groups: Record<number, Raid[]> = {};

  for (const raid of raids) {
    const day = new Date(raid.createdAt).getDay();
    if (!groups[day]) groups[day] = [];
    groups[day].push(raid);
  }

  return days.map((label, index) => {
    const dayRaids = groups[index] || [];
    return createStatGroup(label, dayRaids);
  }).filter(g => g.total > 0);
}

export function getStatsByTimeOfDay(raids: Raid[]): StatGroup[] {
  const brackets = [
    { label: 'Morning (6am-12pm)', start: 6, end: 12 },
    { label: 'Afternoon (12pm-6pm)', start: 12, end: 18 },
    { label: 'Evening (6pm-12am)', start: 18, end: 24 },
    { label: 'Night (12am-6am)', start: 0, end: 6 },
  ];

  const groups: Record<string, Raid[]> = {};

  for (const raid of raids) {
    const hour = new Date(raid.createdAt).getHours();
    const bracket = brackets.find(b => 
      b.start <= b.end 
        ? hour >= b.start && hour < b.end
        : hour >= b.start || hour < b.end
    );
    if (bracket) {
      if (!groups[bracket.label]) groups[bracket.label] = [];
      groups[bracket.label].push(raid);
    }
  }

  return brackets
    .map(b => createStatGroup(b.label, groups[b.label] || []))
    .filter(g => g.total > 0);
}

export function getPerformanceTrend(raids: Raid[]): PerformanceTrend {
  const overall = raids.length > 0 
    ? (raids.filter(r => r.successful).length / raids.length) * 100 
    : 0;
  
  const recentRaids = raids.slice(0, 10);
  const recent = recentRaids.length > 0
    ? (recentRaids.filter(r => r.successful).length / recentRaids.length) * 100
    : 0;

  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (raids.length >= 10) {
    const diff = recent - overall;
    if (diff > 10) trend = 'improving';
    else if (diff < -10) trend = 'declining';
  }

  return { recent, overall, trend };
}

// ============ SQUAD ANALYSIS ============

export function getStatsBySquadSize(raids: Raid[]): StatGroup[] {
  const sizes = [
    { label: 'Solo', min: 0, max: 0 },
    { label: 'Duo', min: 1, max: 1 },
    { label: 'Trio', min: 2, max: 2 },
    { label: 'Full Squad', min: 3, max: 10 },
  ];

  const groups: Record<string, Raid[]> = {};

  for (const raid of raids) {
    const count = raid.teammates.length;
    const size = sizes.find(s => count >= s.min && count <= s.max);
    if (size) {
      if (!groups[size.label]) groups[size.label] = [];
      groups[size.label].push(raid);
    }
  }

  return sizes
    .map(s => createStatGroup(s.label, groups[s.label] || []))
    .filter(g => g.total > 0);
}

export function getStatsByTeammate(raids: Raid[]): StatGroup[] {
  const groups: Record<string, Raid[]> = {};

  for (const raid of raids) {
    for (const teammate of raid.teammates) {
      if (!groups[teammate]) groups[teammate] = [];
      groups[teammate].push(raid);
    }
  }

  return Object.entries(groups)
    .map(([name, teamRaids]) => createStatGroup(name, teamRaids))
    .sort((a, b) => b.total - a.total); // Sort by most played
}

export function getTeammateCombos(raids: Raid[]): StatGroup[] {
  const combos: Record<string, Raid[]> = {};

  for (const raid of raids) {
    if (raid.teammates.length >= 2) {
      // Generate all pairs
      for (let i = 0; i < raid.teammates.length; i++) {
        for (let j = i + 1; j < raid.teammates.length; j++) {
          const pair = [raid.teammates[i], raid.teammates[j]].sort().join(' + ');
          if (!combos[pair]) combos[pair] = [];
          combos[pair].push(raid);
        }
      }
    }
  }

  return Object.entries(combos)
    .map(([pair, pairRaids]) => createStatGroup(pair, pairRaids))
    .filter(g => g.total >= 2) // Only show combos with 2+ raids
    .sort((a, b) => b.successRate - a.successRate); // Sort by success rate
}

// ============ MAP STATISTICS ============

export function getStatsByMap(raids: Raid[]): StatGroup[] {
  const groups: Record<string, Raid[]> = {};

  for (const raid of raids) {
    if (!groups[raid.map]) groups[raid.map] = [];
    groups[raid.map].push(raid);
  }

  return Object.entries(groups)
    .map(([map, mapRaids]) => createStatGroup(map, mapRaids))
    .sort((a, b) => b.total - a.total);
}

export function getStatsByCondition(raids: Raid[]): StatGroup[] {
  const groups: Record<string, Raid[]> = {};

  for (const raid of raids) {
    const condition = raid.mapCondition || 'Normal';
    if (!groups[condition]) groups[condition] = [];
    groups[condition].push(raid);
  }

  return Object.entries(groups)
    .map(([condition, condRaids]) => createStatGroup(condition, condRaids))
    .sort((a, b) => b.total - a.total);
}

// ============ SPAWN TIME ANALYSIS ============

export function getStatsBySpawnBracket(raids: Raid[]): StatGroup[] {
  const brackets = [
    { label: 'Early (30-25m)', min: 25, max: 30 },
    { label: 'Mid-Early (24-20m)', min: 20, max: 24 },
    { label: 'Mid (19-15m)', min: 15, max: 19 },
    { label: 'Mid-Late (14-10m)', min: 10, max: 14 },
    { label: 'Late (under 10m)', min: 0, max: 9 },
  ];

  const groups: Record<string, Raid[]> = {};

  for (const raid of raids) {
    if (raid.raidStartMins === null) continue;
    const bracket = brackets.find(b => 
      raid.raidStartMins! >= b.min && raid.raidStartMins! <= b.max
    );
    if (bracket) {
      if (!groups[bracket.label]) groups[bracket.label] = [];
      groups[bracket.label].push(raid);
    }
  }

  return brackets
    .map(b => createStatGroup(b.label, groups[b.label] || []))
    .filter(g => g.total > 0);
}

// ============ RAID DURATION ANALYSIS ============

export function getStatsByDuration(raids: Raid[]): StatGroup[] {
  const brackets = [
    { label: 'Quick (under 10m)', min: 0, max: 9 },
    { label: 'Medium (10-20m)', min: 10, max: 20 },
    { label: 'Long (20m+)', min: 21, max: 999 },
  ];

  const groups: Record<string, Raid[]> = {};

  for (const raid of raids) {
    if (raid.raidDurationMins === null) continue;
    const bracket = brackets.find(b => 
      raid.raidDurationMins! >= b.min && raid.raidDurationMins! <= b.max
    );
    if (bracket) {
      if (!groups[bracket.label]) groups[bracket.label] = [];
      groups[bracket.label].push(raid);
    }
  }

  return brackets
    .map(b => createStatGroup(b.label, groups[b.label] || []))
    .filter(g => g.total > 0);
}

export function getAvgDurationByOutcome(raids: Raid[]): { win: number; loss: number } {
  const wins = raids.filter(r => r.successful && r.raidDurationMins !== null);
  const losses = raids.filter(r => !r.successful && r.raidDurationMins !== null);

  return {
    win: wins.length > 0 
      ? wins.reduce((sum, r) => sum + (r.raidDurationMins || 0), 0) / wins.length 
      : 0,
    loss: losses.length > 0 
      ? losses.reduce((sum, r) => sum + (r.raidDurationMins || 0), 0) / losses.length 
      : 0,
  };
}

// ============ LOOT ANALYSIS ============

// Helper to calculate profit from a raid (handles legacy data)
function getRaidProfit(raid: Raid): number | null {
  if (raid.successful && raid.extractValue !== null && raid.bringInValue !== null) {
    return raid.extractValue - raid.bringInValue;
  }
  if (raid.successful && raid.extractValue !== null) {
    return raid.extractValue; // No bring-in, so extract is pure profit
  }
  // LEGACY: Old data with inventoryValue - treat as profit
  if (raid.successful && raid.inventoryValue !== undefined && raid.inventoryValue !== null) {
    return raid.inventoryValue;
  }
  return null;
}

// Helper to get loss from a raid (handles legacy data)
function getRaidLoss(raid: Raid): number | null {
  if (!raid.successful && raid.bringInValue !== null) {
    return raid.bringInValue;
  }
  // LEGACY: Old data with inventoryValue on death - treat as loss
  if (!raid.successful && raid.inventoryValue !== undefined && raid.inventoryValue !== null) {
    return raid.inventoryValue;
  }
  return null;
}

export function getLootAnalysis(raids: Raid[]): LootAnalysis {
  // Wins with profit calculable
  const winsWithProfit = raids.filter(r => r.successful && getRaidProfit(r) !== null);
  // Losses with bring-in value (the loss)
  const lossesWithValue = raids.filter(r => !r.successful && r.bringInValue !== null);
  // Raids with duration and profit for efficiency calc
  const withDuration = raids.filter(r => 
    r.raidDurationMins && r.raidDurationMins > 0 && getRaidProfit(r) !== null
  );

  const totalProfit = winsWithProfit.reduce((sum, r) => sum + (getRaidProfit(r) || 0), 0);
  const totalLoss = lossesWithValue.reduce((sum, r) => sum + (r.bringInValue || 0), 0);

  // Profit by map (wins only)
  const byMap: Record<string, { avgLoot: number; totalLoot: number; count: number }> = {};
  for (const raid of winsWithProfit) {
    const profit = getRaidProfit(raid) || 0;
    if (!byMap[raid.map]) byMap[raid.map] = { avgLoot: 0, totalLoot: 0, count: 0 };
    byMap[raid.map].totalLoot += profit;
    byMap[raid.map].count++;
  }
  for (const map in byMap) {
    byMap[map].avgLoot = byMap[map].totalLoot / byMap[map].count;
  }

  // Profit by condition (wins only)
  const byCondition: Record<string, { avgLoot: number; totalLoot: number; count: number }> = {};
  for (const raid of winsWithProfit) {
    const profit = getRaidProfit(raid) || 0;
    const condition = raid.mapCondition || 'Normal';
    if (!byCondition[condition]) byCondition[condition] = { avgLoot: 0, totalLoot: 0, count: 0 };
    byCondition[condition].totalLoot += profit;
    byCondition[condition].count++;
  }
  for (const condition in byCondition) {
    byCondition[condition].avgLoot = byCondition[condition].totalLoot / byCondition[condition].count;
  }

  // Profit per minute
  let lootPerMinute = 0;
  if (withDuration.length > 0) {
    const totalProfitWithTime = withDuration.reduce((sum, r) => sum + (getRaidProfit(r) || 0), 0);
    const totalMinutes = withDuration.reduce((sum, r) => sum + (r.raidDurationMins || 0), 0);
    lootPerMinute = totalMinutes > 0 ? totalProfitWithTime / totalMinutes : 0;
  }

  return {
    totalLoot: totalProfit,
    totalLoss,
    avgLootOnWin: winsWithProfit.length > 0 ? totalProfit / winsWithProfit.length : 0,
    avgLossOnDeath: lossesWithValue.length > 0 ? totalLoss / lossesWithValue.length : 0,
    lootPerMinute,
    byMap,
    byCondition,
  };
}

// ============ SEARCH HELPERS ============

export interface SearchableSection {
  id: string;
  title: string;
  keywords: string[];
}

export const STAT_SECTIONS: SearchableSection[] = [
  { id: 'overview', title: 'Overview', keywords: ['overview', 'total', 'success', 'rate', 'wins', 'deaths', 'streak'] },
  { id: 'time', title: 'Time Patterns', keywords: ['time', 'day', 'week', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'morning', 'afternoon', 'evening', 'night', 'trend', 'performance'] },
  { id: 'squad', title: 'Squad Analysis', keywords: ['squad', 'team', 'teammate', 'friend', 'solo', 'duo', 'trio', 'combo', 'partner', 'group'] },
  { id: 'map', title: 'Map Statistics', keywords: ['map', 'dam', 'buried', 'spaceport', 'stella', 'blue gate', 'location'] },
  { id: 'condition', title: 'Conditions', keywords: ['condition', 'weather', 'cold snap', 'night raid', 'storm', 'electromagnetic', 'hidden bunker', 'locked gate', 'normal'] },
  { id: 'spawn', title: 'Spawn Time', keywords: ['spawn', 'start', 'early', 'late', 'join', 'timer'] },
  { id: 'duration', title: 'Raid Duration', keywords: ['duration', 'time', 'quick', 'long', 'minutes', 'length'] },
  { id: 'loot', title: 'Profit Analysis', keywords: ['loot', 'value', 'money', 'profit', 'loss', 'efficiency', 'credits', 'bring in', 'extract'] },
];

export function searchSections(query: string): string[] {
  if (!query.trim()) return STAT_SECTIONS.map(s => s.id);
  
  const lowerQuery = query.toLowerCase();
  return STAT_SECTIONS
    .filter(section => 
      section.title.toLowerCase().includes(lowerQuery) ||
      section.keywords.some(kw => kw.includes(lowerQuery))
    )
    .map(s => s.id);
}

// ============ HELPER FUNCTIONS ============

function createStatGroup(label: string, raids: Raid[]): StatGroup {
  const successful = raids.filter(r => r.successful).length;
  // Calculate profit for each successful raid (handles legacy data)
  const withProfit = raids.filter(r => r.successful && getRaidProfit(r) !== null);
  const totalProfit = withProfit.reduce((sum, r) => sum + (getRaidProfit(r) || 0), 0);

  return {
    label,
    total: raids.length,
    successful,
    successRate: raids.length > 0 ? (successful / raids.length) * 100 : 0,
    avgLoot: withProfit.length > 0 ? totalProfit / withProfit.length : 0,
    totalLoot: totalProfit,
  };
}
