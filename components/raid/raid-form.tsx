import { useState, useEffect } from 'react';
import { Button, YStack, Text, XStack, ScrollView, Input } from 'tamagui';
import * as Haptics from 'expo-haptics';
import { OutcomeToggle } from '@/components/ui/outcome-toggle';
import { ChipSelector } from '@/components/ui/chip-selector';
import { Stepper, QuickNumberSelector } from '@/components/ui/stepper';
import { TeammatePicker } from '@/components/raid/teammate-picker';
import {
  MAPS,
  INVENTORY_VALUES,
  RAID_DURATIONS,
  SQUAD_KILLS,
  formatInventoryValue,
  formatDuration,
  getConditionsForMap,
} from '@/constants/raid-options';
import type { RaidFormData } from '@/types/raid';

function formatTimerDisplay(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

interface RaidFormProps {
  onSubmit: (data: RaidFormData) => Promise<void>;
  initialData?: Partial<RaidFormData>;
  submitLabel?: string;
}

export function RaidForm({ onSubmit, initialData, submitLabel = 'LOG RAID' }: RaidFormProps) {
  const [successful, setSuccessful] = useState<boolean | null>(
    initialData?.successful ?? null
  );
  const [map, setMap] = useState<string | null>(initialData?.map ?? null);
  const [mapCondition, setMapCondition] = useState<string | null>(
    initialData?.mapCondition ?? null
  );
  const [teammates, setTeammates] = useState<string[]>(
    initialData?.teammates ?? []
  );
  // Bring-in value (what you're risking)
  const [bringInValue, setBringInValue] = useState<number | null>(
    initialData?.bringInValue ?? null
  );
  const [customBringInValue, setCustomBringInValue] = useState('');
  // Extract value (what you came out with - only if successful)
  const [extractValue, setExtractValue] = useState<number | null>(
    initialData?.extractValue ?? null
  );
  const [customExtractValue, setCustomExtractValue] = useState('');
  const [squadKills, setSquadKills] = useState<number | null>(
    initialData?.squadKills ?? null
  );
  const [raidDuration, setRaidDuration] = useState<number | null>(
    initialData?.raidDurationMins ?? null
  );
  const [customDuration, setCustomDuration] = useState('');
  const [raidStartMins, setRaidStartMins] = useState<number | null>(
    initialData?.raidStartMins ?? null
  );
  const [customStartMins, setCustomStartMins] = useState('');
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerStartedAt, setTimerStartedAt] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Timer effect - updates every second when running
  useEffect(() => {
    if (!timerRunning || !timerStartedAt) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - timerStartedAt.getTime()) / 1000);
      setElapsedSeconds(elapsed);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [timerRunning, timerStartedAt]);

  const handleStartTimer = (startMins: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRaidStartMins(startMins);
    setTimerRunning(true);
    setTimerStartedAt(new Date());
    setElapsedSeconds(0);
  };

  const handleStopTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimerRunning(false);
    // Calculate time in raid (round to nearest minute, minimum 1)
    const elapsedMins = Math.max(1, Math.round(elapsedSeconds / 60));
    setRaidDuration(elapsedMins);
    setCustomDuration('');
  };

  const handleResetTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimerRunning(false);
    setTimerStartedAt(null);
    setElapsedSeconds(0);
    setRaidStartMins(null);
    setCustomStartMins('');
  };

  // Set Normal as default condition when map changes
  const handleMapChange = (newMap: string | null) => {
    setMap(newMap);
    setMapCondition(newMap ? 'Normal' : null); // Default to Normal when map is selected
  };

  const canSubmit = successful !== null && map !== null;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSubmitting(true);

    try {
      const data: RaidFormData = {
        successful: successful!,
        map: map!,
        mapCondition,
        teammates,
        bringInValue,
        extractValue: successful ? extractValue : null, // Only save extract value if successful
        squadKills,
        raidDurationMins: raidDuration,
        raidStartMins: raidStartMins,
      };

      await onSubmit(data);

      // Reset form
      setSuccessful(null);
      setMap(null);
      setMapCondition(null);
      setTeammates([]);
      setBringInValue(null);
      setCustomBringInValue('');
      setExtractValue(null);
      setCustomExtractValue('');
      setSquadKills(null);
      setRaidDuration(null);
      setCustomDuration('');
      setRaidStartMins(null);
      setCustomStartMins('');
      setTimerRunning(false);
      setTimerStartedAt(null);
      setElapsedSeconds(0);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error('Failed to save raid:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const mapOptions = MAPS.map((m) => ({ value: m, label: m }));
  const inventoryOptions = INVENTORY_VALUES.map((v) => ({
    value: v,
    label: formatInventoryValue(v),
  }));
  const durationOptions = RAID_DURATIONS.map((d) => ({
    value: d,
    label: formatDuration(d),
  }));

  // Predefined raid start times (in minutes)
  const raidStartOptions = [30, 25, 20, 18, 15, 12, 10];

  return (
    <ScrollView flex={1} showsVerticalScrollIndicator={false}>
      <YStack gap="$5" paddingBottom="$8">
        {/* Raid Timer - Prominent at top */}
        <YStack 
          gap="$3" 
          padding="$4" 
          backgroundColor="$surface"
          borderRadius="$3"
          borderWidth={timerRunning ? 2 : 1}
          borderColor={timerRunning ? '$arcOrange' : '$border'}
        >
          {timerRunning ? (
            // Timer is running
            <>
              <XStack justifyContent="space-between" alignItems="center">
                <YStack>
                  <Text color="$textMuted" fontSize={12}>RAID IN PROGRESS</Text>
                  <Text color="$arcOrange" fontSize={14}>
                    Started: {raidStartMins} min left
                  </Text>
                </YStack>
                <YStack alignItems="flex-end">
                  <Text color="$textMuted" fontSize={10}>ELAPSED</Text>
                  <Text color="$arcOrange" fontSize={32} fontWeight="700">
                    {formatTimerDisplay(elapsedSeconds)}
                  </Text>
                </YStack>
              </XStack>
              <XStack gap="$2">
                <Button
                  flex={1}
                  height={50}
                  backgroundColor="$arcOrange"
                  borderRadius="$2"
                  pressStyle={{ opacity: 0.8 }}
                  onPress={handleStopTimer}
                >
                  <Text color="$background" fontSize={16} fontWeight="600">
                    End Raid
                  </Text>
                </Button>
                <Button
                  height={50}
                  paddingHorizontal="$4"
                  backgroundColor="$subtle"
                  borderRadius="$2"
                  pressStyle={{ opacity: 0.8 }}
                  onPress={handleResetTimer}
                >
                  <Text color="$textMuted" fontSize={14}>Reset</Text>
                </Button>
              </XStack>
            </>
          ) : (
            // Timer not running - show start options
            <>
              <Text color="$textMuted" fontSize={14} fontWeight="500">
                Raid Start Time (time remaining)
              </Text>
              <XStack flexWrap="wrap" gap="$2">
                {raidStartOptions.map((mins) => (
                  <Button
                    key={mins}
                    height={44}
                    paddingHorizontal="$3"
                    backgroundColor={raidStartMins === mins && !timerRunning ? '$primary' : '$background'}
                    borderColor={raidStartMins === mins && !timerRunning ? '$primary' : '$border'}
                    borderWidth={1}
                    borderRadius="$2"
                    pressStyle={{ backgroundColor: '$surfaceHover', scale: 0.98 }}
                    onPress={() => handleStartTimer(mins)}
                  >
                    <Text 
                      color={raidStartMins === mins && !timerRunning ? '$background' : '$color'} 
                      fontSize={14}
                      fontWeight="500"
                    >
                      {mins}m
                    </Text>
                  </Button>
                ))}
              </XStack>
              <XStack gap="$2" alignItems="center">
                <Input
                  flex={1}
                  height={44}
                  placeholder="Custom minutes..."
                  placeholderTextColor="$textDim"
                  backgroundColor="$background"
                  borderColor={customStartMins ? '$primary' : '$border'}
                  borderRadius="$2"
                  color="$color"
                  fontSize={14}
                  paddingHorizontal="$3"
                  keyboardType="numeric"
                  value={customStartMins}
                  onChangeText={setCustomStartMins}
                />
                <Button
                  height={44}
                  paddingHorizontal="$4"
                  backgroundColor="$arcOrange"
                  borderRadius="$2"
                  disabled={!customStartMins.trim()}
                  opacity={!customStartMins.trim() ? 0.5 : 1}
                  onPress={() => {
                    const mins = parseInt(customStartMins, 10);
                    if (!isNaN(mins) && mins > 0) {
                      handleStartTimer(mins);
                    }
                  }}
                >
                  <Text color="$background" fontSize={14} fontWeight="600">Start</Text>
                </Button>
              </XStack>
              {raidStartMins && !timerRunning && (
                <Text color="$textDim" fontSize={12} textAlign="center">
                  Timer stopped. Started with {raidStartMins} min.
                </Text>
              )}
            </>
          )}
        </YStack>

        {/* Bring-In Value - What you're risking (show near top) */}
        <YStack gap="$2">
          <Text color="$textMuted" fontSize={14} fontWeight="500">
            Bring-In Value (what you're risking)
          </Text>
          <ChipSelector
            options={inventoryOptions}
            selected={bringInValue}
            onSelect={(val) => {
              setBringInValue(val);
              setCustomBringInValue('');
            }}
          />
          <XStack gap="$2" alignItems="center">
            <Input
              flex={1}
              height={44}
              placeholder="Custom value..."
              placeholderTextColor="$textDim"
              backgroundColor="$surface"
              borderColor={customBringInValue ? '$primary' : '$border'}
              borderRadius="$2"
              color="$color"
              fontSize={14}
              paddingHorizontal="$3"
              keyboardType="numeric"
              value={customBringInValue}
              onChangeText={(text) => {
                setCustomBringInValue(text);
                const num = parseInt(text, 10);
                if (!isNaN(num) && num >= 0) {
                  setBringInValue(num);
                } else if (text === '') {
                  setBringInValue(null);
                }
              }}
            />
            {(customBringInValue !== '' || bringInValue !== null) && (
              <Button
                height={44}
                paddingHorizontal="$3"
                backgroundColor="$subtle"
                borderRadius="$2"
                onPress={() => {
                  setCustomBringInValue('');
                  setBringInValue(null);
                }}
              >
                <Text color="$textMuted" fontSize={14}>Clear</Text>
              </Button>
            )}
          </XStack>
        </YStack>

        {/* Outcome */}
        <YStack gap="$2">
          <Text color="$textMuted" fontSize={14} fontWeight="500">
            Outcome
          </Text>
          <OutcomeToggle value={successful} onChange={setSuccessful} />
        </YStack>

        {/* Extract Value - What you came out with (only if extracted) */}
        {successful === true && (
          <YStack gap="$2">
            <XStack justifyContent="space-between" alignItems="center">
              <Text color="$textMuted" fontSize={14} fontWeight="500">
                Extract Value (what you came out with)
              </Text>
              {bringInValue !== null && extractValue !== null && (
                <Text 
                  color={extractValue - bringInValue >= 0 ? '$success' : '$danger'} 
                  fontSize={14} 
                  fontWeight="600"
                >
                  {extractValue - bringInValue >= 0 ? '+' : ''}{formatInventoryValue(extractValue - bringInValue)}
                </Text>
              )}
            </XStack>
            <ChipSelector
              options={inventoryOptions}
              selected={extractValue}
              onSelect={(val) => {
                setExtractValue(val);
                setCustomExtractValue('');
              }}
            />
            <XStack gap="$2" alignItems="center">
              <Input
                flex={1}
                height={44}
                placeholder="Custom value..."
                placeholderTextColor="$textDim"
                backgroundColor="$surface"
                borderColor={customExtractValue ? '$success' : '$border'}
                borderRadius="$2"
                color="$color"
                fontSize={14}
                paddingHorizontal="$3"
                keyboardType="numeric"
                value={customExtractValue}
                onChangeText={(text) => {
                  setCustomExtractValue(text);
                  const num = parseInt(text, 10);
                  if (!isNaN(num) && num >= 0) {
                    setExtractValue(num);
                  } else if (text === '') {
                    setExtractValue(null);
                  }
                }}
              />
              {(customExtractValue !== '' || extractValue !== null) && (
                <Button
                  height={44}
                  paddingHorizontal="$3"
                  backgroundColor="$subtle"
                  borderRadius="$2"
                  onPress={() => {
                    setCustomExtractValue('');
                    setExtractValue(null);
                  }}
                >
                  <Text color="$textMuted" fontSize={14}>Clear</Text>
                </Button>
              )}
            </XStack>
          </YStack>
        )}

        {/* Map Selection */}
        <ChipSelector
          label="Map"
          options={mapOptions}
          selected={map}
          onSelect={handleMapChange}
          allowDeselect={false}
        />

        {/* Map Condition - Only show after map is selected */}
        {map && (
          <ChipSelector
            label="Condition"
            options={getConditionsForMap(map).map((c) => ({ value: c, label: c }))}
            selected={mapCondition}
            onSelect={setMapCondition}
          />
        )}

        {/* Squad */}
        <TeammatePicker selected={teammates} onChange={setTeammates} />

        {/* Squad Kills */}
        <QuickNumberSelector
          label="Squad Kills"
          value={squadKills}
          onChange={setSquadKills}
          options={[...SQUAD_KILLS]}
        />

        {/* Raid Duration (how long you were in) */}
        <YStack gap="$2">
          <XStack justifyContent="space-between" alignItems="center">
            <Text color="$textMuted" fontSize={14} fontWeight="500">
              Time in Raid
            </Text>
            {raidDuration && (
              <Text color="$primary" fontSize={14} fontWeight="600">
                {raidDuration} min
              </Text>
            )}
          </XStack>
          <ChipSelector
            options={durationOptions}
            selected={raidDuration}
            onSelect={(val) => {
              setRaidDuration(val);
              setCustomDuration('');
            }}
          />
          <XStack gap="$2" alignItems="center">
            <Input
              flex={1}
              height={44}
              placeholder="Custom minutes..."
              placeholderTextColor="$textDim"
              backgroundColor="$surface"
              borderColor={customDuration ? '$primary' : '$border'}
              borderRadius="$2"
              color="$color"
              fontSize={14}
              paddingHorizontal="$3"
              keyboardType="numeric"
              value={customDuration}
              onChangeText={(text) => {
                setCustomDuration(text);
                const num = parseInt(text, 10);
                if (!isNaN(num) && num > 0) {
                  setRaidDuration(num);
                } else if (text === '') {
                  setRaidDuration(null);
                }
              }}
            />
            {(customDuration !== '' || raidDuration) && (
              <Button
                height={44}
                paddingHorizontal="$3"
                backgroundColor="$subtle"
                borderRadius="$2"
                onPress={() => {
                  setCustomDuration('');
                  setRaidDuration(null);
                }}
              >
                <Text color="$textMuted" fontSize={14}>Clear</Text>
              </Button>
            )}
          </XStack>
        </YStack>

        {/* Submit Button */}
        <Button
          height={56}
          backgroundColor={canSubmit ? '$primary' : '$subtle'}
          disabled={!canSubmit || submitting}
          opacity={!canSubmit || submitting ? 0.6 : 1}
          marginTop="$4"
          borderRadius="$3"
          pressStyle={{
            backgroundColor: '$primaryHover',
            scale: 0.98,
          }}
          onPress={handleSubmit}
        >
          <Text
            color={canSubmit ? '$background' : '$textMuted'}
            fontSize={18}
            fontWeight="700"
          >
            {submitting ? 'Saving...' : submitLabel}
          </Text>
        </Button>

        {/* Helper text */}
        {!canSubmit && (
          <Text color="$textDim" fontSize={12} textAlign="center">
            Select outcome and map to log raid
          </Text>
        )}
      </YStack>
    </ScrollView>
  );
}
