// "IA" mockada — extrai título, subtítulo, CTA e cupom de um texto bruto.
// Usa heurísticas: percentuais viram desconto, palavras com CAPS+NUM viram cupom,
// datas viram urgência, primeira frase vira título.
import type { BannerContent } from "./banner-types";

const CTA_HINTS = [
  { re: /aproveit\w+/i, cta: "Aproveite agora" },
  { re: /compr\w+/i, cta: "Compre já" },
  { re: /reserv\w+/i, cta: "Reserve agora" },
  { re: /inscre\w+/i, cta: "Inscreva-se" },
  { re: /baix\w+/i, cta: "Baixe grátis" },
  { re: /confir\w+/i, cta: "Confira" },
];

function pickCta(text: string): string {
  for (const h of CTA_HINTS) if (h.re.test(text)) return h.cta;
  if (/desconto|promo|off|%/i.test(text)) return "Garanta o desconto";
  return "Saiba mais";
}

function extractDiscount(text: string): string | null {
  const m = text.match(/(\d{1,3})\s?%/);
  if (!m) return null;
  return `${m[1]}% OFF`;
}

function extractCoupon(text: string): string | null {
  const m = text.match(/cupom[:\s]+([A-Z0-9]{3,20})/i);
  if (m) return m[1].toUpperCase();
  // fallback: standalone CAPS+digits token
  const m2 = text.match(/\b([A-Z]{2,}\d{1,4}|[A-Z]{3,}\d{2,})\b/);
  return m2 ? m2[1] : null;
}

function extractUrgency(text: string): string | null {
  if (/hoje|24h|apenas hoje|últim\w+ hor\w+/i.test(text)) return "Só hoje!";
  if (/amanhã/i.test(text)) return "Válido até amanhã";
  if (/fim de semana|weekend/i.test(text)) return "Fim de semana";
  if (/válid\w+ até\s+([^\.,\n]+)/i.test(text)) {
    const m = text.match(/válid\w+ até\s+([^\.,\n]+)/i);
    return m ? `Válido até ${m[1].trim()}` : null;
  }
  return null;
}

function firstSentence(text: string): string {
  const s = text.split(/[\.\n!?;]/)[0].trim();
  return s || text.slice(0, 60);
}

function guessTitle(text: string): string {
  const s = firstSentence(text);
  // pega até 6 primeiras palavras significativas
  const words = s.split(/\s+/).slice(0, 8).join(" ");
  return words.replace(/,$/, "");
}

export async function extractContent(rawText: string): Promise<BannerContent> {
  // simula latência da IA pra sentir a experiência
  await new Promise((r) => setTimeout(r, 900 + Math.random() * 700));

  const text = rawText.trim();
  if (!text) return { title: "Seu título aqui", subtitle: "Cole um texto e clique em gerar", cta: "Saiba mais" };

  const discount = extractDiscount(text);
  const coupon = extractCoupon(text);
  const urgency = extractUrgency(text);
  const cta = pickCta(text);

  const title = discount ?? guessTitle(text).toUpperCase();
  const subtitle = discount
    ? guessTitle(text)
    : (urgency ?? (firstSentence(text.slice(title.length + 1)) || "Uma oferta imperdível"));

  return {
    title: title.slice(0, 60),
    subtitle: subtitle.slice(0, 90),
    cta,
    coupon: coupon ?? undefined,
    body: urgency ?? undefined,
  };
}

// modelos "de IA" — apenas cosmético pra sensação de escolha
export const AI_MODELS = [
  { id: "forge-fast", name: "Forge Fast", desc: "Rápido e conciso" },
  { id: "forge-creative", name: "Forge Creative", desc: "Mais criativo e ousado" },
  { id: "forge-pro", name: "Forge Pro", desc: "Máxima qualidade editorial" },
];
