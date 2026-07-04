import { createFileRoute } from "@tanstack/react-router";
import { LeftSidebar } from "@/components/banner/left-sidebar";
import { RightSidebar } from "@/components/banner/right-sidebar";
import { TopBar } from "@/components/banner/top-bar";
import { Canvas } from "@/components/banner/canvas";

export const Route = createFileRoute("/editor")({
  component: EditorPage,
});

const CANVAS_ID = "banner-canvas";

function EditorPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <LeftSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar canvasId={CANVAS_ID} />
        <Canvas canvasId={CANVAS_ID} />
      </div>
      <RightSidebar />
    </div>
  );
}
