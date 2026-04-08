"use client";
import React from "react";
import { Line } from "react-konva";
import type { LineElement } from "@/types/canvas";

interface Props {
  element: LineElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<LineElement>) => void;
}

export default function LineElementRenderer({
  element,
  isSelected,
  onSelect,
  onChange,
}: Props) {
  return (
    <Line
      points={element.points}
      stroke={element.strokeColor}
      strokeWidth={element.strokeWidth}
      opacity={element.opacity}
      lineCap="round"
      lineJoin="round"
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
