import { create } from "zustand";
import { temporal } from "zundo";
import { nanoid } from "nanoid";
import type {
  CanvasElement,
  Tool,
  StageConfig,
  DrawElement,
  RectangleElement,
  CircleElement,
  LineElement,
  ArrowElement,
  TextElement,
  ImageElement,
} from "@/types/canvas";

const STORAGE_KEY = "infinite-canvas-data";

interface CanvasState {
  // Elements on the canvas
  elements: CanvasElement[];
  // Currently selected element ID
  selectedId: string | null;
  // Current active tool
  tool: Tool;
  // Stage pan/zoom config
  stageConfig: StageConfig;
  // Drawing options
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  fontSize: number;

  // Actions
  setTool: (tool: Tool) => void;
  setStrokeColor: (color: string) => void;
  setFillColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setFontSize: (size: number) => void;
  setStageConfig: (config: StageConfig) => void;
  setSelectedId: (id: string | null) => void;
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
  deleteSelected: () => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
  clearCanvas: () => void;

  // Element creation helpers
  createDrawElement: (x: number, y: number) => DrawElement;
  createRectangleElement: (x: number, y: number) => RectangleElement;
  createCircleElement: (x: number, y: number) => CircleElement;
  createLineElement: (x: number, y: number) => LineElement;
  createArrowElement: (x: number, y: number) => ArrowElement;
  createTextElement: (x: number, y: number) => TextElement;
  createImageElement: (
    x: number,
    y: number,
    src: string,
    width: number,
    height: number
  ) => ImageElement;
}

export const useCanvasStore = create<CanvasState>()(
  temporal(
    (set, get) => ({
      elements: [],
      selectedId: null,
      tool: "select",
      stageConfig: { x: 0, y: 0, scale: 1 },
      strokeColor: "#000000",
      fillColor: "#ffffff",
      strokeWidth: 3,
      fontSize: 24,

      setTool: (tool) => set({ tool, selectedId: null }),
      setStrokeColor: (strokeColor) => set({ strokeColor }),
      setFillColor: (fillColor) => set({ fillColor }),
      setStrokeWidth: (strokeWidth) => set({ strokeWidth }),
      setFontSize: (fontSize) => set({ fontSize }),
      setStageConfig: (stageConfig) => set({ stageConfig }),
      setSelectedId: (selectedId) => set({ selectedId }),

      addElement: (element) =>
        set((state) => ({ elements: [...state.elements, element] })),

      updateElement: (id, updates) =>
        set((state) => ({
          elements: state.elements.map((el) =>
            el.id === id ? ({ ...el, ...updates } as CanvasElement) : el
          ),
        })),

      deleteElement: (id) =>
        set((state) => ({
          elements: state.elements.filter((el) => el.id !== id),
          selectedId: state.selectedId === id ? null : state.selectedId,
        })),

      deleteSelected: () => {
        const { selectedId } = get();
        if (selectedId) {
          get().deleteElement(selectedId);
        }
      },

      loadFromStorage: () => {
        if (typeof window === "undefined") return;
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const data = JSON.parse(saved);
            set({
              elements: data.elements || [],
              stageConfig: data.stageConfig || { x: 0, y: 0, scale: 1 },
            });
          }
        } catch (e) {
          console.error("Failed to load canvas data:", e);
        }
      },

      saveToStorage: () => {
        if (typeof window === "undefined") return;
        try {
          const { elements, stageConfig } = get();
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ elements, stageConfig })
          );
        } catch (e) {
          console.error("Failed to save canvas data:", e);
        }
      },

      clearCanvas: () => set({ elements: [], selectedId: null }),

      createDrawElement: (x, y) => ({
        id: nanoid(),
        type: "draw",
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 1,
        visible: true,
        points: [[x, y, 0.5]],
        strokeColor: get().strokeColor,
        strokeWidth: get().strokeWidth,
      }),

      createRectangleElement: (x, y) => ({
        id: nanoid(),
        type: "rectangle",
        x,
        y,
        rotation: 0,
        opacity: 1,
        visible: true,
        width: 0,
        height: 0,
        fillColor: get().fillColor,
        strokeColor: get().strokeColor,
        strokeWidth: get().strokeWidth,
      }),

      createCircleElement: (x, y) => ({
        id: nanoid(),
        type: "circle",
        x,
        y,
        rotation: 0,
        opacity: 1,
        visible: true,
        radiusX: 0,
        radiusY: 0,
        fillColor: get().fillColor,
        strokeColor: get().strokeColor,
        strokeWidth: get().strokeWidth,
      }),

      createLineElement: (x, y) => ({
        id: nanoid(),
        type: "line",
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 1,
        visible: true,
        points: [x, y, x, y],
        strokeColor: get().strokeColor,
        strokeWidth: get().strokeWidth,
      }),

      createArrowElement: (x, y) => ({
        id: nanoid(),
        type: "arrow",
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 1,
        visible: true,
        points: [x, y, x, y],
        strokeColor: get().strokeColor,
        strokeWidth: get().strokeWidth,
      }),

      createTextElement: (x, y) => ({
        id: nanoid(),
        type: "text",
        x,
        y,
        rotation: 0,
        opacity: 1,
        visible: true,
        text: "",
        fontSize: get().fontSize,
        fontFamily: "Inter, sans-serif",
        fillColor: get().strokeColor,
        width: 200,
      }),

      createImageElement: (x, y, src, width, height) => ({
        id: nanoid(),
        type: "image",
        x,
        y,
        rotation: 0,
        opacity: 1,
        visible: true,
        src,
        width,
        height,
      }),
    }),
    {
      // Only track element changes for undo/redo
      partialize: (state) => ({
        elements: state.elements,
      }),
      limit: 100,
    }
  )
);
