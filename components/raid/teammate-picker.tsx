import { useState } from 'react';
import { Button, Input, XStack, YStack, Text, ScrollView } from 'tamagui';
import * as Haptics from 'expo-haptics';
import { useTeammates } from '@/hooks/use-teammates';

interface TeammatePickerProps {
  selected: string[];
  onChange: (teammates: string[]) => void;
}

export function TeammatePicker({ selected, onChange }: TeammatePickerProps) {
  const [expanded, setExpanded] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const { teammates, addTeammate } = useTeammates();

  const toggleTeammate = (username: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selected.includes(username)) {
      onChange(selected.filter((t) => t !== username));
    } else {
      onChange([...selected, username]);
    }
  };

  const handleAddNew = async () => {
    const trimmed = newUsername.trim();
    if (!trimmed) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Add to teammates list
    await addTeammate(trimmed);
    
    // Add to selected if not already
    if (!selected.includes(trimmed)) {
      onChange([...selected, trimmed]);
    }
    
    setNewUsername('');
  };

  const removeSelected = (username: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(selected.filter((t) => t !== username));
  };

  return (
    <YStack gap="$2">
      <Text color="$textMuted" fontSize={14} fontWeight="500">
        Squad
      </Text>
      
      {/* Selected teammates display */}
      <XStack flexWrap="wrap" gap="$2">
        {selected.map((username) => (
          <Button
            key={username}
            height={36}
            backgroundColor="$primary"
            borderRadius="$2"
            paddingHorizontal="$3"
            pressStyle={{ scale: 0.98 }}
            onPress={() => removeSelected(username)}
          >
            <XStack alignItems="center" gap="$1">
              <Text color="$background" fontWeight="500" fontSize={14}>
                {username}
              </Text>
              <Text color="$background" opacity={0.7} fontSize={14}>
                ×
              </Text>
            </XStack>
          </Button>
        ))}
        
        <Button
          height={36}
          backgroundColor="$surface"
          borderColor={expanded ? '$primary' : '$border'}
          borderWidth={1}
          borderStyle={expanded ? 'solid' : 'dashed'}
          borderRadius="$2"
          paddingHorizontal="$3"
          pressStyle={{ backgroundColor: '$surfaceHover' }}
          onPress={() => setExpanded(!expanded)}
        >
          <Text color={expanded ? '$primary' : '$textMuted'} fontSize={14}>
            {expanded ? '− Close' : '+ Add'}
          </Text>
        </Button>
      </XStack>

      {/* Expandable teammate selection */}
      {expanded && (
        <YStack 
          gap="$3" 
          padding="$3" 
          backgroundColor="$surface" 
          borderRadius="$3"
          borderColor="$border"
          borderWidth={1}
          marginTop="$2"
        >
          {/* Add new teammate input */}
          <XStack gap="$2">
            <Input
              flex={1}
              height={44}
              placeholder="Enter username..."
              placeholderTextColor="$textDim"
              backgroundColor="$background"
              borderColor="$border"
              borderRadius="$2"
              color="$color"
              fontSize={14}
              paddingHorizontal="$3"
              value={newUsername}
              onChangeText={setNewUsername}
              onSubmitEditing={handleAddNew}
            />
            <Button
              height={44}
              paddingHorizontal="$4"
              backgroundColor="$primary"
              borderRadius="$2"
              disabled={!newUsername.trim()}
              opacity={!newUsername.trim() ? 0.5 : 1}
              onPress={handleAddNew}
            >
              <Text color="$background" fontWeight="600" fontSize={14}>
                Add
              </Text>
            </Button>
          </XStack>

          {/* Recent teammates */}
          {teammates.length > 0 && (
            <YStack gap="$2">
              <Text color="$textMuted" fontSize={12}>
                Recent Players
              </Text>
              <ScrollView maxHeight={200}>
                <XStack flexWrap="wrap" gap="$2">
                  {teammates.map((teammate) => {
                    const isSelected = selected.includes(teammate.username);
                    return (
                      <Button
                        key={teammate.username}
                        height={36}
                        paddingHorizontal="$3"
                        backgroundColor={isSelected ? '$primary' : '$background'}
                        borderColor={isSelected ? '$primary' : '$border'}
                        borderWidth={1}
                        borderRadius="$2"
                        pressStyle={{
                          backgroundColor: isSelected ? '$primaryHover' : '$surfaceHover',
                          scale: 0.98,
                        }}
                        onPress={() => toggleTeammate(teammate.username)}
                      >
                        <Text
                          color={isSelected ? '$background' : '$color'}
                          fontWeight={isSelected ? '600' : '400'}
                          fontSize={14}
                        >
                          {teammate.username}
                        </Text>
                      </Button>
                    );
                  })}
                </XStack>
              </ScrollView>
            </YStack>
          )}
        </YStack>
      )}
    </YStack>
  );
}
