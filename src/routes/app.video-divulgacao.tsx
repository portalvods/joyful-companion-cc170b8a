import { createFileRoute } from "@tanstack/react-router";
import { Megaphone } from "lucide-react";
import { SoonPage } from "./app.video";

export const Route = createFileRoute("/app/video-divulgacao")({
  component: () => <SoonPage icon={Megaphone} title="Vídeo de Divulgação" desc="Vídeo promocional do seu canal com sua marca. Em breve." />,
});
