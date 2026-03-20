'use client';
import { useLocalStorage } from './useLocalStorage';
import { AppSettings } from '@/types';

const DEFAULT_SETTINGS: AppSettings = {
  conciergerName: 'Claudio',
  buildingName: 'Gran Bretaña',
};

export function useSettings() {
  const [settings, setSettings] = useLocalStorage<AppSettings>('porter_settings', DEFAULT_SETTINGS);

  const updateConciergerName = (name: string) => {
    setSettings(prev => ({ ...prev, conciergerName: name }));
  };

  const updateBuildingName = (name: string) => {
    setSettings(prev => ({ ...prev, buildingName: name }));
  };

  return { settings, updateConciergerName, updateBuildingName };
}
