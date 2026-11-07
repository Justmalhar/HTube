"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Snack = { id: number; message: string; action?: { label: string; run: () => void } };

/**
 * The single toast: bottom-left (above the mobile bar), `show(message, { label, run }?)` replaces the
 * current message and hides after 5s. Render `node` once per component that calls `show`.
 */
export function useSnackbar() {
  const [snack, setSnack] = useState<Snack | null>(null);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const hide = useCallback(() => setSnack(null), []);
  const show = useCallback((message: string, action?: Snack["action"]) => {
    window.clearTimeout(timer.current);
    setSnack({ id: Date.now(), message, action });
    timer.current = window.setTimeout(() => setSnack(null), 5000);
  }, []);
  const node = snack ? (
    <div
      key={snack.id}
      role="status"
      className="fixed bottom-[calc(72px+env(safe-area-inset-bottom))] left-4 z-(--z-header) flex max-w-[calc(100%-32px)] items-center gap-4 rounded-lg bg-chip-on py-2 pl-4 pr-2 text-sm text-chip-on-text shadow-lg transition-[opacity,translate] duration-200 ease-out-quart starting:translate-y-2 starting:opacity-0 motion-reduce:transition-none min-[801px]:bottom-6"
    >
      <span className="min-w-0">{snack.message}</span>
      {snack.action ? (
        <button
          type="button"
          className="press h-8 shrink-0 rounded-full px-3 font-medium text-primary-hover"
          onClick={() => {
            snack.action?.run();
            hide();
          }}
        >
          {snack.action.label}
        </button>
      ) : null}
    </div>
  ) : null;
  return { show, node };
}
