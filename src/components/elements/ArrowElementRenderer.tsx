"use client";
import React from "react";
import { Arrow } from "react-konva";
import type { ArrowElement } from "@/types/canvas";

interface Props {
  element: ArrowElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<ArrowElement>) => void;
}

export default function ArrowElementRenderer({
  element,
  isSelected,
  onSelect,
  onChange,
}: Props) {
  return (
    <Arrow
      points={element.points}
      stroke={element.strokeColor}
      strokeWidth={element.strokeWidth}
      fill={element.strokeColor}
      opacity={element.opacity}
      lineCap="round"
      lineJoin="round"
      pointerLength={element.strokeWidth * 4}
      pointerWidth={element.strokeWidth * 4}
      draggable={true}
      onClick={onSelect}
      onTap={onSelect}
      hitStrokeWidth={20}
      onDragEnd={(e) => {
        const dx = e.target.x();
        const dy = e.target.y();
        const newPoints = element.points.map((p, i) =>
          i % 2 === 0 ? p + dx : p + dy
        );
        e.target.position({ x: 0, y: 0 });
        onChange({ points: newPoints });
      }}
    />
  );
}
