import { useCallback, useEffect, useState } from 'react';
import { api } from './client.js';

/**
 * Hook GET đơn giản: const { data, loading, error, reload } = useFetch('/drinks')
 * reload() gọi lại API (dùng cho nút "Thử lại" của ErrorBox).
 */
export function useFetch(path) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    api
      .get(path)
      .then((data) => !cancelled && setState({ data, loading: false, error: null }))
      .catch((error) => !cancelled && setState({ data: null, loading: false, error }));
    return () => {
      cancelled = true;
    };
  }, [path, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...state, reload };
}
