"use client";

/**
 * 답변하는 동안 화면이 꺼지지 않게 붙잡는다.
 *
 * 휴대폰은 손을 대지 않으면 30초 안팎에 화면을 어둡게 하고 곧 잠근다. 오픽 답변은
 * 한 문항에 1~2분이고 그동안 화면을 만질 일이 없어, 말하는 도중에 화면이 꺼진다.
 * 화면이 꺼지면 브라우저가 페이지를 멈춰 받아쓰기 인식기가 닫히고, 그 뒤로 말한
 * 내용은 한 글자도 남지 않는다. 사용자 눈에는 "휴대폰에서는 음성인식이 안 된다"로
 * 보인다.
 *
 * Screen Wake Lock 은 안드로이드 크롬과 iOS 16.4+ 사파리에 있다. 없는 기기에서는
 * 아무 일도 하지 않고, 화면이 꺼지면 `./speech` 의 받아쓰기가 돌아온 뒤 스스로
 * 다시 켜는 쪽에 기댄다.
 */

interface WakeLockSentinelLike {
  released?: boolean;
  release(): Promise<void>;
  addEventListener?: (type: "release", listener: () => void) => void;
}

interface WakeLockLike {
  request(type: "screen"): Promise<WakeLockSentinelLike>;
}

export interface WakeLockHandle {
  /** 화면을 다시 놓아 준다. 이 뒤로는 다시 잡지 않는다. */
  release: () => void;
}

function getWakeLock(): WakeLockLike | null {
  if (typeof navigator === "undefined") return null;
  const lock = (navigator as Navigator & { wakeLock?: WakeLockLike }).wakeLock;
  return lock && typeof lock.request === "function" ? lock : null;
}

export function isWakeLockSupported(): boolean {
  return getWakeLock() !== null;
}

/**
 * 화면을 깨워 둔다. 지원하지 않는 기기에서는 `null` 을 돌려준다.
 *
 * 잠금은 화면이 꺼지거나 다른 앱으로 넘어가면 브라우저가 스스로 놓아 버린다.
 * 돌아왔을 때 다시 잡지 않으면 두 번째 문항부터는 소용이 없으므로, 놓아 줄 때까지
 * `visibilitychange` 마다 다시 잡는다.
 */
export function requestScreenWakeLock(): WakeLockHandle | null {
  const wakeLock = getWakeLock();
  if (!wakeLock) return null;

  let released = false;
  let sentinel: WakeLockSentinelLike | null = null;

  const acquire = () => {
    if (released || sentinel) return;
    void wakeLock.request("screen").then((next) => {
      if (released) {
        void next.release().catch(() => undefined);
        return;
      }
      sentinel = next;
      next.addEventListener?.("release", () => {
        if (sentinel === next) sentinel = null;
      });
    }).catch(() => {
      // 화면이 이미 꺼졌거나 배터리 절약 중이면 거절된다. 다음 기회에 다시 잡는다.
      sentinel = null;
    });
  };

  const onVisibility = () => {
    if (released) return;
    if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
    acquire();
  };

  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", onVisibility);
  }
  acquire();

  return {
    release: () => {
      if (released) return;
      released = true;
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisibility);
      }
      const current = sentinel;
      sentinel = null;
      void current?.release().catch(() => undefined);
    },
  };
}
