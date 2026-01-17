import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { YStack, Text } from 'tamagui';
import { RaidForm } from '@/components/raid/raid-form';
import { useRaids } from '@/hooks/use-raids';

export default function LogRaidScreen() {
  const { addRaid } = useRaids();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0a0b', paddingTop: insets.top }}>
      <YStack flex={1} padding="$4">
        <Text 
          fontSize={28} 
          fontWeight="700" 
          color="$color" 
          marginBottom="$4"
        >
          Log Raid
        </Text>
        
        <RaidForm onSubmit={addRaid} />
      </YStack>
    </View>
  );
}
