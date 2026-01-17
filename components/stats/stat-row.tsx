import { XStack, YStack, Text } from 'tamagui';
import { formatInventoryValue } from '@/constants/raid-options';

interface StatRowProps {
  label: string;
  count: number;
  successRate: number;
  avgLoot?: number;
  showLoot?: boolean;
}

export function StatRow({ label, count, successRate, avgLoot, showLoot = false }: StatRowProps) {
  const rateColor = successRate >= 50 ? '$success' : '$danger';
  
  return (
    <XStack 
      justifyContent="space-between" 
      alignItems="center"
      paddingVertical="$2"
      paddingHorizontal="$2"
      backgroundColor="$background"
      borderRadius="$2"
    >
      <Text color="$color" fontSize={14} flex={1} numberOfLines={1}>
        {label}
      </Text>
      <XStack gap="$3" alignItems="center">
        {showLoot && avgLoot !== undefined && avgLoot > 0 && (
          <Text color="$primary" fontSize={12}>
            {formatInventoryValue(avgLoot)}
          </Text>
        )}
        <Text color="$textMuted" fontSize={12}>
          {count} {count === 1 ? 'raid' : 'raids'}
        </Text>
        <Text color={rateColor} fontSize={14} fontWeight="600" minWidth={45} textAlign="right">
          {successRate.toFixed(0)}%
        </Text>
      </XStack>
    </XStack>
  );
}

// Compact version for inline stats
interface StatValueProps {
  label: string;
  value: string | number;
  color?: string;
}

export function StatValue({ label, value, color = '$color' }: StatValueProps) {
  return (
    <YStack alignItems="center" gap="$1">
      <Text color="$textMuted" fontSize={10} textTransform="uppercase">
        {label}
      </Text>
      <Text color={color} fontSize={18} fontWeight="700">
        {value}
      </Text>
    </YStack>
  );
}

// For showing duration comparisons
interface DurationCompareProps {
  winDuration: number;
  lossDuration: number;
}

export function DurationCompare({ winDuration, lossDuration }: DurationCompareProps) {
  return (
    <XStack 
      justifyContent="space-around" 
      paddingVertical="$3"
      backgroundColor="$background"
      borderRadius="$2"
    >
      <YStack alignItems="center" gap="$1">
        <Text color="$textMuted" fontSize={10}>AVG WHEN WIN</Text>
        <Text color="$success" fontSize={18} fontWeight="600">
          {winDuration > 0 ? `${winDuration.toFixed(0)}m` : '-'}
        </Text>
      </YStack>
      <YStack alignItems="center" gap="$1">
        <Text color="$textMuted" fontSize={10}>AVG WHEN LOSS</Text>
        <Text color="$danger" fontSize={18} fontWeight="600">
          {lossDuration > 0 ? `${lossDuration.toFixed(0)}m` : '-'}
        </Text>
      </YStack>
    </XStack>
  );
}

// For showing loot analysis
interface LootStatProps {
  label: string;
  value: number;
  color?: string;
}

export function LootStat({ label, value, color = '$primary' }: LootStatProps) {
  return (
    <XStack 
      justifyContent="space-between" 
      alignItems="center"
      paddingVertical="$2"
      paddingHorizontal="$2"
      backgroundColor="$background"
      borderRadius="$2"
    >
      <Text color="$color" fontSize={14}>
        {label}
      </Text>
      <Text color={color} fontSize={14} fontWeight="600">
        {formatInventoryValue(value)}
      </Text>
    </XStack>
  );
}
