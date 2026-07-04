import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ProSidebar } from "@/components/pro-sidebar";

export const Route = createFileRoute("/app")({
  component: AppLayout,
  head: () => ({
    meta: [
      { title: "Painel — GeradorPro" },
      { name: "description", content: "Painel administrativo para geração de banners esportivos e de entretenimento." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function AppLayout() {
  return (
    <div className="flex min-h-screen bg-[#0a0f1e] text-slate-100">
      <ProSidebar />
      <main className="flex-1 min-w-0">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
