"use client";
import dynamic from "next/dynamic";
import Toolbar from "@/components/Toolbar";

// react-konva uses window/document, so we must disable SSR
const InfiniteCanvas = dynamic(() => import("@/components/InfiniteCanvas"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
      <p className="text-gray-400 text-sm">Loading canvas...</p>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="w-screen h-screen overflow-hidden">
      <Toolbar />
      <InfiniteCanvas />
    </main>
  );
}
