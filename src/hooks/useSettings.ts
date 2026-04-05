'use client';
import { supabase } from '@/lib/supabase/client';
import { useDataContext } from '@/providers/DataProvider';

export function useSettings() {
  const { settings, setSettings } = useDataContext();

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
