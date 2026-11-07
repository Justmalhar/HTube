"use client";

import { useEffect, useRef, useState } from "react";

import { ChevronIcon, ChevronLeftIcon } from "@/components/icons";

export function ShelfScroller({ children }: { children: React.ReactNode }) {
  const list = useRef<HTMLUListElement>(null);
  // Both hidden until measured, so a shelf that fits never flashes an arrow.
  const [edges, setEdges] = useState({ start: true, end: true });
  useEffect(() => {
    const node = list.current;
    if (!node) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() =>
        setEdges({ start: node.scrollLeft <= 4, end: node.scrollLeft + node.clientWidth >= node.scrollWidth - 4 }),
      );
    };
    update();
    node.addEventListener("scroll", update, { passive: true });
    // Watches the list itself, so sidebar toggles and late-loading tiles count, not just window resizes.
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => {
      cancelAnimationFrame(frame);
      node.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);
  const scroll = (direction: number) => {
    const node = list.current;
    if (!node) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    node.scrollBy({ left: direction * node.clientWidth * 0.8, behavior: still ? "auto" : "smooth" });
  };
  const arrow =
    "absolute top-[calc(50%-36px)] z-(--z-raised) hidden size-10 place-items-center rounded-full bg-background shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-[opacity,scale] duration-150 ease-out-quart hover:bg-surface active:scale-[0.97] min-[801px]:grid";
  const hide = "pointer-events-none opacity-0";
  return (
    <div className="relative">
      <ul ref={list} className="no-scrollbar -mx-1 flex snap-x gap-4 overflow-x-auto px-1">
        {children}
      </ul>
      <button type="button" className={`${arrow} -left-5 ${edges.start ? hide : ""}`} aria-label="Scroll left" tabIndex={edges.start ? -1 : 0} aria-hidden={edges.start} onClick={() => scroll(-1)}>
        <ChevronLeftIcon />
      </button>
      <button type="button" className={`${arrow} -right-5 ${edges.end ? hide : ""}`} aria-label="Scroll right" tabIndex={edges.end ? -1 : 0} aria-hidden={edges.end} onClick={() => scroll(1)}>
        <ChevronIcon />
      </button>
    </div>
  );
}
