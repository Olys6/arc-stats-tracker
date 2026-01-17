import { ScrollView } from 'react-native';
import { Button, XStack, Text } from 'tamagui';
import * as Haptics from 'expo-haptics';

interface ChipOption<T> {
  value: T;
  label: string;
}

interface ChipSelectorProps<T> {
  options: ChipOption<T>[];
  selected: T | null;
  onSelect: (value: T | null) => void;
  allowDeselect?: boolean;
  label?: string;
}

export function ChipSelector<T extends string | number>({
  options,
  selected,
  onSelect,
  allowDeselect = true,
  label,
}: ChipSelectorProps<T>) {
  const handleSelect = (value: T) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selected === value && allowDeselect) {
      onSelect(null);
    } else {
      onSelect(value);
    }
  };

  return (
    <XStack flexDirection="column" gap="$2">
      {label && (
        <Text color="$textMuted" fontSize={14} fontWeight="500">
          {label}
        </Text>
      )}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        <XStack gap="$2">
          {options.map((option) => {
            const isSelected = selected === option.value;
            return (
              <Button
                key={String(option.value)}
                height={40}
                paddingHorizontal="$3"
                backgroundColor={isSelected ? '$primary' : '$surface'}
                borderColor={isSelected ? '$primary' : '$border'}
                borderWidth={1}
                borderRadius="$2"
                pressStyle={{
                  backgroundColor: isSelected ? '$primaryHover' : '$surfaceHover',
                  scale: 0.98,
                }}
                onPress={() => handleSelect(option.value)}
              >
                <Text
                  color={isSelected ? '$background' : '$color'}
                  fontWeight={isSelected ? '600' : '400'}
                  fontSize={14}
                >
                  {option.label}
                </Text>
              </Button>
            );
          })}
        </XStack>
      </ScrollView>
    </XStack>
  );
}

// Multi-select variant
interface MultiChipSelectorProps<T> {
  options: ChipOption<T>[];
  selected: T[];
  onSelect: (values: T[]) => void;
  label?: string;
}

export function MultiChipSelector<T extends string | number>({
  options,
  selected,
  onSelect,
  label,
}: MultiChipSelectorProps<T>) {
  const handleToggle = (value: T) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selected.includes(value)) {
      onSelect(selected.filter((v) => v !== value));
    } else {
      onSelect([...selected, value]);
    }
  };

  return (
    <XStack flexDirection="column" gap="$2">
      {label && (
        <Text color="$textMuted" fontSize={14} fontWeight="500">
          {label}
        </Text>
      )}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        <XStack gap="$2">
          {options.map((option) => {
            const isSelected = selected.includes(option.value);
            return (
              <Button
                key={String(option.value)}
                height={40}
                paddingHorizontal="$3"
                backgroundColor={isSelected ? '$primary' : '$surface'}
                borderColor={isSelected ? '$primary' : '$border'}
                borderWidth={1}
                borderRadius="$2"
                pressStyle={{
                  backgroundColor: isSelected ? '$primaryHover' : '$surfaceHover',
                  scale: 0.98,
                }}
                onPress={() => handleToggle(option.value)}
              >
                <Text
                  color={isSelected ? '$background' : '$color'}
                  fontWeight={isSelected ? '600' : '400'}
                  fontSize={14}
                >
                  {option.label}
                </Text>
              </Button>
            );
          })}
        </XStack>
      </ScrollView>
    </XStack>
  );
}
