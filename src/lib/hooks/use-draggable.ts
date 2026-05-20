"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Position {
  x: number;
  y: number;
}

export function useDraggable() {
  const [pos, setPos] = useState<Position | null>(null);
  const dragging = useRef(false);
  const offset = useRef<Position>({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement | null>(null);

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button, input, select, a")) return;
    e.preventDefault();
    dragging.current = true;

    const rect = elementRef.current?.getBoundingClientRect();
    if (!rect) return;

    const currentX = pos?.x ?? rect.left;
    const currentY = pos?.y ?? rect.top;
    offset.current = { x: e.clientX - currentX, y: e.clientY - currentY };
  }, [pos]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const x = e.clientX - offset.current.x;
      const y = e.clientY - offset.current.y;
      setPos({ x, y });
    };

    const onMouseUp = () => {
      dragging.current = false;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const style = pos
    ? { position: "fixed" as const, left: pos.x, top: pos.y, margin: 0 }
    : undefined;

  return { elementRef, onMouseDown, style, isDragged: pos !== null };
}
