
import { useEffect } from 'react';
import { supabase } from '../services/supabase';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export const useRealtimeSubscription = <T extends { [key: string]: any }>(
  table: string,
  callback: (payload: RealtimePostgresChangesPayload<T>) => void,
  event: '*' | 'INSERT' | 'UPDATE' | 'DELETE' = '*',
  filter?: string
) => {
  useEffect(() => {
    const channel = supabase
      .channel(`public:${table}:${event}`)
      .on(
        'postgres_changes',
        {
          event: event,
          schema: 'public',
          table: table,
          filter: filter
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, callback, event, filter]);
};
