import { createFileRoute } from "@tanstack/react-router";
import { MediaBanner } from "./app.filmes";

export const Route = createFileRoute("/app/series")({
  component: () => <MediaBanner tipo="serie" />,
});
