"use client";
import React, { useRef } from "react";
import {
  MousePointer2,
  Hand,
  Pencil,
  Square,
  Circle,
  Minus,
  ArrowRight,
  Type,
  ImagePlus,
  Undo2,
  Redo2,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
} from "lucide-react";
import { useCanvasStore } from "@/store/canvasStore";
import { exportStageToPng } from "@/utils/stageExport";
import type { Tool } from "@/types/canvas";

const tools: { id: Tool; icon: React.ReactNode; label: string }[] = [
  { id: "select", icon: <MousePointer2 size={18} />, label: "Select (V)" },
  { id: "pan", icon: <Hand size={18} />, label: "Pan (Space)" },
  { id: "draw", icon: <Pencil size={18} />, label: "Draw (D)" },
  { id: "rectangle", icon: <Square size={18} />, label: "Rectangle (R)" },
  { id: "circle", icon: <Circle size={18} />, label: "Circle (C)" },
  { id: "line", icon: <Minus size={18} />, label: "Line (L)" },
  { id: "arrow", icon: <ArrowRight size={18} />, label: "Arrow (A)" },
  { id: "text", icon: <Type size={18} />, label: "Text (T)" },
  { id: "image", icon: <ImagePlus size={18} />, label: "Image (I)" },
];

export default function Toolbar() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    tool,
    setTool,
    strokeColor,
    fillColor,
    strokeWidth,
    setStrokeColor,
    setFillColor,
    setStrokeWidth,
    stageConfig,
    setStageConfig,
    deleteSelected,
    selectedId,
    setSelectedId,
    addElement,
    createImageElement,
    clearCanvas,
  } = useCanvasStore();

  const { undo, redo } = useCanvasStore.temporal.getState();

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      switch (e.key.toLowerCase()) {
        case "v":
          setTool("select");
          break;
        case " ":
          e.preventDefault();
          setTool("pan");
          break;
        case "d":
          setTool("draw");
          break;
        case "r":
          setTool("rectangle");
          break;
        case "c":
          setTool("circle");
          break;
        case "l":
          setTool("line");
          break;
        case "a":
          setTool("arrow");
          break;
        case "t":
          setTool("text");
          break;
        case "i":
          setTool("image");
          fileInputRef.current?.click();
          break;
        case "delete":
        case "backspace":
          if (selectedId) {
            e.preventDefault();
            deleteSelected();
          }
          break;
        case "z":
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setTool, deleteSelected, selectedId, undo, redo]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const img = new window.Image();
      img.onload = () => {
        // Scale down large images
        let w = img.width;
        let h = img.height;
        const maxSize = 600;
        if (w > maxSize || h > maxSize) {
          const ratio = Math.min(maxSize / w, maxSize / h);
          w *= ratio;
          h *= ratio;
        }

        // Place in center of current view
        const centerX =
          (-stageConfig.x + window.innerWidth / 2) / stageConfig.scale -
          w / 2;
        const centerY =
          (-stageConfig.y + window.innerHeight / 2) / stageConfig.scale -
          h / 2;

        const el = createImageElement(centerX, centerY, src, w, h);
        addElement(el);
        setTool("select");
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
    // Reset so the same file can be uploaded again
    e.target.value = "";
  };

  const handleToolClick = (toolId: Tool) => {
    if (toolId === "image") {
      fileInputRef.current?.click();
    }
    setTool(toolId);
  };

  const handleExportPng = () => {
    const prev = selectedId;
    setSelectedId(null);
    // Wait one frame for the transformer to unmount before capturing
    requestAnimationFrame(() => {
      exportStageToPng();
      if (prev) setSelectedId(prev);
    });
  };

  const zoomIn = () => {
    const newScale = Math.min(5, stageConfig.scale * 1.2);
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    setStageConfig({
      scale: newScale,
      x: centerX - ((centerX - stageConfig.x) / stageConfig.scale) * newScale,
      y: centerY - ((centerY - stageConfig.y) / stageConfig.scale) * newScale,
    });
  };

  const zoomOut = () => {
    const newScale = Math.max(0.1, stageConfig.scale / 1.2);
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    setStageConfig({
      scale: newScale,
      x: centerX - ((centerX - stageConfig.x) / stageConfig.scale) * newScale,
      y: centerY - ((centerY - stageConfig.y) / stageConfig.scale) * newScale,
    });
  };

  const resetView = () => {
    setStageConfig({ x: 0, y: 0, scale: 1 });
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* Main toolbar */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-white rounded-xl shadow-lg border border-gray-200 px-2 py-1.5">
        {tools.map((t) => (
          <button
            key={t.id}
            title={t.label}
            onClick={() => handleToolClick(t.id)}
            className={`p-2 rounded-lg transition-colors ${
              tool === t.id
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {t.icon}
          </button>
        ))}

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Stroke color */}
        <div className="relative" title="Stroke color">
          <input
            type="color"
            value={strokeColor}
            onChange={(e) => setStrokeColor(e.target.value)}
            className="w-7 h-7 rounded-md cursor-pointer border border-gray-300"
          />
        </div>

        {/* Fill color */}
        <div className="relative" title="Fill color">
          <input
            type="color"
            value={fillColor}
            onChange={(e) => setFillColor(e.target.value)}
            className="w-7 h-7 rounded-md cursor-pointer border border-gray-300"
            style={{
              background: `linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%)`,
              backgroundSize: "8px 8px",
              backgroundPosition: "0 0, 4px 4px",
            }}
          />
        </div>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Stroke width */}
        <div className="flex items-center gap-1" title="Stroke width">
          <input
            type="range"
            min="1"
            max="20"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="w-16 h-1 accent-blue-600"
          />
          <span className="text-xs text-gray-500 w-4">{strokeWidth}</span>
        </div>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Undo / Redo */}
        <button
          title="Undo (⌘Z)"
          onClick={() => undo()}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <Undo2 size={18} />
        </button>
        <button
          title="Redo (⌘⇧Z)"
          onClick={() => redo()}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <Redo2 size={18} />
        </button>

        {/* Delete */}
        <button
          title="Delete selected"
          onClick={deleteSelected}
          disabled={!selectedId}
          className={`p-2 rounded-lg transition-colors ${
            selectedId
              ? "text-red-500 hover:bg-red-50"
              : "text-gray-300 cursor-not-allowed"
          }`}
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Zoom controls - bottom right */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-1 bg-white rounded-xl shadow-lg border border-gray-200 px-2 py-1.5">
        <button
          title="Zoom out"
          onClick={zoomOut}
          className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ZoomOut size={16} />
        </button>
        <span className="text-xs text-gray-600 w-10 text-center font-medium">
          {Math.round(stageConfig.scale * 100)}%
        </span>
        <button
          title="Zoom in"
          onClick={zoomIn}
          className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ZoomIn size={16} />
        </button>
        <div className="w-px h-5 bg-gray-200 mx-0.5" />
        <button
          title="Reset view"
          onClick={resetView}
          className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <RotateCcw size={16} />
        </button>
        <div className="w-px h-5 bg-gray-200 mx-0.5" />
        <button
          title="Save as PNG"
          onClick={handleExportPng}
          className="p-2.5 rounded-lg text-white bg-blue-500 hover:bg-blue-600 transition-colors shadow-sm"
        >
          <Download size={22} />
        </button>
      </div>

      {/* Clear canvas button - bottom left */}
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={() => {
            if (window.confirm("Clear the entire canvas? This cannot be undone.")) {
              clearCanvas();
            }
          }}
          className="flex items-center gap-1.5 bg-white rounded-xl shadow-lg border border-gray-200 px-3 py-2 text-xs text-gray-500 hover:text-red-500 hover:border-red-200 transition-colors"
        >
          <Trash2 size={14} />
          Clear all
        </button>
      </div>
    </>
  );
}
