'use client';
import { useDataContext } from '@/providers/DataProvider';
import { syncMutation, saveToCache } from '@/lib/offlineStore';

export function useSettings() {
  const { settings, setSettings } = useDataContext();

  const updateConciergerName = (name: string) => {
    const updated = { ...settings, conciergerName: name };
    setSettings(updated);
    saveToCache('settings', updated);
    syncMutation('app_settings', 'update', { concierger_name: name, updated_at: new Date().toISOString() }, { column: 'id', op: 'eq', value: 1 });
  };

  const updateBuildingName = (name: string) => {
    const updated = { ...settings, buildingName: name };
    setSettings(updated);
    saveToCache('settings', updated);
    syncMutation('app_settings', 'update', { building_name: name, updated_at: new Date().toISOString() }, { column: 'id', op: 'eq', value: 1 });
  };

  return { settings, updateConciergerName, updateBuildingName };
}
