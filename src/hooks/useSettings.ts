'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { AppSettings } from '@/types';

const DEFAULT_SETTINGS: AppSettings = {
  conciergerName: 'Claudio',
  buildingName: 'Gran Bretaña',
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    supabase.from('app_settings').select('*').eq('id', 1).single().then(({ data }) => {
      if (data) {
        setSettings({
          conciergerName: data.concierger_name,
          buildingName: data.building_name,
        });
      }
    });
  }, []);

  const updateConciergerName = (name: string) => {
    setSettings(prev => ({ ...prev, conciergerName: name }));
    supabase.from('app_settings').update({ concierger_name: name, updated_at: new Date().toISOString() }).eq('id', 1).then();
  };

  const updateBuildingName = (name: string) => {
    setSettings(prev => ({ ...prev, buildingName: name }));
    supabase.from('app_settings').update({ building_name: name, updated_at: new Date().toISOString() }).eq('id', 1).then();
  };

  return { settings, updateConciergerName, updateBuildingName };
}
