import { getColor, getModel, type Game, type BannerModel } from "./pro-models";

export type RenderOptions = {
  modelId: string;
  colorId?: string;
  games: Game[];
  whatsapp?: string;
  logoDataUrl?: string | null;
  title?: string;
  size?: number; // base pixel size (square). Default 1080.
};

const CANVAS_SIZE = 1080;

export function renderBanner(canvas: HTMLCanvasElement, opts: RenderOptions): void {
  const model = getModel(opts.modelId);
  if (!model) return;
  const color = getColor(opts.colorId);
  const size = opts.size ?? CANVAS_SIZE;
  const h = Math.round(size / model.aspectRatio);
  canvas.width = size;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  drawBackground(ctx, size, h, color);
  drawHeader(ctx, size, h, color, opts.title ?? defaultTitle(model));
  drawGames(ctx, size, h, color, opts.games, model);
  drawFooter(ctx, size, h, color, opts.whatsapp);
  if (opts.logoDataUrl) drawLogo(ctx, size, opts.logoDataUrl);
}

function defaultTitle(m: BannerModel) {
  if (m.category === "futebol") return "JOGOS DO DIA";
  if (m.category === "nba") return "NBA HOJE";
  if (m.category === "ufc") return "FIGHT NIGHT";
  if (m.category === "f1") return "GRAND PRIX";
  return "DESTAQUES";
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: { primary: string; secondary: string; accent: string },
) {
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, "#0a0f1e");
  grad.addColorStop(0.5, color.primary);
  grad.addColorStop(1, "#0a0f1e");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // texture dots
  ctx.fillStyle = "rgba(255,255,255,0.03)";
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    ctx.fillRect(x, y, 2, 2);
  }

  // diagonal accent
  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = color.accent;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.85);
  ctx.lineTo(w, h * 0.7);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawHeader(
  ctx: CanvasRenderingContext2D,
  w: number,
  _h: number,
  color: { accent: string },
  title: string,
) {
  ctx.textAlign = "center";
  ctx.fillStyle = color.accent;
  ctx.font = "bold 26px 'Bebas Neue', Impact, sans-serif";
  ctx.fillText(new Date().toLocaleDateString("pt-BR", { weekday: "long" }).toUpperCase(), w / 2, 60);

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 72px 'Bebas Neue', Impact, sans-serif";
  ctx.fillText(title, w / 2, 130);

  // underline
  ctx.fillStyle = color.accent;
  ctx.fillRect(w / 2 - 80, 145, 160, 4);
}

function drawGames(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: { primary: string; secondary: string; accent: string },
  games: Game[],
  _model: BannerModel,
) {
  const list = games.length ? games : sampleGames();
  const startY = 190;
  const endY = h - 140;
  const rowH = Math.min(78, (endY - startY) / Math.max(list.length, 1));
  const pad = 40;

  list.forEach((g, i) => {
    const y = startY + i * rowH;
    // row card
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    roundRect(ctx, pad, y, w - pad * 2, rowH - 10, 12);
    ctx.fill();
    // left color bar
    ctx.fillStyle = color.accent;
    roundRect(ctx, pad, y, 8, rowH - 10, 4);
    ctx.fill();

    // time badge
    ctx.fillStyle = color.secondary;
    roundRect(ctx, pad + 20, y + 12, 90, rowH - 34, 8);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 22px 'Space Grotesk', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(g.time ?? "--:--", pad + 65, y + rowH / 2);

    // teams
    ctx.textAlign = "left";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 26px 'Space Grotesk', sans-serif";
    const teamsText = `${g.team1}  ×  ${g.team2}`;
    ctx.fillText(teamsText, pad + 130, y + rowH / 2 + 2);

    // channel
    if (g.channel) {
      ctx.textAlign = "right";
      ctx.fillStyle = color.accent;
      ctx.font = "600 18px 'Space Grotesk', sans-serif";
      ctx.fillText(g.channel, w - pad - 20, y + rowH / 2 + 2);
    }
  });
}

function drawFooter(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: { secondary: string; accent: string },
  whatsapp?: string,
) {
  const fy = h - 90;
  ctx.fillStyle = color.secondary;
  ctx.fillRect(0, fy, w, 90);

  ctx.fillStyle = "#fff";
  ctx.font = "bold 32px 'Bebas Neue', Impact, sans-serif";
  ctx.textAlign = "center";
  if (whatsapp) {
    ctx.fillText(`WHATSAPP: ${whatsapp}`, w / 2, fy + 55);
  } else {
    ctx.fillText("GERADORPRO", w / 2, fy + 55);
  }
}

function drawLogo(ctx: CanvasRenderingContext2D, w: number, dataUrl: string) {
  const img = new Image();
  img.onload = () => {
    const size = 90;
    ctx.drawImage(img, w - size - 30, 30, size, size);
  };
  img.src = dataUrl;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function sampleGames(): Game[] {
  return [
    { team1: "Flamengo", team2: "Palmeiras", time: "16:00", channel: "GLOBO", championship: "Brasileirão" },
    { team1: "Santos", team2: "Corinthians", time: "18:30", channel: "SPORTV", championship: "Brasileirão" },
    { team1: "São Paulo", team2: "Grêmio", time: "20:00", channel: "PREMIERE", championship: "Brasileirão" },
    { team1: "Internacional", team2: "Botafogo", time: "21:30", channel: "GLOBO", championship: "Brasileirão" },
  ];
}

export async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("blob"))), "image/png");
  });
}
