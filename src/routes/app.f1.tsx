import { createFileRoute } from "@tanstack/react-router";
import { SingleGenerator } from "@/components/pro/single-generator";

export const Route = createFileRoute("/app/f1")({
  component: () => <SingleGenerator category="f1" title="Gerador de Banner — Fórmula 1" iconEmoji="🏁" />,
});
