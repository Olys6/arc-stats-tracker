import { useState, useCallback } from 'react';
import { View, Alert, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { YStack, Text, ScrollView } from 'tamagui';
import { RaidCard, EmptyRaidList } from '@/components/raid/raid-card';
import { useRaids } from '@/hooks/use-raids';

export default function HistoryScreen() {
  const { raids, loading, removeRaid, refresh } = useRaids();
  const [refreshing, setRefreshing] = useState(false);
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
                />
              ))}
            </YStack>
          )}
        </ScrollView>
      </YStack>
    </View>
  );
}
