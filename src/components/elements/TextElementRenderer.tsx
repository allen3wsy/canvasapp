"use client";
import React, { useRef, useEffect } from "react";
import { Text, Transformer } from "react-konva";
import type { TextElement } from "@/types/canvas";
import Konva from "konva";

interface Props {
  element: TextElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<TextElement>) => void;
  stageRef: React.RefObject<Konva.Stage>;
}

export default function TextElementRenderer({
  element,
  isSelected,
  onSelect,
  onChange,
  stageRef,
}: Props) {
  const textRef = useRef<Konva.Text>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && textRef.current) {
      trRef.current.nodes([textRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleDblClick = () => {
    const textNode = textRef.current;
    const stage = stageRef.current;
    if (!textNode || !stage) return;

    // Hide the text node while editing
    textNode.hide();
    if (trRef.current) trRef.current.hide();

    const textPosition = textNode.absolutePosition();
    const stageBox = stage.container().getBoundingClientRect();
    const stageTransform = stage.getAbsoluteTransform().copy();

    const areaPosition = {
      x: stageBox.left + textPosition.x,
      y: stageBox.top + textPosition.y,
    };

    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);

    const scale = stageTransform.decompose().scaleX;

    textarea.value = element.text;
    textarea.style.position = "absolute";
    textarea.style.top = areaPosition.y + "px";
    textarea.style.left = areaPosition.x + "px";
    textarea.style.width = element.width * scale + "px";
    textarea.style.minHeight = "40px";
    textarea.style.fontSize = element.fontSize * scale + "px";
    textarea.style.fontFamily = element.fontFamily;
    textarea.style.color = element.fillColor;
    textarea.style.border = "2px solid #4f8ff7";
    textarea.style.padding = "4px";
    textarea.style.margin = "0px";
    textarea.style.overflow = "hidden";
    textarea.style.background = "transparent";
    textarea.style.outline = "none";
    textarea.style.resize = "none";
    textarea.style.lineHeight = "1.2";
    textarea.style.zIndex = "1000";
    textarea.style.borderRadius = "4px";

    textarea.focus();

    const removeTextarea = () => {
      if (document.body.contains(textarea)) {
        document.body.removeChild(textarea);
      }
      textNode.show();
      if (trRef.current) trRef.current.show();
    };

    textarea.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onChange({ text: textarea.value });
        removeTextarea();
      }
      if (e.key === "Escape") {
        removeTextarea();
      }
    });

    textarea.addEventListener("blur", () => {
      onChange({ text: textarea.value });
      removeTextarea();
    });
  };

  return (
    <>
      <Text
        ref={textRef}
        x={element.x}
        y={element.y}
        text={element.text || "Double-click to edit"}
        fontSize={element.fontSize}
        fontFamily={element.fontFamily}
        fill={element.text ? element.fillColor : "#999"}
        width={element.width}
        rotation={element.rotation}
        opacity={element.opacity}
        draggable={true}
        onClick={onSelect}
        onTap={onSelect}
        onDblClick={handleDblClick}
        onDblTap={handleDblClick}
        onDragEnd={(e) => {
          onChange({ x: e.target.x(), y: e.target.y() });
        }}
        onTransformEnd={() => {
          const node = textRef.current;
          if (!node) return;
          const scaleX = node.scaleX();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            x: node.x(),
            y: node.y(),
            width: Math.max(20, node.width() * scaleX),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          flipEnabled={false}
          enabledAnchors={[
            "middle-left",
            "middle-right",
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
          ]}
          boundBoxFunc={(oldBox, newBox) => {
            if (Math.abs(newBox.width) < 20) return oldBox;
            return newBox;
          }}
        />
      )}
    </>
  );
}
