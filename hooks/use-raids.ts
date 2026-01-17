import { useState, useEffect, useCallback } from 'react';
import type { Raid, RaidFormData } from '@/types/raid';
import * as storage from '@/lib/storage';

export function useRaids() {
  const [raids, setRaids] = useState<Raid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRaids = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await storage.getRaids();
      setRaids(data);
    } catch (err) {
      setError('Failed to load raids');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRaids();
  }, [loadRaids]);

  const addRaid = useCallback(async (formData: RaidFormData) => {
    try {
      const newRaid = await storage.saveRaid(formData);
      setRaids((prev) => [newRaid, ...prev]);
      return newRaid;
    } catch (err) {
      setError('Failed to save raid');
      console.error(err);
      throw err;
    }
  }, []);

  const updateRaid = useCallback(async (id: string, updates: Partial<RaidFormData>) => {
    try {
      const updated = await storage.updateRaid(id, updates);
      if (updated) {
        setRaids((prev) =>
          prev.map((r) => (r.id === id ? updated : r))
        );
      }
      return updated;
    } catch (err) {
      setError('Failed to update raid');
      console.error(err);
      throw err;
    }
  }, []);

  const removeRaid = useCallback(async (id: string) => {
    try {
      const success = await storage.deleteRaid(id);
      if (success) {
        setRaids((prev) => prev.filter((r) => r.id !== id));
      }
      return success;
    } catch (err) {
      setError('Failed to delete raid');
      console.error(err);
      throw err;
    }
  }, []);

  const getLastRaid = useCallback(() => {
    return raids[0] || null;
  }, [raids]);

  // Stats helpers
  const stats = {
    total: raids.length,
    successful: raids.filter((r) => r.successful).length,
    failed: raids.filter((r) => !r.successful).length,
    successRate: raids.length > 0 
      ? (raids.filter((r) => r.successful).length / raids.length) * 100 
      : 0,
    totalValue: raids.reduce((sum, r) => sum + (r.inventoryValue || 0), 0),
    avgValue: raids.filter((r) => r.inventoryValue).length > 0
      ? raids.reduce((sum, r) => sum + (r.inventoryValue || 0), 0) / 
        raids.filter((r) => r.inventoryValue).length
      : 0,
    totalKills: raids.reduce((sum, r) => sum + (r.squadKills || 0), 0),
  };

  return {
    raids,
    loading,
    error,
    addRaid,
    updateRaid,
    removeRaid,
    getLastRaid,
    refresh: loadRaids,
    stats,
  };
}
