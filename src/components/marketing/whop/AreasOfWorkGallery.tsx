"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { areasOfWork } from "@/content/areasOfWork";

gsap.registerPlugin(useGSAP);

const tilePlacements = [
  {
    className:
      "left-[10%] top-[34%] w-[20%] rotate-[-8deg] sm:left-[27%] sm:top-[38%] sm:w-[11%]",
    depth: 34,
    rotation: -8,
    objectPosition: "70% center",
    stack: 24,
  },
  {
    className:
      "left-[20%] top-[20%] w-[18%] rotate-[-5deg] sm:left-[35%] sm:top-[24%] sm:w-[10%]",
    depth: 20,
    rotation: -5,
    objectPosition: "center",
    stack: 28,
  },
  {
    className:
      "right-[20%] top-[18%] w-[18%] rotate-[7deg] sm:right-[35%] sm:top-[24%] sm:w-[10%]",
    depth: 28,
    rotation: 7,
    objectPosition: "72% center",
    stack: 32,
  },
  {
    className:
      "right-[10%] top-[46%] w-[20%] rotate-[6deg] sm:right-[27%] sm:top-[48%] sm:w-[11%]",
    depth: 18,
    rotation: 6,
    objectPosition: "center",
    stack: 26,
  },
  {
    className:
      "bottom-[14%] left-[16%] w-[20%] rotate-[7deg] sm:bottom-[15%] sm:left-[29%] sm:w-[11%]",
    depth: 25,
    rotation: 7,
    objectPosition: "center",
    stack: 30,
  },
  {
    className:
      "bottom-[12%] right-[16%] w-[20%] rotate-[-6deg] sm:bottom-[15%] sm:right-[29%] sm:w-[11%]",
    depth: 15,
    rotation: -6,
    objectPosition: "center",
    stack: 22,
  },
] as const;

/** MWG effect117: back / mid / front image layers; words sit between mid and front. */
const tileLayerByIndex = [0, 1, 2, 2, 1, 0] as const;
const layerZIndex = [8, 14, 26] as const;
const WORDS_Z = 30;

function imageForTile(pool: readonly string[], tileIndex: number): string {
  return pool[tileIndex % pool.length] ?? pool[0];
}

const ROTATE_MS = 2000;

export function AreasOfWorkGallery() {
  const stageRef = useRef<HTMLDivElement>(null);
  const rotateTimerRef = useRef<number | null>(null);
  const stageHoverRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeArea = areasOfWork[activeIndex];

  const startAutoRotate = useCallback(() => {
    if (rotateTimerRef.current !== null) {
      window.clearInterval(rotateTimerRef.current);
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    rotateTimerRef.current = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % areasOfWork.length);
    }, ROTATE_MS);
  }, []);

  useEffect(() => {
    startAutoRotate();
    return () => {
      if (rotateTimerRef.current !== null) {
        window.clearInterval(rotateTimerRef.current);
      }
    };
  }, [startAutoRotate]);

  function selectArea(index: number) {
    setActiveIndex(index);
    startAutoRotate();
  }

  useGSAP(
    () => {
      const stage = stageRef.current;
      if (!stage) return;

      const tiles = gsap.utils.toArray<HTMLElement>("[data-gallery-tile]", stage);
      tiles.forEach((tile) => {
        const rotation = Number(tile.dataset.rotation ?? 0);
        gsap.set(tile, { opacity: 1, scale: 1, x: 0, y: 0, rotation });
      });
    },
    { scope: stageRef, dependencies: [activeIndex], revertOnUpdate: false },
  );

  useGSAP(
    () => {
      const stage = stageRef.current;
      if (!stage) return;

      const words = gsap.utils.toArray<HTMLElement>("[data-gallery-word-item]", stage);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      words.forEach((wordEl, index) => {
        const isActive = index === activeIndex;
        if (reduced) {
          gsap.set(wordEl, { opacity: isActive ? 1 : 0, y: 0, pointerEvents: "none" });
          return;
        }
        if (isActive) {
          gsap.fromTo(
            wordEl,
            { y: 48, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.55, ease: "power3.out" },
          );
        } else {
          gsap.set(wordEl, {
            opacity: 0,
            y: index < activeIndex ? -36 : 36,
          });
        }
      });
    },
    { scope: stageRef, dependencies: [activeIndex], revertOnUpdate: false },
  );

  function moveTiles(event: React.PointerEvent<HTMLDivElement>) {
    if (
      event.pointerType !== "mouse" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const offsetX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const offsetY = (event.clientY - bounds.top) / bounds.height - 0.5;
    const parallaxBoost = stageHoverRef.current ? 2.6 : 1;

    gsap.utils.toArray<HTMLElement>("[data-gallery-tile]", event.currentTarget).forEach((tile) => {
      const depth = Number(tile.dataset.depth ?? 0);
      const hovered = tile.dataset.hovered === "true";
      gsap.to(tile, {
        x: offsetX * depth * parallaxBoost,
        y: offsetY * depth * parallaxBoost,
        scale: hovered ? 1.1 : stageHoverRef.current ? 1.04 : 1,
        duration: hovered ? 0.22 : 0.35,
        ease: "power2.out",
        overwrite: "auto",
      });
    });
  }

  function onStagePointerEnter() {
    stageHoverRef.current = true;
  }

  function resetTiles(event: React.PointerEvent<HTMLDivElement>) {
    stageHoverRef.current = false;
    gsap.to(event.currentTarget.querySelectorAll("[data-gallery-tile]"), {
      x: 0,
      y: 0,
      scale: 1,
      duration: 0.4,
      ease: "power3.out",
      overwrite: "auto",
    });
    event.currentTarget.querySelectorAll("[data-gallery-tile]").forEach((tile) => {
      if (tile instanceof HTMLElement) {
        tile.dataset.hovered = "false";
        const stack = Number(tile.dataset.stack ?? 0);
        tile.style.zIndex = String(stack);
      }
    });
  }

  function onTilePointerEnter(event: React.PointerEvent<HTMLElement>) {
    const tile = event.currentTarget;
    tile.dataset.hovered = "true";
    tile.style.zIndex = "60";
    gsap.to(tile, {
      scale: 1.1,
      duration: 0.2,
      ease: "power2.out",
      overwrite: "auto",
    });
    gsap.to(tile.querySelector("img"), {
      scale: 1.05,
      duration: 0.25,
      ease: "power2.out",
    });
  }

  function onTilePointerLeave(event: React.PointerEvent<HTMLElement>) {
    const tile = event.currentTarget;
    tile.dataset.hovered = "false";
    const stack = Number(tile.dataset.stack ?? 0);
    tile.style.zIndex = String(stack);
    gsap.to(tile, {
      scale: stageHoverRef.current ? 1.04 : 1,
      duration: 0.25,
      ease: "power2.out",
      overwrite: "auto",
    });
    gsap.to(tile.querySelector("img"), {
      scale: 1,
      duration: 0.25,
      ease: "power2.out",
    });
  }

  return (
    <section
      aria-labelledby="areas-of-work-heading"
      className="bg-[#202020] px-4 py-8 text-white sm:px-6 sm:py-10 lg:px-8"
    >
      <div
        ref={stageRef}
        onPointerEnter={onStagePointerEnter}
        onPointerMove={moveTiles}
        onPointerLeave={resetTiles}
        className="relative mx-auto min-h-[560px] max-w-[1400px] overflow-hidden rounded-md bg-[#09090b] sm:min-h-[680px]"
      >
        <h2
          id="areas-of-work-heading"
          className="absolute left-6 top-6 z-40 text-lg font-medium tracking-tight sm:left-8 sm:top-8 sm:text-xl"
        >
          Areas of work
        </h2>

        <div
          id="areas-of-work-panel"
          role="tabpanel"
          aria-live="polite"
          className="absolute inset-0"
        >
          <p className="sr-only">{activeArea.creativeWord}</p>

          <div className="absolute inset-0" aria-hidden="true">
            {[0, 1, 2].map((layer) => (
              <div
                key={`layer-${layer}-${activeIndex}`}
                className="pointer-events-none absolute inset-0"
                style={{ zIndex: layerZIndex[layer] }}
                data-gallery-layer={layer}
              >
                {tilePlacements.map((placement, index) => {
                  if (tileLayerByIndex[index] !== layer) return null;
                  const src = imageForTile(activeArea.images, index);
                  return (
                    <figure
                      key={`${activeIndex}-tile-${index}`}
                      data-gallery-tile
                      data-depth={placement.depth}
                      data-rotation={placement.rotation}
                      data-stack={placement.stack}
                      data-hovered="false"
                      onPointerEnter={onTilePointerEnter}
                      onPointerLeave={onTilePointerLeave}
                      className={`pointer-events-auto absolute aspect-[4/3] cursor-pointer overflow-hidden rounded-lg border border-white/10 bg-[#151515] shadow-2xl will-change-transform ${placement.className}`}
                    >
                      <Image
                        src={src}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 32vw, 18vw"
                        className="object-cover will-change-transform"
                        style={{ objectPosition: placement.objectPosition }}
                      />
                    </figure>
                  );
                })}
              </div>
            ))}
          </div>

          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 sm:px-8"
            style={{ zIndex: WORDS_Z }}
          >
            <div className="relative flex w-full max-w-5xl items-center justify-center">
              {areasOfWork.map((area, index) => (
                <p
                  key={area.label}
                  data-gallery-word-item
                  aria-hidden={index !== activeIndex}
                  className="absolute max-w-full text-balance text-center text-[clamp(2.25rem,8vw,5.5rem)] font-medium leading-[0.95] tracking-[-0.03em] text-white [text-shadow:0_2px_48px_rgba(0,0,0,0.55)]"
                  style={{ opacity: index === activeIndex ? 1 : 0 }}
                >
                  {area.creativeWord}
                </p>
              ))}
            </div>
          </div>
        </div>

        <nav
          aria-label="Browse areas of work"
          className="absolute bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 sm:bottom-auto sm:left-7 sm:top-1/2 sm:-translate-y-1/2 sm:flex-col sm:gap-1"
        >
          {areasOfWork.map((area, index) => (
            <button
              key={area.label}
              type="button"
              aria-label={`Show ${area.label}`}
              aria-controls="areas-of-work-panel"
              aria-pressed={index === activeIndex}
              onClick={() => selectArea(index)}
              className={`grid size-10 place-items-center rounded-full font-mono text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mkt-accent ${
                index === activeIndex
                  ? "bg-white text-black"
                  : "text-white/45 hover:bg-white/10 hover:text-white"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </nav>

        <p className="absolute bottom-6 right-7 z-40 hidden text-xs text-white/50 sm:block">
          Select an area to explore
        </p>
      </div>
    </section>
  );
}
