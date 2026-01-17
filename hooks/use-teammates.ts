import { useState, useEffect, useCallback } from 'react';
import type { Teammate } from '@/types/raid';
import * as storage from '@/lib/storage';

export function useTeammates() {
  const [teammates, setTeammates] = useState<Teammate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTeammates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await storage.getTeammates();
      setTeammates(data);
    } catch (err) {
      setError('Failed to load teammates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeammates();
  }, [loadTeammates]);

  const addTeammate = useCallback(async (username: string) => {
    try {
      const teammate = await storage.addTeammate(username);
      await loadTeammates(); // Refresh to get proper sorting
      return teammate;
    } catch (err) {
      setError('Failed to add teammate');
      console.error(err);
      throw err;
    }
  }, [loadTeammates]);

  const removeTeammate = useCallback(async (username: string) => {
    try {
      const success = await storage.deleteTeammate(username);
      if (success) {
        setTeammates((prev) => 
          prev.filter((t) => t.username.toLowerCase() !== username.toLowerCase())
        );
      }
      return success;
    } catch (err) {
      setError('Failed to remove teammate');
      console.error(err);
      throw err;
    }
  }, []);

  // Search/filter teammates
  const searchTeammates = useCallback((query: string) => {
    if (!query.trim()) return teammates;
    const normalized = query.toLowerCase();
    return teammates.filter((t) => 
      t.username.toLowerCase().includes(normalized)
    );
  }, [teammates]);

  return {
    teammates,
    loading,
    error,
    addTeammate,
    removeTeammate,
    searchTeammates,
    refresh: loadTeammates,
  };
}
