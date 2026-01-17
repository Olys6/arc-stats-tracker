import { useState } from 'react';
import { Button, YStack, XStack, Text } from 'tamagui';
import * as Haptics from 'expo-haptics';

interface StatSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export function StatSection({ title, children, defaultExpanded = false }: StatSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const toggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpanded(!expanded);
  };

  return (
    <YStack>
      <Button
        height={50}
        backgroundColor="$surface"
        borderRadius="$2"
        justifyContent="flex-start"
        paddingHorizontal="$4"
        pressStyle={{ backgroundColor: '$surfaceHover' }}
        onPress={toggle}
      >
        <XStack flex={1} justifyContent="space-between" alignItems="center">
          <Text color="$color" fontSize={16} fontWeight="600">
            {title}
          </Text>
          <Text color="$textMuted" fontSize={16}>
            {expanded ? '▼' : '▶'}
          </Text>
        </XStack>
      </Button>
      
      {expanded && (
        <YStack 
          backgroundColor="$surface" 
          borderBottomLeftRadius="$2"
          borderBottomRightRadius="$2"
          marginTop={-8}
          paddingTop="$3"
          paddingBottom="$3"
          paddingHorizontal="$3"
          gap="$2"
        >
          {children}
        </YStack>
      )}
    </YStack>
  );
}
