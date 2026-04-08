"use client";
import React, { useRef, useCallback, useEffect, useState } from "react";
import { Stage, Layer } from "react-konva";
import Konva from "konva";
import { useCanvasStore } from "@/store/canvasStore";
import type { CanvasElement } from "@/types/canvas";
import DrawElementRenderer from "./elements/DrawElementRenderer";
import RectangleElementRenderer from "./elements/RectangleElementRenderer";
import CircleElementRenderer from "./elements/CircleElementRenderer";
import LineElementRenderer from "./elements/LineElementRenderer";
import ArrowElementRenderer from "./elements/ArrowElementRenderer";
import TextElementRenderer from "./elements/TextElementRenderer";
import ImageElementRenderer from "./elements/ImageElementRenderer";

const MIN_SCALE = 0.1;
const MAX_SCALE = 5;
const ZOOM_SPEED = 1.1;

export default function InfiniteCanvas() {
  const stageRef = useRef<Konva.Stage>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const isDrawing = useRef(false);
  const currentElementId = useRef<string | null>(null);

  const {
    elements,
    selectedId,
    tool,
    stageConfig,
    setStageConfig,
    setSelectedId,
    addElement,
    updateElement,
    createDrawElement,
    createRectangleElement,
    createCircleElement,
    createLineElement,
    createArrowElement,
    createTextElement,
    saveToStorage,
    loadFromStorage,
  } = useCanvasStore();

  // Set dimensions on mount and resize
  useEffect(() => {
    const updateSize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Load from storage on mount
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Auto-save on element changes
  useEffect(() => {
    const timer = setTimeout(() => saveToStorage(), 500);
    return () => clearTimeout(timer);
  }, [elements, stageConfig, saveToStorage]);

  // Get pointer position relative to stage
  const getRelativePointerPosition = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return null;
    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    const pos = stage.getPointerPosition();
    if (!pos) return null;
    return transform.point(pos);
  }, []);

  // Handle wheel zoom
  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;

      const oldScale = stageConfig.scale;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const mousePointTo = {
        x: (pointer.x - stageConfig.x) / oldScale,
        y: (pointer.y - stageConfig.y) / oldScale,
      };

      const direction = e.evt.deltaY > 0 ? -1 : 1;
      const newScale = Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, direction > 0 ? oldScale * ZOOM_SPEED : oldScale / ZOOM_SPEED)
      );

      setStageConfig({
        scale: newScale,
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      });
    },
    [stageConfig, setStageConfig]
  );

  // Handle mouse down
  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      // If clicking on empty area with select tool, deselect
      if (e.target === e.target.getStage()) {
        if (tool === "select") {
          setSelectedId(null);
          return;
        }
      }

      const pos = getRelativePointerPosition();
      if (!pos) return;

      if (tool === "pan") {
        // Pan is handled by stage draggable
        return;
      }

      if (tool === "draw") {
        isDrawing.current = true;
        const el = createDrawElement(pos.x, pos.y);
        addElement(el);
        currentElementId.current = el.id;
        return;
      }

      if (tool === "rectangle") {
        isDrawing.current = true;
        const el = createRectangleElement(pos.x, pos.y);
        addElement(el);
        currentElementId.current = el.id;
        return;
      }

      if (tool === "circle") {
        isDrawing.current = true;
        const el = createCircleElement(pos.x, pos.y);
        addElement(el);
        currentElementId.current = el.id;
        return;
      }

      if (tool === "line") {
        isDrawing.current = true;
        const el = createLineElement(pos.x, pos.y);
        addElement(el);
        currentElementId.current = el.id;
        return;
      }

      if (tool === "arrow") {
        isDrawing.current = true;
        const el = createArrowElement(pos.x, pos.y);
        addElement(el);
        currentElementId.current = el.id;
        return;
      }

      if (tool === "text") {
        if (e.target === e.target.getStage()) {
          const el = createTextElement(pos.x, pos.y);
          addElement(el);
          setSelectedId(el.id);
        }
        return;
      }
    },
    [
      tool,
      getRelativePointerPosition,
      setSelectedId,
      addElement,
      createDrawElement,
      createRectangleElement,
      createCircleElement,
      createLineElement,
      createArrowElement,
      createTextElement,
    ]
  );

  // Handle mouse move
  const handleMouseMove = useCallback(() => {
    if (!isDrawing.current || !currentElementId.current) return;
    const pos = getRelativePointerPosition();
    if (!pos) return;

    const id = currentElementId.current;
    const el = elements.find((e) => e.id === id);
    if (!el) return;

    if (el.type === "draw") {
      const newPoints = [...el.points, [pos.x, pos.y, 0.5]];
      updateElement(id, { points: newPoints });
    }

    if (el.type === "rectangle") {
      updateElement(id, {
        width: pos.x - el.x,
        height: pos.y - el.y,
      });
    }

    if (el.type === "circle") {
      updateElement(id, {
        radiusX: Math.abs(pos.x - el.x),
        radiusY: Math.abs(pos.y - el.y),
      });
    }

    if (el.type === "line" || el.type === "arrow") {
      const points = [...el.points];
      points[2] = pos.x;
      points[3] = pos.y;
      updateElement(id, { points });
    }
  }, [elements, getRelativePointerPosition, updateElement]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    isDrawing.current = false;
    currentElementId.current = null;
  }, []);

  // Render a single element
  const renderElement = (element: CanvasElement) => {
    const isSelected = selectedId === element.id;
    const onSelect = () => {
      if (tool === "select") setSelectedId(element.id);
    };
    const onChange = (updates: Partial<CanvasElement>) =>
      updateElement(element.id, updates);

    switch (element.type) {
      case "draw":
        return (
          <DrawElementRenderer
            key={element.id}
            element={element}
            isSelected={isSelected}
            onSelect={onSelect}
          />
        );
      case "rectangle":
        return (
          <RectangleElementRenderer
            key={element.id}
            element={element}
            isSelected={isSelected}
            onSelect={onSelect}
            onChange={onChange}
          />
        );
      case "circle":
        return (
          <CircleElementRenderer
            key={element.id}
            element={element}
            isSelected={isSelected}
            onSelect={onSelect}
            onChange={onChange}
          />
        );
      case "line":
        return (
          <LineElementRenderer
            key={element.id}
            element={element}
            isSelected={isSelected}
            onSelect={onSelect}
            onChange={onChange}
          />
        );
      case "arrow":
        return (
          <ArrowElementRenderer
            key={element.id}
            element={element}
            isSelected={isSelected}
            onSelect={onSelect}
            onChange={onChange}
          />
        );
      case "text":
        return (
          <TextElementRenderer
            key={element.id}
            element={element}
            isSelected={isSelected}
            onSelect={onSelect}
            onChange={onChange}
            stageRef={stageRef as React.RefObject<Konva.Stage>}
          />
        );
      case "image":
        return (
          <ImageElementRenderer
            key={element.id}
            element={element}
            isSelected={isSelected}
            onSelect={onSelect}
            onChange={onChange}
          />
        );
      default:
        return null;
    }
  };

  const isPanMode = tool === "pan";
  const cursorStyle =
    tool === "pan"
      ? "grab"
      : tool === "select"
      ? "default"
      : tool === "text"
      ? "text"
      : "crosshair";

  return (
    <div
      style={{ cursor: cursorStyle }}
      className="fixed inset-0"
    >
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        scaleX={stageConfig.scale}
        scaleY={stageConfig.scale}
        x={stageConfig.x}
        y={stageConfig.y}
        draggable={isPanMode}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        onDragEnd={(e) => {
          if (isPanMode && e.target === stageRef.current) {
            setStageConfig({
              ...stageConfig,
              x: e.target.x(),
              y: e.target.y(),
            });
          }
        }}
      >
        <Layer>{elements.map(renderElement)}</Layer>
      </Stage>
    </div>
  );
}
