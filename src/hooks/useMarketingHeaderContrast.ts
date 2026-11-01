"use client";

import { useCallback, useEffect, useState } from "react";

export type MarketingHeaderContrast = {
  logoOnDark: boolean;
  navOnDark: boolean;
  actionsOnDark: boolean;
};

function elementOnDarkSurface(x: number, y: number, headerEl: HTMLElement | null): boolean {
  if (!headerEl) return false;

  const prevPointerEvents = headerEl.style.pointerEvents;
  headerEl.style.pointerEvents = "none";
  const hit = document.elementFromPoint(x, y);
  headerEl.style.pointerEvents = prevPointerEvents;

  let node: Element | null = hit;
  while (node) {
    if (node instanceof HTMLElement && node.hasAttribute("data-mkt-header-dark")) {
      return true;
    }
    node = node.parentElement;
  }
  return false;
}

export function useMarketingHeaderContrast(
  enabled: boolean,
  headerRef: React.RefObject<HTMLElement | null>,
): MarketingHeaderContrast {
  const [contrast, setContrast] = useState<MarketingHeaderContrast>({
    logoOnDark: false,
    navOnDark: false,
    actionsOnDark: false,
  });

  const update = useCallback(() => {
    const header = headerRef.current;
    if (!enabled || !header) {
      setContrast({ logoOnDark: false, navOnDark: false, actionsOnDark: false });
      return;
    }

    const rect = header.getBoundingClientRect();
    const sampleY = Math.min(Math.max(rect.bottom + 2, 0), window.innerHeight - 1);
    const logoX = Math.max(16, rect.left + Math.min(96, rect.width * 0.12));
    const actionsX = Math.min(window.innerWidth - 16, rect.right - Math.min(96, rect.width * 0.12));
    const navX = rect.left + rect.width / 2;

    setContrast({
      logoOnDark: elementOnDarkSurface(logoX, sampleY, header),
      navOnDark: elementOnDarkSurface(navX, sampleY, header),
      actionsOnDark: elementOnDarkSurface(actionsX, sampleY, header),
    });
  }, [enabled, headerRef]);

  useEffect(() => {
    if (!enabled) return;

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [enabled, update]);

  return contrast;
}
