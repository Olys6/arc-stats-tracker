import { Button, XStack, Text } from 'tamagui';
import * as Haptics from 'expo-haptics';

interface OutcomeToggleProps {
  value: boolean | null;
  onChange: (value: boolean) => void;
}

export function OutcomeToggle({ value, onChange }: OutcomeToggleProps) {
  const handlePress = (outcome: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onChange(outcome);
  };

  return (
    <XStack gap="$3" justifyContent="center">
      <Button
        flex={1}
        height={60}
        backgroundColor={value === true ? '$success' : '$surface'}
        borderColor={value === true ? '$success' : '$border'}
        borderWidth={2}
        borderRadius="$3"
        pressStyle={{
          backgroundColor: value === true ? '$successHover' : '$surfaceHover',
          scale: 0.98,
        }}
        onPress={() => handlePress(true)}
      >
        <Text
          color={value === true ? '$background' : '$color'}
          fontSize={18}
          fontWeight="700"
        >
          EXTRACTED
        </Text>
      </Button>
      
      <Button
        flex={1}
        height={60}
        backgroundColor={value === false ? '$danger' : '$surface'}
        borderColor={value === false ? '$danger' : '$border'}
        borderWidth={2}
        borderRadius="$3"
        pressStyle={{
          backgroundColor: value === false ? '$dangerHover' : '$surfaceHover',
          scale: 0.98,
        }}
        onPress={() => handlePress(false)}
      >
        <Text
          color={value === false ? '$background' : '$color'}
          fontSize={18}
          fontWeight="700"
        >
          DIED
        </Text>
      </Button>
    </XStack>
  );
}
