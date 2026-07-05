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

  // Modelos especializados (baseados nas artes de referência)
  if (opts.modelId === "fut-prog") {
    renderProgramacao(ctx, size, h, color, opts);
    return;
  }
  if (opts.modelId === "fut-destaques") {
    renderDestaques(ctx, size, h, color, opts);
    return;
  }

  drawBackground(ctx, size, h, color);
  drawHeader(ctx, size, h, color, opts.title ?? defaultTitle(model));
  drawGames(ctx, size, h, color, opts.games, model);
  drawFooter(ctx, size, h, color, opts.whatsapp);
  if (opts.logoDataUrl) drawLogo(ctx, size, opts.logoDataUrl);
}

// ============ MODELO: PROGRAMAÇÃO DE FUTEBOL ============
// Pôster estilo estádio com título gigante "PROGRAMAÇÃO DE FUTEBOL" e faixa de data
function renderProgramacao(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: { primary: string; secondary: string; accent: string },
  opts: RenderOptions,
) {
  // fundo: gradiente estádio (noite → gramado)
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#050813");
  bg.addColorStop(0.45, "#0d1a3a");
  bg.addColorStop(0.55, "#0a2b0f");
  bg.addColorStop(1, "#040a04");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // luzes do estádio (círculos radiais)
  for (let i = 0; i < 3; i++) {
    const cx = w * (0.2 + i * 0.3);
    const cy = h * 0.12;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.35);
    g.addColorStop(0, "rgba(255, 240, 200, 0.18)");
    g.addColorStop(1, "rgba(255, 240, 200, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  // silhuetas de jogadores (abstratas) — 3 blocos verticais
  ctx.save();
  const silY = h * 0.15;
  const silH = h * 0.5;
  const cols = [
    { x: w * 0.12, c: "#e5e7eb" },
    { x: w * 0.42, c: "#dc2626" },
    { x: w * 0.72, c: "#1e3a8a" },
  ];
  cols.forEach((col) => {
    const gg = ctx.createLinearGradient(col.x, silY, col.x, silY + silH);
    gg.addColorStop(0, col.c);
    gg.addColorStop(1, "rgba(0,0,0,0.6)");
    ctx.fillStyle = gg;
    ctx.globalAlpha = 0.85;
    // "camisa" trapezoidal
    ctx.beginPath();
    ctx.moveTo(col.x + w * 0.06, silY);
    ctx.lineTo(col.x + w * 0.1, silY + silH * 0.15);
    ctx.lineTo(col.x + w * 0.13, silY + silH);
    ctx.lineTo(col.x + w * 0.01, silY + silH);
    ctx.lineTo(col.x + w * 0.04, silY + silH * 0.15);
    ctx.closePath();
    ctx.fill();
    // "cabeça"
    ctx.beginPath();
    ctx.arc(col.x + w * 0.07, silY - h * 0.02, w * 0.03, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  // faixa laranja/accent atrás do título
  ctx.save();
  ctx.globalAlpha = 0.9;
  const barGrad = ctx.createLinearGradient(0, h * 0.62, w, h * 0.62);
  barGrad.addColorStop(0, color.primary);
  barGrad.addColorStop(1, color.accent);
  ctx.fillStyle = barGrad;
  ctx.fillRect(0, h * 0.58, w, h * 0.02);
  ctx.restore();

  // título "PROGRAMAÇÃO DE"
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = `900 ${Math.round(w * 0.075)}px 'Impact', 'Bebas Neue', sans-serif`;
  ctx.fillText("PROGRAMAÇÃO DE", w / 2, h * 0.68);

  // "FUTEBOL" — grande, gradiente laranja com sombra
  ctx.save();
  const bigFont = Math.round(w * 0.18);
  ctx.font = `900 ${bigFont}px 'Impact', 'Bebas Neue', sans-serif`;
  const grad = ctx.createLinearGradient(0, h * 0.72, 0, h * 0.85);
  grad.addColorStop(0, color.accent);
  grad.addColorStop(0.5, color.secondary);
  grad.addColorStop(1, color.primary);
  ctx.fillStyle = grad;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = w * 0.006;
  ctx.strokeText("FUTEBOL", w / 2, h * 0.83);
  ctx.fillText("FUTEBOL", w / 2, h * 0.83);
  ctx.restore();

  // pílula da data
  const pillW = w * 0.72;
  const pillH = h * 0.065;
  const pillX = (w - pillW) / 2;
  const pillY = h * 0.87;
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, pillX, pillY, pillW, pillH, pillH / 2);
  ctx.fill();
  // inner
  ctx.fillStyle = color.primary;
  roundRect(ctx, pillX + 8, pillY + 6, pillW - 16, pillH - 12, (pillH - 12) / 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = `900 ${Math.round(pillH * 0.55)}px 'Impact', 'Bebas Neue', sans-serif`;
  ctx.textBaseline = "middle";
  ctx.fillText(opts.title ?? formatToday(), w / 2, pillY + pillH / 2);
  ctx.textBaseline = "alphabetic";

  // rodapé — chamada / whatsapp
  const footY = h * 0.95;
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, w * 0.1, footY, w * 0.8, h * 0.04, h * 0.02);
  ctx.fill();
  ctx.fillStyle = "#0a0a0a";
  ctx.font = `800 ${Math.round(w * 0.028)}px 'Impact', sans-serif`;
  ctx.fillText(
    opts.whatsapp ? `WHATSAPP: ${opts.whatsapp}` : "OS MELHORES CAMPEONATOS ESTÃO AQUI!",
    w / 2,
    footY + h * 0.028,
  );
}

// ============ MODELO: DESTAQUES DO DIA ============
// Layout vertical com título "DES/TA/QUES" e lista de jogos com escudos genéricos
function renderDestaques(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: { primary: string; secondary: string; accent: string },
  opts: RenderOptions,
) {
  // fundo claro texturizado
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "#f1f5f9");
  bg.addColorStop(1, "#cbd5e1");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // faixa lateral direita accent
  ctx.fillStyle = color.primary;
  ctx.fillRect(w * 0.94, 0, w * 0.06, h);
  // faixa esquerda accent fina
  ctx.fillStyle = color.accent;
  ctx.fillRect(0, 0, w * 0.006, h);

  // bloco de imagem à direita (silhueta esportiva abstrata)
  ctx.save();
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.moveTo(w * 0.55, 0);
  ctx.lineTo(w * 0.94, 0);
  ctx.lineTo(w * 0.94, h * 0.88);
  ctx.lineTo(w * 0.5, h * 0.88);
  ctx.closePath();
  ctx.fill();
  // silhueta atleta
  const cx = w * 0.72;
  const cy = h * 0.4;
  const rg = ctx.createRadialGradient(cx, cy, 10, cx, cy, w * 0.25);
  rg.addColorStop(0, color.primary);
  rg.addColorStop(1, "transparent");
  ctx.fillStyle = rg;
  ctx.fillRect(w * 0.5, 0, w * 0.44, h * 0.88);
  // "corpo"
  ctx.fillStyle = "#1e40af";
  ctx.beginPath();
  ctx.ellipse(cx, cy + h * 0.15, w * 0.12, h * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();
  // "cabeça"
  ctx.fillStyle = "#c9a37a";
  ctx.beginPath();
  ctx.arc(cx, cy - h * 0.05, w * 0.055, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // título "DES / TA / QUES" empilhado
  ctx.fillStyle = color.primary;
  ctx.textAlign = "left";
  const titleFont = Math.round(w * 0.11);
  ctx.font = `900 ${titleFont}px 'Impact', 'Bebas Neue', sans-serif`;
  ctx.fillText("DES", w * 0.04, h * 0.07);
  ctx.fillText("TA", w * 0.04, h * 0.13);
  ctx.fillText("QUES", w * 0.04, h * 0.19);

  // subdata
  ctx.fillStyle = "#334155";
  ctx.font = `700 ${Math.round(w * 0.035)}px 'Space Grotesk', sans-serif`;
  ctx.fillText(opts.title ?? formatToday().replace(" - ", " · "), w * 0.22, h * 0.09);

  // lista de jogos à esquerda (até 5)
  const list = (opts.games.length ? opts.games : sampleGamesLocal()).slice(0, 5);
  const listStartY = h * 0.24;
  const listH = h * 0.62;
  const rowH = listH / list.length;

  list.forEach((g, i) => {
    const y = listStartY + i * rowH;
    // rótulo campeonato (vertical)
    ctx.save();
    ctx.translate(w * 0.015, y + rowH * 0.5);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = "#64748b";
    ctx.font = `700 ${Math.round(w * 0.018)}px 'Space Grotesk', sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText((g.championship || "CAMPEONATO").toUpperCase().slice(0, 20), 0, 0);
    ctx.restore();

    // escudos abstratos
    drawShield(ctx, w * 0.08, y + rowH * 0.2, w * 0.06, "#eab308");
    drawShield(ctx, w * 0.22, y + rowH * 0.2, w * 0.06, color.primary);
    // "VS"
    ctx.fillStyle = color.primary;
    ctx.textAlign = "center";
    ctx.font = `900 ${Math.round(w * 0.05)}px 'Impact', sans-serif`;
    ctx.fillText("VS", w * 0.15, y + rowH * 0.32);

    // nomes dos times
    ctx.fillStyle = "#0f172a";
    ctx.textAlign = "left";
    ctx.font = `900 ${Math.round(w * 0.035)}px 'Impact', sans-serif`;
    ctx.fillText((g.team1 || "TIME A").toUpperCase(), w * 0.06, y + rowH * 0.65);
    ctx.fillText((g.team2 || "TIME B").toUpperCase(), w * 0.06, y + rowH * 0.8);

    // horário + canal
    ctx.fillStyle = color.primary;
    ctx.font = `800 ${Math.round(w * 0.03)}px 'Space Grotesk', sans-serif`;
    ctx.fillText(`${g.time ?? "--:--"} - ${(g.channel || "TV").toUpperCase()}`, w * 0.06, y + rowH * 0.94);
  });

  // rodapé — WhatsApp
  const footY = h * 0.92;
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = color.primary;
  ctx.lineWidth = 3;
  roundRect(ctx, w * 0.5, footY, w * 0.4, h * 0.05, h * 0.025);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = color.primary;
  ctx.textAlign = "center";
  ctx.font = `800 ${Math.round(w * 0.025)}px 'Space Grotesk', sans-serif`;
  ctx.fillText(opts.whatsapp ? `📱 ${opts.whatsapp}` : "📱 SEU WHATSAPP AQUI", w * 0.7, footY + h * 0.032);
}

function drawShield(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + size, y);
  ctx.lineTo(x + size, y + size * 0.7);
  ctx.quadraticCurveTo(x + size / 2, y + size * 1.2, x, y + size * 0.7);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function formatToday(): string {
  const now = new Date();
  const brasilia = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const wd = ["DOMINGO", "SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO"][brasilia.getUTCDay()];
  const dd = String(brasilia.getUTCDate()).padStart(2, "0");
  const mm = String(brasilia.getUTCMonth() + 1).padStart(2, "0");
  return `${wd} - ${dd}/${mm}`;
}

function sampleGamesLocal() {
  return sampleGames();
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
