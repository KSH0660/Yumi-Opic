"use client";

import { useEffect, useState } from "react";
import { applyTheme, loadTheme, saveTheme, THEME_LABELS, THEMES, type Theme } from "@/lib/theme";

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 14.3A8.2 8.2 0 0 1 9.7 4a8.5 8.5 0 1 0 10.3 10.3Z" />
    </svg>
  );
}

const ICONS: Record<Theme, () => React.ReactElement> = { light: SunIcon, dark: MoonIcon };

export default function ThemeToggle({ className = "" }: { className?: string }) {
  // 서버 렌더와 첫 페인트는 항상 기본 테마다. 실제 선택값은 마운트 후에 읽는다.
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const stored = loadTheme();
    setTheme(stored);
    // 인라인 스크립트가 meta[theme-color] 보다 먼저 실행됐을 수 있어 여기서 맞춘다.
    applyTheme(stored);
  }, []);

  function choose(next: Theme) {
    setTheme(next);
    applyTheme(next);
    saveTheme(next);
  }

  return (
    <div
      role="group"
      aria-label="화면 테마"
      className={`inline-flex items-center gap-1 rounded-xl border border-line bg-surface p-1 ${className}`}
    >
      {THEMES.map((value) => {
        const Icon = ICONS[value];
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            onClick={() => choose(value)}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors duration-200 ${
              active
                ? "bg-primary-tint text-primary-ink"
                : "text-fg-subtle hover:bg-surface-2 hover:text-fg"
            }`}
          >
            <Icon />
            {THEME_LABELS[value]}
          </button>
        );
      })}
    </div>
  );
}
