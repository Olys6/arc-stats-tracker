import { EmptyRaidList, RaidCard } from '@/components/raid/raid-card';
import { RaidForm } from '@/components/raid/raid-form';
import { useRaids } from '@/hooks/use-raids';
import type { Raid, RaidFormData } from '@/types/raid';
import { useCallback, useState } from 'react';
import { Alert, Modal, RefreshControl, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, ScrollView, Text, XStack, YStack } from 'tamagui';

export default function HistoryScreen() {
  const { raids, loading, removeRaid, updateRaid, refresh } = useRaids();
  const [refreshing, setRefreshing] = useState(false);
  const [editingRaid, setEditingRaid] = useState<Raid | null>(null);
  const insets = useSafeAreaInsets();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Raid',
      'Are you sure you want to delete this raid?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeRaid(id),
        },
      ]
    );
  };

  const handleEdit = (raid: Raid) => {
    setEditingRaid(raid);
  };

  const handleEditSubmit = async (data: RaidFormData) => {
    if (editingRaid) {
      await updateRaid(editingRaid.id, data);
      setEditingRaid(null);
    }
  };

  const handleEditCancel = () => {
    setEditingRaid(null);
  };

  if (loading && raids.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0b', paddingTop: insets.top }}>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Text color="$textMuted">Loading...</Text>
        </YStack>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0a0b', paddingTop: insets.top }}>
      <YStack flex={1} padding="$4">
        <Text 
          fontSize={28} 
          fontWeight="700" 
          color="$color" 
          marginBottom="$4"
        >
          History
        </Text>

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
            <EmptyRaidList />
          ) : (
            <YStack gap="$3" paddingBottom="$8">
              {raids.map((raid) => (
                <RaidCard
                  key={raid.id}
                  raid={raid}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))}
            </YStack>
          )}
        </ScrollView>
      </YStack>

      {/* Edit Modal */}
      <Modal
        visible={editingRaid !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleEditCancel}
      >
        <View style={{ flex: 1, backgroundColor: '#0a0a0b', paddingTop: insets.top }}>
          <YStack flex={1} padding="$4">
            <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
              <Text fontSize={24} fontWeight="700" color="$color">
                Edit Raid
              </Text>
              <Button
                height={36}
                paddingHorizontal="$3"
                backgroundColor="transparent"
                pressStyle={{ opacity: 0.7 }}
                onPress={handleEditCancel}
              >
                <Text color="$primary" fontSize={16}>
                  Cancel
                </Text>
              </Button>
            </XStack>
            
            {editingRaid && (
              <RaidForm
                onSubmit={handleEditSubmit}
                initialData={{
                  successful: editingRaid.successful,
                  map: editingRaid.map,
                  mapCondition: editingRaid.mapCondition,
                  teammates: editingRaid.teammates,
                  // Handle legacy data: if old inventoryValue exists, map it appropriately
                  bringInValue: editingRaid.bringInValue ?? 
                    (!editingRaid.successful ? editingRaid.inventoryValue : null) ?? null,
                  extractValue: editingRaid.extractValue ?? 
                    (editingRaid.successful ? editingRaid.inventoryValue : null) ?? null,
                  raidDurationMins: editingRaid.raidDurationMins,
                  raidStartMins: editingRaid.raidStartMins,
                  squadKills: editingRaid.squadKills,
                }}
                submitLabel="Save Changes"
              />
            )}
          </YStack>
        </View>
      </Modal>
    </View>
  );
}
