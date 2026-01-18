import { Button, Card, XStack, YStack, Text } from 'tamagui';
import * as Haptics from 'expo-haptics';
import { formatInventoryValue, formatDate, formatDuration } from '@/constants/raid-options';
import type { Raid } from '@/types/raid';

interface RaidCardProps {
  raid: Raid;
  onDelete?: (id: string) => void;
  onEdit?: (raid: Raid) => void;
}

export function RaidCard({ raid, onDelete, onEdit }: RaidCardProps) {
  const handleDelete = () => {
    if (onDelete) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onDelete(raid.id);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onEdit(raid);
    }
  };

  return (
    <Card
      backgroundColor="$surface"
      borderRadius="$3"
      padding="$4"
      borderLeftWidth={4}
      borderLeftColor={raid.successful ? '$success' : '$danger'}
    >
      <YStack gap="$3">
        {/* Header row */}
        <XStack justifyContent="space-between" alignItems="center">
          <XStack alignItems="center" gap="$2" flexWrap="wrap" flex={1}>
            <Text
              color={raid.successful ? '$success' : '$danger'}
              fontWeight="700"
              fontSize={16}
            >
              {raid.successful ? 'EXTRACTED' : 'DIED'}
            </Text>
            <Text color="$textMuted" fontSize={14}>
              •
            </Text>
            <Text color="$color" fontWeight="500" fontSize={14}>
              {raid.map}
            </Text>
            {raid.mapCondition && raid.mapCondition !== 'Normal' && (
              <>
                <Text color="$textMuted" fontSize={14}>
                  •
                </Text>
                <Text color="$arcYellow" fontWeight="500" fontSize={12}>
                  {raid.mapCondition}
                </Text>
              </>
            )}
          </XStack>
          
          <Text color="$textDim" fontSize={11}>
            {formatDate(raid.createdAt)}
          </Text>
        </XStack>

        {/* Stats row */}
        <XStack gap="$4" flexWrap="wrap">
          {raid.inventoryValue && (
            <YStack>
              <Text color="$textMuted" fontSize={10}>
                {raid.successful ? 'LOOT' : 'LOSS'}
              </Text>
              <Text 
                color={raid.successful ? '$primary' : '$danger'} 
                fontWeight="600" 
                fontSize={16}
              >
                {formatInventoryValue(raid.inventoryValue)}
              </Text>
            </YStack>
          )}

          {raid.squadKills !== null && raid.squadKills > 0 && (
            <YStack>
              <Text color="$textMuted" fontSize={10}>
                KILLS
              </Text>
              <Text color="$color" fontWeight="600" fontSize={16}>
                {raid.squadKills}
              </Text>
            </YStack>
          )}

          {raid.raidStartMins && (
            <YStack>
              <Text color="$textMuted" fontSize={10}>
                STARTED
              </Text>
              <Text color="$arcOrange" fontWeight="500" fontSize={16}>
                {raid.raidStartMins}m left
              </Text>
            </YStack>
          )}

          {raid.raidDurationMins && (
            <YStack>
              <Text color="$textMuted" fontSize={10}>
                IN RAID
              </Text>
              <Text color="$color" fontWeight="500" fontSize={16}>
                {formatDuration(raid.raidDurationMins)}
              </Text>
            </YStack>
          )}
        </XStack>

        {/* Teammates */}
        {raid.teammates.length > 0 && (
          <XStack gap="$2" flexWrap="wrap" alignItems="center">
            <Text color="$textMuted" fontSize={12}>
              Squad:
            </Text>
            {raid.teammates.map((teammate) => (
              <Text
                key={teammate}
                color="$color"
                fontSize={12}
                backgroundColor="$subtle"
                paddingHorizontal="$2"
                paddingVertical="$1"
                borderRadius="$2"
              >
                {teammate}
              </Text>
            ))}
          </XStack>
        )}

        {/* Action buttons */}
        {(onEdit || onDelete) && (
          <XStack justifyContent="flex-end" gap="$3" marginTop="$1">
            {onEdit && (
              <Button
                height={32}
                backgroundColor="transparent"
                pressStyle={{ opacity: 0.7 }}
                onPress={handleEdit}
              >
                <Text color="$primary" fontSize={12}>
                  Edit
                </Text>
              </Button>
            )}
            {onDelete && (
              <Button
                height={32}
                backgroundColor="transparent"
                pressStyle={{ opacity: 0.7 }}
                onPress={handleDelete}
              >
                <Text color="$danger" fontSize={12}>
                  Delete
                </Text>
              </Button>
            )}
          </XStack>
        )}
      </YStack>
    </Card>
  );
}

// Empty state component
export function EmptyRaidList() {
  return (
    <YStack 
      justifyContent="center" 
      alignItems="center" 
      paddingVertical="$10"
      paddingHorizontal="$8"
      gap="$3"
    >
      <Text fontSize={32} opacity={0.5}>
        🎮
      </Text>
      <Text color="$textMuted" fontSize={16} textAlign="center">
        No raids logged yet
      </Text>
      <Text color="$textDim" fontSize={14} textAlign="center">
        Complete a raid and log it to see your history
      </Text>
      <Text color="$textDim" fontSize={12} textAlign="center" marginTop="$4">
        Pull down to refresh
      </Text>
    </YStack>
  );
}
