/**
 * 테마 상태.
 *
 * 라이트가 기본값이다. 다크는 사용자가 직접 고른 경우에만 적용하므로 OS의
 * prefers-color-scheme 는 참고하지 않는다.
 */
export type Theme = "light" | "dark";

export const DEFAULT_THEME: Theme = "light";
export const THEME_KEY = "yumi-opic:theme";
export const THEMES: readonly Theme[] = ["light", "dark"];

export const THEME_LABELS: Record<Theme, string> = {
  light: "라이트",
  dark: "다크",
};

export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

export function loadTheme(): Theme {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const stored = window.localStorage.getItem(THEME_KEY);
    return isTheme(stored) ? stored : DEFAULT_THEME;
  } catch {
    // 사생활 보호 모드 등에서 스토리지를 못 읽어도 기본 테마로 동작한다.
    return DEFAULT_THEME;
  }
}

export function saveTheme(theme: Theme): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* 저장에 실패해도 현재 화면의 테마는 유지된다. */
  }
}

/** <html data-theme> 과 브라우저 UI 색을 현재 테마에 맞춘다. */
export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#0a0a0f" : "#f4f6fe");
}

/**
 * 첫 페인트 전에 저장된 테마를 적용해 화면 깜빡임을 막는 인라인 스크립트.
 * 서버 렌더 결과는 항상 기본값(라이트)이므로 다크를 고른 사용자에게만 필요하다.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_KEY,
)});if(t==="dark"||t==="light"){document.documentElement.dataset.theme=t;if(t==="dark"){var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content","#0a0a0f");}}}catch(e){}})();`;
