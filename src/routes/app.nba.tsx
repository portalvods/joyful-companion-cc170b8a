import { createFileRoute } from "@tanstack/react-router";
import { SingleGenerator } from "@/components/pro/single-generator";

export const Route = createFileRoute("/app/nba")({
  component: () => <SingleGenerator category="nba" title="Gerador de Banner — Basquete" iconEmoji="🏀" />,
});
