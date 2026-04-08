"use client";
import React, { useMemo } from "react";
import { Path } from "react-konva";
import type { DrawElement } from "@/types/canvas";
import { getFreehandPath } from "@/utils/freehand";

interface Props {
  element: DrawElement;
  isSelected: boolean;
  onSelect: () => void;
}

export default function DrawElementRenderer({
  element,
  isSelected,
  onSelect,
}: Props) {
  const pathData = useMemo(
    () => getFreehandPath(element.points, element.strokeWidth),
    [element.points, element.strokeWidth]
  );

  return (
    <Path
      data={pathData}
      fill={element.strokeColor}
      opacity={element.opacity}
      onClick={onSelect}
      onTap={onSelect}
      hitStrokeWidth={20}
    />
  );
}
