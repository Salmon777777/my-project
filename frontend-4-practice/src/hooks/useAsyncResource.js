import { useEffect, useState } from "react";

export function useAsyncResource(load, key, enabled = true) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(null);
  const requestKey = `${key}:${attempt}`;
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    let active = true;
    async function run() {
      try {
        const data = await load(controller.signal);
        if (active) setResult({ key: requestKey, loader: load, status: "success", data, error: null });
      } catch (error) {
        if (active) setResult({ key: requestKey, loader: load, status: "error", data: null, error: error.message || "Не удалось загрузить данные" });
      }
    }
    run();
    // Защита от устаревшего ответа даже при игнорировании отмены сервером.
    return () => { active = false; controller.abort(); };
  }, [load, requestKey, enabled]);
  const current = enabled && result?.key === requestKey && result.loader === load ? result : { status: enabled ? "loading" : "idle", data: null, error: null };
  return { ...current, retry: () => setAttempt(value => value + 1) };
}
