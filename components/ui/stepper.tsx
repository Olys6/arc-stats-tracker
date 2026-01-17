import { Button, XStack, Text, YStack } from 'tamagui';
import * as Haptics from 'expo-haptics';

interface StepperProps {
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  label?: string;
}

export function Stepper({ 
  value, 
  onChange, 
  min = 0, 
  max = 99,
  label,
}: StepperProps) {
  const currentValue = value ?? 0;

  const decrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentValue > min) {
      onChange(currentValue - 1);
    }
  };

  const increment = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentValue < max) {
      onChange(currentValue + 1);
    }
  };

  const clear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(null);
  };

  return (
    <YStack gap="$2">
      {label && (
        <Text color="$textMuted" fontSize={14} fontWeight="500">
          {label}
        </Text>
      )}
      <XStack alignItems="center" gap="$3">
        <Button
          width={44}
          height={44}
          circular
          backgroundColor="$surface"
          borderColor="$border"
          borderWidth={1}
          disabled={currentValue <= min}
          opacity={currentValue <= min ? 0.5 : 1}
          pressStyle={{
            backgroundColor: '$surfaceHover',
            scale: 0.95,
          }}
          onPress={decrement}
        >
          <Text color="$color" fontSize={20} fontWeight="700">
            −
          </Text>
        </Button>

        <XStack 
          minWidth={60} 
          height={44}
          justifyContent="center"
          alignItems="center"
          backgroundColor="$surface"
          borderRadius="$2"
          paddingHorizontal="$4"
        >
          <Text 
            color={value === null ? '$textMuted' : '$color'} 
            fontSize={20} 
            fontWeight="600"
            textAlign="center"
          >
            {value === null ? '–' : currentValue}
          </Text>
        </XStack>

        <Button
          width={44}
          height={44}
          circular
          backgroundColor="$surface"
          borderColor="$border"
          borderWidth={1}
          disabled={currentValue >= max}
          opacity={currentValue >= max ? 0.5 : 1}
          pressStyle={{
            backgroundColor: '$surfaceHover',
            scale: 0.95,
          }}
          onPress={increment}
        >
          <Text color="$color" fontSize={20} fontWeight="700">
            +
          </Text>
        </Button>

        {value !== null && (
          <Button
            height={36}
            paddingHorizontal="$2"
            backgroundColor="transparent"
            pressStyle={{ opacity: 0.7 }}
            onPress={clear}
          >
            <Text color="$textMuted" fontSize={12}>
              Clear
            </Text>
          </Button>
        )}
      </XStack>
    </YStack>
  );
}

// Quick number selector using chips for common values
interface QuickNumberSelectorProps {
  value: number | null;
  onChange: (value: number | null) => void;
  options: number[];
  label?: string;
}

export function QuickNumberSelector({
  value,
  onChange,
  options,
  label,
}: QuickNumberSelectorProps) {
  const handleSelect = (num: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (value === num) {
      onChange(null);
    } else {
      onChange(num);
    }
  };

  return (
    <YStack gap="$2">
      {label && (
        <Text color="$textMuted" fontSize={14} fontWeight="500">
          {label}
        </Text>
      )}
      <XStack flexWrap="wrap" gap="$2">
        {options.map((num) => {
          const isSelected = value === num;
          return (
            <Button
              key={num}
              height={40}
              minWidth={44}
              paddingHorizontal="$2"
              backgroundColor={isSelected ? '$primary' : '$surface'}
              borderColor={isSelected ? '$primary' : '$border'}
              borderWidth={1}
              borderRadius="$2"
              pressStyle={{
                backgroundColor: isSelected ? '$primaryHover' : '$surfaceHover',
                scale: 0.98,
              }}
              onPress={() => handleSelect(num)}
            >
              <Text
                color={isSelected ? '$background' : '$color'}
                fontWeight={isSelected ? '600' : '400'}
                fontSize={14}
              >
                {num}
              </Text>
            </Button>
          );
        })}
      </XStack>
    </YStack>
  );
}
