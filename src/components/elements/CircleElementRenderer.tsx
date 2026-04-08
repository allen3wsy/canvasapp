"use client";
import React from "react";
import { Ellipse, Transformer } from "react-konva";
import type { CircleElement } from "@/types/canvas";
import Konva from "konva";

interface Props {
  element: CircleElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<CircleElement>) => void;
}

export default function CircleElementRenderer({
  element,
  isSelected,
  onSelect,
  onChange,
}: Props) {
  const shapeRef = React.useRef<Konva.Ellipse>(null);
  const trRef = React.useRef<Konva.Transformer>(null);

  React.useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Ellipse
        ref={shapeRef}
        x={element.x}
        y={element.y}
        radiusX={element.radiusX}
        radiusY={element.radiusY}
        fill={element.fillColor}
        stroke={element.strokeColor}
        strokeWidth={element.strokeWidth}
        rotation={element.rotation}
        opacity={element.opacity}
        draggable={true}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onChange({ x: e.target.x(), y: e.target.y() });
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          if (!node) return;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            x: node.x(),
            y: node.y(),
            radiusX: Math.max(5, node.radiusX() * scaleX),
            radiusY: Math.max(5, node.radiusY() * scaleY),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          flipEnabled={false}
          boundBoxFunc={(oldBox, newBox) => {
            if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
}
