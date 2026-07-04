import { createFileRoute } from "@tanstack/react-router";
import { SingleGenerator } from "@/components/pro/single-generator";

export const Route = createFileRoute("/app/futebol")({
  component: () => <SingleGenerator category="futebol" title="Gerador de Banner — Futebol" iconEmoji="⚽" />,
});
