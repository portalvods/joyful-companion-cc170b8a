import { createFileRoute } from "@tanstack/react-router";
import { SingleGenerator } from "@/components/pro/single-generator";

export const Route = createFileRoute("/app/ufc")({
  component: () => <SingleGenerator category="ufc" title="Gerador de Banner — UFC" iconEmoji="🥊" />,
});
