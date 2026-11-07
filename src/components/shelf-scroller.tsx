"use client";

import { useEffect, useRef, useState } from "react";

import { ChevronIcon } from "@/components/icons";

export function ShelfScroller({ children }: { children: React.ReactNode }) {
  const list = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  useEffect(() => {
    const node = list.current;
    if (!node) return;
    const update = () =>
      setEdges({ start: node.scrollLeft <= 4, end: node.scrollLeft + node.clientWidth >= node.scrollWidth - 4 });
    update();
    node.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      node.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  const scroll = (direction: number) => {
    const node = list.current;
    if (node) node.scrollBy({ left: direction * node.clientWidth * 0.8, behavior: "smooth" });
  };
  const arrow = "absolute top-[calc(50%-36px)] z-10 hidden size-10 place-items-center rounded-full bg-background shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:bg-surface";
  return (
    <div className="relative">
      <ul ref={list} className="no-scrollbar -mx-1 flex snap-x gap-4 overflow-x-auto px-1">
        {children}
      </ul>
      <button type="button" className={`${arrow} -left-5 rotate-180 ${edges.start ? "" : "min-[801px]:grid"}`} aria-label="Scroll left" onClick={() => scroll(-1)}>
        <ChevronIcon />
      </button>
      <button type="button" className={`${arrow} -right-5 ${edges.end ? "" : "min-[801px]:grid"}`} aria-label="Scroll right" onClick={() => scroll(1)}>
        <ChevronIcon />
      </button>
    </div>
  );
}
