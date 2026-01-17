import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { YStack, XStack, Text, Card, ScrollView } from 'tamagui';
import { useRaids } from '@/hooks/use-raids';
import { formatInventoryValue } from '@/constants/raid-options';

export default function StatsScreen() {
  const { stats, raids } = useRaids();
  const insets = useSafeAreaInsets();

  // Get map breakdown
  const mapStats = raids.reduce((acc, raid) => {
    if (!acc[raid.map]) {
      acc[raid.map] = { total: 0, successful: 0 };
    }
    acc[raid.map].total++;
    if (raid.successful) {
      acc[raid.map].successful++;
    }
    return acc;
  }, {} as Record<string, { total: number; successful: number }>);

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0a0b', paddingTop: insets.top }}>
      <YStack flex={1} padding="$4">
        <Text 
          fontSize={28} 
          fontWeight="700" 
          color="$color" 
          marginBottom="$4"
        >
          Stats
        </Text>

        {raids.length === 0 ? (
          <YStack flex={1} justifyContent="center" alignItems="center" gap="$3">
            <Text fontSize={32} opacity={0.5}>
              📊
            </Text>
            <Text color="$textMuted" fontSize={16} textAlign="center">
              No stats yet
            </Text>
            <Text color="$textDim" fontSize={14} textAlign="center">
              Log some raids to see your statistics
            </Text>
          </YStack>
        ) : (
          <ScrollView flex={1} showsVerticalScrollIndicator={false}>
            <YStack gap="$4" paddingBottom="$8">
              {/* Overview Cards */}
              <XStack gap="$3">
                <StatCard
                  label="Total Raids"
                  value={stats.total.toString()}
                  flex={1}
                />
                <StatCard
                  label="Success Rate"
                  value={`${stats.successRate.toFixed(0)}%`}
                  valueColor={stats.successRate >= 50 ? '$success' : '$danger'}
                  flex={1}
                />
              </XStack>

              <XStack gap="$3">
                <StatCard
                  label="Extracted"
                  value={stats.successful.toString()}
                  valueColor="$success"
                  flex={1}
                />
                <StatCard
                  label="Died"
                  value={stats.failed.toString()}
                  valueColor="$danger"
                  flex={1}
                />
              </XStack>

              <XStack gap="$3">
                <StatCard
                  label="Total Loot"
                  value={formatInventoryValue(stats.totalValue)}
                  valueColor="$primary"
                  flex={1}
                />
                <StatCard
                  label="Avg Loot"
                  value={formatInventoryValue(Math.round(stats.avgValue))}
                  flex={1}
                />
              </XStack>

              <StatCard
                label="Squad Kills"
                value={stats.totalKills.toString()}
              />

              {/* Map Breakdown */}
              {Object.keys(mapStats).length > 0 && (
                <YStack gap="$3" marginTop="$2">
                  <Text color="$textMuted" fontSize={14} fontWeight="500">
                    By Map
                  </Text>
                  {Object.entries(mapStats).map(([map, data]) => (
                    <Card
                      key={map}
                      backgroundColor="$surface"
                      padding="$3"
                      borderRadius="$2"
                    >
                      <XStack justifyContent="space-between" alignItems="center">
                        <Text color="$color" fontWeight="500" fontSize={14}>
                          {map}
                        </Text>
                        <XStack gap="$3" alignItems="center">
                          <Text color="$textMuted" fontSize={12}>
                            {data.total} raids
                          </Text>
                          <Text
                            color={
                              data.successful / data.total >= 0.5
                                ? '$success'
                                : '$danger'
                            }
                            fontWeight="600"
                            fontSize={14}
                          >
                            {((data.successful / data.total) * 100).toFixed(0)}%
                          </Text>
                        </XStack>
                      </XStack>
                    </Card>
                  ))}
                </YStack>
              )}

              {/* Placeholder for future charts */}
              <Card
                backgroundColor="$surface"
                padding="$6"
                borderRadius="$3"
                marginTop="$4"
                borderColor="$border"
                borderWidth={1}
                borderStyle="dashed"
              >
                <YStack alignItems="center" gap="$2">
                  <Text color="$textDim" fontSize={14}>
                    📈 Charts coming soon
                  </Text>
                  <Text color="$textDim" fontSize={12} textAlign="center">
                    Success rate over time, loot trends, and more
                  </Text>
                </YStack>
              </Card>
            </YStack>
          </ScrollView>
        )}
      </YStack>
    </View>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  valueColor?: string;
  flex?: number;
}

function StatCard({ label, value, valueColor = '$color', flex }: StatCardProps) {
  return (
    <Card
      backgroundColor="$surface"
      padding="$4"
      borderRadius="$3"
      flex={flex}
    >
      <YStack gap="$1">
        <Text color="$textMuted" fontSize={11} textTransform="uppercase">
          {label}
        </Text>
        <Text color={valueColor} fontSize={22} fontWeight="700">
          {value}
        </Text>
      </YStack>
    </Card>
  );
}
