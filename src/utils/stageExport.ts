import type Konva from "konva";

let stageInstance: Konva.Stage | null = null;

export function registerStage(stage: Konva.Stage | null) {
  stageInstance = stage;
}

export function exportStageToPng() {
  if (!stageInstance) return;

  const dataURL = stageInstance.toDataURL({ pixelRatio: 2 });
  const link = document.createElement("a");
  link.download = `canvas-${Date.now()}.png`;
  link.href = dataURL;
  link.click();
}
