import { useEffect, useState } from 'react';
import { api } from './client.js';

/** Hook GET đơn giản: const { data, loading, error } = useFetch('/drinks') */
export function useFetch(path) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

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
  }, [path]);

  return state;
}
