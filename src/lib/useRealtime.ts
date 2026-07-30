import { useEffect, useRef } from 'react';
import { supabase, supabaseConfigured } from './supabase';

type Callback = () => void;

/**
 * Subscribes to real-time changes on the given table and calls `onUpdate`
 * whenever a row is inserted, updated, or deleted. Returns nothing; the
 * subscription is automatically cleaned up on unmount.
 *
 * The callback is debounced via a short timeout so a burst of changes
 * triggers a single refresh rather than many.
 */
export function useRealtimeTable(table: string, onUpdate: Callback, deps: unknown[] = []) {
  const cbRef = useRef(onUpdate);
  cbRef.current = onUpdate;

  const depsKey = JSON.stringify(deps);

  useEffect(() => {
    if (!supabaseConfigured) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const trigger = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => cbRef.current(), 150);
    };

    const channel = supabase
      .channel(`realtime-${table}-${depsKey}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, trigger)
      .subscribe();

    return () => {
      if (timer) clearTimeout(timer);
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, depsKey]);
}
