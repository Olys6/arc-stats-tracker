import { useState, useMemo, useCallback } from 'react';
import { View, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { YStack, XStack, Text, Card, ScrollView, Input } from 'tamagui';
import { useRaids } from '@/hooks/use-raids';
import { StatSection } from '@/components/stats/stat-section';
import { StatRow, StatValue, DurationCompare, LootStat } from '@/components/stats/stat-row';
import {
  getStreaks,
  getStatsByDayOfWeek,
  getStatsByTimeOfDay,
  getPerformanceTrend,
  getStatsBySquadSize,
  getStatsByTeammate,
  getTeammateCombos,
  getStatsByMap,
  getStatsByCondition,
  getStatsBySpawnBracket,
  getStatsByDuration,
  getAvgDurationByOutcome,
  getLootAnalysis,
  searchSections,
} from '@/lib/stats';

export default function StatsScreen() {
  const { stats, raids, refresh } = useRaids();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  // Calculate all stats
  const streaks = useMemo(() => getStreaks(raids), [raids]);
  const dayOfWeekStats = useMemo(() => getStatsByDayOfWeek(raids), [raids]);
  const timeOfDayStats = useMemo(() => getStatsByTimeOfDay(raids), [raids]);
  const performanceTrend = useMemo(() => getPerformanceTrend(raids), [raids]);
  const squadSizeStats = useMemo(() => getStatsBySquadSize(raids), [raids]);
  const teammateStats = useMemo(() => getStatsByTeammate(raids), [raids]);
  const teammateCombos = useMemo(() => getTeammateCombos(raids), [raids]);
  const mapStats = useMemo(() => getStatsByMap(raids), [raids]);
  const conditionStats = useMemo(() => getStatsByCondition(raids), [raids]);
  const spawnStats = useMemo(() => getStatsBySpawnBracket(raids), [raids]);
  const durationStats = useMemo(() => getStatsByDuration(raids), [raids]);
  const durationByOutcome = useMemo(() => getAvgDurationByOutcome(raids), [raids]);
  const lootAnalysis = useMemo(() => getLootAnalysis(raids), [raids]);

  // Search filtering
  const visibleSections = useMemo(() => searchSections(searchQuery), [searchQuery]);
  const isVisible = (sectionId: string) => visibleSections.includes(sectionId);

  // Streak display
  const streakDisplay = streaks.current.type === 'win' 
    ? `W${streaks.current.count}` 
    : streaks.current.type === 'loss' 
      ? `L${streaks.current.count}` 
      : '-';
  const streakColor = streaks.current.type === 'win' ? '$success' : streaks.current.type === 'loss' ? '$danger' : '$textMuted';

  // Trend display
  const trendIcon = performanceTrend.trend === 'improving' ? '📈' : performanceTrend.trend === 'declining' ? '📉' : '➡️';

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0a0b', paddingTop: insets.top }}>
      <YStack flex={1} padding="$4">
        <Text 
          fontSize={28} 
          fontWeight="700" 
          color="$color" 
          marginBottom="$2"
        >
          Stats
        </Text>

        {/* Search Bar */}
        <Input
          height={44}
          placeholder="Search stats..."
          placeholderTextColor="$textDim"
          backgroundColor="$surface"
          borderColor="$border"
          borderRadius="$2"
          color="$color"
          fontSize={14}
          paddingHorizontal="$3"
          marginBottom="$4"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <ScrollView 
          flex={1} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#00d4ff"
            />
          }
        >
          {raids.length === 0 ? (
            <YStack flex={1} justifyContent="center" alignItems="center" gap="$3" paddingTop="$10">
              <Text fontSize={32} opacity={0.5}>
                📊
              </Text>
              <Text color="$textMuted" fontSize={16} textAlign="center">
                No stats yet
              </Text>
              <Text color="$textDim" fontSize={14} textAlign="center">
                Log some raids to see your statistics
              </Text>
              <Text color="$textDim" fontSize={12} textAlign="center" marginTop="$2">
                Pull down to refresh
              </Text>
            </YStack>
          ) : (
            <YStack gap="$3" paddingBottom="$8">
              
              {/* Overview Section - Always visible when matching search */}
              {isVisible('overview') && (
                <YStack gap="$3">
                  {/* Main Stats */}
                  <XStack gap="$3">
                    <Card backgroundColor="$surface" padding="$4" borderRadius="$3" flex={1}>
                      <StatValue label="Total Raids" value={stats.total} />
                    </Card>
                    <Card backgroundColor="$surface" padding="$4" borderRadius="$3" flex={1}>
                      <StatValue 
                        label="Success Rate" 
                        value={`${stats.successRate.toFixed(0)}%`}
                        color={stats.successRate >= 50 ? '$success' : '$danger'}
                      />
                    </Card>
                  </XStack>

                  <XStack gap="$3">
                    <Card backgroundColor="$surface" padding="$4" borderRadius="$3" flex={1}>
                      <StatValue label="Extracted" value={stats.successful} color="$success" />
                    </Card>
                    <Card backgroundColor="$surface" padding="$4" borderRadius="$3" flex={1}>
                      <StatValue label="Died" value={stats.failed} color="$danger" />
                    </Card>
                  </XStack>

                  {/* Streak Card */}
                  <Card backgroundColor="$surface" padding="$4" borderRadius="$3">
                    <XStack justifyContent="space-between" alignItems="center">
                      <YStack>
                        <Text color="$textMuted" fontSize={10} textTransform="uppercase">
                          Current Streak
                        </Text>
                        <Text color={streakColor} fontSize={24} fontWeight="700">
                          {streakDisplay}
                        </Text>
                      </YStack>
                      <YStack alignItems="center">
                        <Text color="$textMuted" fontSize={10}>BEST WIN</Text>
                        <Text color="$success" fontSize={16} fontWeight="600">
                          {streaks.bestWin > 0 ? `W${streaks.bestWin}` : '-'}
                        </Text>
                      </YStack>
                      <YStack alignItems="center">
                        <Text color="$textMuted" fontSize={10}>WORST LOSS</Text>
                        <Text color="$danger" fontSize={16} fontWeight="600">
                          {streaks.worstLoss > 0 ? `L${streaks.worstLoss}` : '-'}
                        </Text>
                      </YStack>
                    </XStack>
                  </Card>

                  {/* Trend Card */}
                  {raids.length >= 10 && (
                    <Card backgroundColor="$surface" padding="$4" borderRadius="$3">
                      <XStack justifyContent="space-between" alignItems="center">
                        <YStack>
                          <Text color="$textMuted" fontSize={10} textTransform="uppercase">
                            Performance Trend
                          </Text>
                          <XStack alignItems="center" gap="$2">
                            <Text fontSize={20}>{trendIcon}</Text>
                            <Text color="$color" fontSize={14} fontWeight="500">
                              {performanceTrend.trend === 'improving' ? 'Improving' : 
                               performanceTrend.trend === 'declining' ? 'Declining' : 'Stable'}
                            </Text>
                          </XStack>
                        </YStack>
                        <YStack alignItems="flex-end">
                          <Text color="$textMuted" fontSize={10}>LAST 10</Text>
                          <Text 
                            color={performanceTrend.recent >= 50 ? '$success' : '$danger'} 
                            fontSize={16} 
                            fontWeight="600"
                          >
                            {performanceTrend.recent.toFixed(0)}%
                          </Text>
                        </YStack>
                      </XStack>
                    </Card>
                  )}
                </YStack>
              )}

              {/* Time Patterns */}
              {isVisible('time') && (dayOfWeekStats.length > 0 || timeOfDayStats.length > 0) && (
                <StatSection title="Time Patterns">
                  {dayOfWeekStats.length > 0 && (
                    <YStack gap="$2">
                      <Text color="$textMuted" fontSize={12} fontWeight="500">By Day of Week</Text>
                      {dayOfWeekStats.map((stat) => (
                        <StatRow 
                          key={stat.label}
                          label={stat.label}
                          count={stat.total}
                          successRate={stat.successRate}
                        />
                      ))}
                    </YStack>
                  )}
                  {timeOfDayStats.length > 0 && (
                    <YStack gap="$2" marginTop="$3">
                      <Text color="$textMuted" fontSize={12} fontWeight="500">By Time of Day</Text>
                      {timeOfDayStats.map((stat) => (
                        <StatRow 
                          key={stat.label}
                          label={stat.label}
                          count={stat.total}
                          successRate={stat.successRate}
                        />
                      ))}
                    </YStack>
                  )}
                </StatSection>
              )}

              {/* Squad Analysis */}
              {isVisible('squad') && (squadSizeStats.length > 0 || teammateStats.length > 0) && (
                <StatSection title="Squad Analysis">
                  {squadSizeStats.length > 0 && (
                    <YStack gap="$2">
                      <Text color="$textMuted" fontSize={12} fontWeight="500">By Squad Size</Text>
                      {squadSizeStats.map((stat) => (
                        <StatRow 
                          key={stat.label}
                          label={stat.label}
                          count={stat.total}
                          successRate={stat.successRate}
                          avgLoot={stat.avgLoot}
                          showLoot
                        />
                      ))}
                    </YStack>
                  )}
                  {teammateStats.length > 0 && (
                    <YStack gap="$2" marginTop="$3">
                      <Text color="$textMuted" fontSize={12} fontWeight="500">By Teammate</Text>
                      {teammateStats.slice(0, 10).map((stat) => (
                        <StatRow 
                          key={stat.label}
                          label={stat.label}
                          count={stat.total}
                          successRate={stat.successRate}
                          avgLoot={stat.avgLoot}
                          showLoot
                        />
                      ))}
                    </YStack>
                  )}
                  {teammateCombos.length > 0 && (
                    <YStack gap="$2" marginTop="$3">
                      <Text color="$textMuted" fontSize={12} fontWeight="500">Best Teammate Combos</Text>
                      {teammateCombos.slice(0, 5).map((stat) => (
                        <StatRow 
                          key={stat.label}
                          label={stat.label}
                          count={stat.total}
                          successRate={stat.successRate}
                        />
                      ))}
                    </YStack>
                  )}
                </StatSection>
              )}

              {/* Map Statistics */}
              {isVisible('map') && mapStats.length > 0 && (
                <StatSection title="Map Statistics">
                  {mapStats.map((stat) => (
                    <StatRow 
                      key={stat.label}
                      label={stat.label}
                      count={stat.total}
                      successRate={stat.successRate}
                      avgLoot={stat.avgLoot}
                      showLoot
                    />
                  ))}
                </StatSection>
              )}

              {/* Conditions */}
              {isVisible('condition') && conditionStats.length > 0 && (
                <StatSection title="Conditions">
                  {conditionStats.map((stat) => (
                    <StatRow 
                      key={stat.label}
                      label={stat.label}
                      count={stat.total}
                      successRate={stat.successRate}
                      avgLoot={stat.avgLoot}
                      showLoot
                    />
                  ))}
                </StatSection>
              )}

              {/* Spawn Time */}
              {isVisible('spawn') && spawnStats.length > 0 && (
                <StatSection title="Spawn Time">
                  {spawnStats.map((stat) => (
                    <StatRow 
                      key={stat.label}
                      label={stat.label}
                      count={stat.total}
                      successRate={stat.successRate}
                    />
                  ))}
                </StatSection>
              )}

              {/* Raid Duration */}
              {isVisible('duration') && (durationStats.length > 0 || durationByOutcome.win > 0) && (
                <StatSection title="Raid Duration">
                  {durationStats.length > 0 && (
                    <YStack gap="$2">
                      {durationStats.map((stat) => (
                        <StatRow 
                          key={stat.label}
                          label={stat.label}
                          count={stat.total}
                          successRate={stat.successRate}
                        />
                      ))}
                    </YStack>
                  )}
                  {(durationByOutcome.win > 0 || durationByOutcome.loss > 0) && (
                    <YStack marginTop="$3">
                      <Text color="$textMuted" fontSize={12} fontWeight="500" marginBottom="$2">
                        Average Duration
                      </Text>
                      <DurationCompare 
                        winDuration={durationByOutcome.win}
                        lossDuration={durationByOutcome.loss}
                      />
                    </YStack>
                  )}
                </StatSection>
              )}

              {/* Loot Analysis */}
              {isVisible('loot') && (lootAnalysis.totalLoot > 0 || lootAnalysis.totalLoss > 0) && (
                <StatSection title="Profit Analysis">
                  <YStack gap="$2">
                    <LootStat label="Total Profit" value={lootAnalysis.totalLoot} color="$success" />
                    <LootStat label="Total Lost" value={lootAnalysis.totalLoss} color="$danger" />
                    <LootStat label="Avg Profit (Wins)" value={lootAnalysis.avgLootOnWin} />
                    <LootStat label="Avg Loss (Deaths)" value={lootAnalysis.avgLossOnDeath} color="$danger" />
                    {lootAnalysis.lootPerMinute > 0 && (
                      <LootStat label="Loot per Minute" value={Math.round(lootAnalysis.lootPerMinute)} />
                    )}
                  </YStack>

                  {Object.keys(lootAnalysis.byMap).length > 0 && (
                    <YStack gap="$2" marginTop="$3">
                      <Text color="$textMuted" fontSize={12} fontWeight="500">Avg Profit by Map</Text>
                      {Object.entries(lootAnalysis.byMap)
                        .sort((a, b) => b[1].avgLoot - a[1].avgLoot)
                        .map(([map, data]) => (
                          <LootStat key={map} label={map} value={data.avgLoot} />
                        ))}
                    </YStack>
                  )}

                  {Object.keys(lootAnalysis.byCondition).length > 0 && (
                    <YStack gap="$2" marginTop="$3">
                      <Text color="$textMuted" fontSize={12} fontWeight="500">Avg Profit by Condition</Text>
                      {Object.entries(lootAnalysis.byCondition)
                        .sort((a, b) => b[1].avgLoot - a[1].avgLoot)
                        .map(([condition, data]) => (
                          <LootStat key={condition} label={condition} value={data.avgLoot} />
                        ))}
                    </YStack>
                  )}
                </StatSection>
              )}

            </YStack>
          )}
        </ScrollView>
      </YStack>
    </View>
  );
}
