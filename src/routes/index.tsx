import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Sparkles, Trophy, Swords, Film, Tv, Play, Megaphone,
  Check, ArrowRight, ChevronDown, Zap, Shield, Clock, Palette, Users, TrendingUp, Award, Star,
} from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo-bannerpro.png";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "Banner Pro — Banners profissionais em segundos com IA" },
      { name: "description", content: "Crie banners personalizados de jogos, UFC, NBA, filmes e séries em segundos. Tudo com seu logotipo e telefone automaticamente." },
    ],
  }),
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <FloatingNav />
      <Hero />
      <Features />
      <Gallery />
      <Pricing />
      <Reseller />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}

// ==================================================================

function FloatingNav() {
  const links = [
    { href: "#recursos", label: "Recursos" },
    { href: "#precos", label: "Preços" },
    { href: "#revenda", label: "Revenda" },
  ];
  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
    >
      <nav className="flex items-center gap-1 md:gap-2 rounded-full bg-card/70 backdrop-blur-xl border border-border/50 px-2 py-2 shadow-2xl">
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="px-3 md:px-5 py-2 rounded-full text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-white/5 transition-colors"
          >
            {l.label}
          </a>
        ))}
        <Link
          to="/editor"
          className="ml-1 px-4 md:px-6 py-2 rounded-full bg-gold-gradient text-accent-foreground font-bold text-sm shadow-gold hover:brightness-110 transition"
        >
          Painel
        </Link>
      </nav>
    </motion.header>
  );
}

// ==================================================================

function Hero() {
  return (
    <section className="relative pt-40 pb-24 md:pt-56 md:pb-32 px-4">
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 glow-blob" />
        <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] glow-blob opacity-60" />
      </div>

      <div className="max-w-4xl mx-auto text-center">
        <motion.img
          src={logo}
          alt="Banner Pro"
          width={1024}
          height={768}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mx-auto w-64 md:w-80 lg:w-96 h-auto -mb-4 drop-shadow-[0_20px_50px_rgba(59,130,246,0.35)]"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-2 mt-8 mb-6 px-4 py-2 rounded-full bg-card/60 border border-border/60 backdrop-blur-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs font-medium text-foreground/80">Automatize sua criação de conteúdo</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.05] tracking-tight"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Banners Profissionais
          <br />
          <span className="bg-rainbow-text">em Segundos</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
        >
          Crie banners personalizados de <b className="text-foreground">jogos, esportes, filmes, séries</b> e muito mais.
          Tudo com seu logotipo e telefone automaticamente.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/editor"
            className="group flex items-center gap-2 px-8 py-4 rounded-full bg-gold-gradient text-accent-foreground font-bold shadow-gold hover:brightness-110 transition text-base"
          >
            Quero meu gerador
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
          </Link>
          <a
            href="#galeria"
            className="px-8 py-4 rounded-full border-2 border-accent/70 text-foreground font-bold hover:bg-accent/10 transition text-base"
          >
            Ver Exemplos
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
        >
          {[
            { icon: Shield, label: "Sem fidelidade" },
            { icon: Check, label: "Suporte incluído" },
            { icon: Zap, label: "Atualizações inclusas" },
          ].map((i) => (
            <div key={i.label} className="flex items-center gap-2">
              <i.icon className="w-4 h-4 text-green-400" />
              <span>{i.label}</span>
            </div>
          ))}
        </motion.div>

        <ChevronDown className="mx-auto mt-14 w-6 h-6 text-muted-foreground animate-bounce" />
      </div>
    </section>
  );
}

// ==================================================================

const FEATURES = [
  { icon: Trophy, title: "Jogos do Dia", desc: "Banners automáticos com os jogos do dia, seu logo e telefone", color: "from-green-500/20 to-emerald-500/5", iconColor: "text-emerald-400" },
  { icon: Swords, title: "UFC & Lutas", desc: "Cards profissionais de lutas e eventos de MMA", color: "from-red-500/20 to-rose-500/5", iconColor: "text-red-400" },
  { icon: Play, title: "NBA & Esportes", desc: "Banners de basquete, futebol americano e mais esportes", color: "from-orange-500/20 to-amber-500/5", iconColor: "text-orange-400" },
  { icon: Film, title: "Filmes & Séries", desc: "Divulgue lançamentos com banners cinematográficos", color: "from-purple-500/20 to-fuchsia-500/5", iconColor: "text-fuchsia-400" },
  { icon: Tv, title: "Vídeos & Trailers", desc: "Trailers automáticos com sua marca integrada", color: "from-cyan-500/20 to-sky-500/5", iconColor: "text-cyan-400" },
  { icon: Megaphone, title: "Propagandas", desc: "Anúncios personalizados para qualquer campanha", color: "from-yellow-500/20 to-amber-500/5", iconColor: "text-yellow-400" },
];

function Features() {
  return (
    <section id="recursos" className="py-24 md:py-32 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <SectionHeader kicker="Recursos Poderosos" title="Tudo que Você Precisa"
          desc="Conteúdo profissional e personalizado para todos os tipos de negócio, gerados com inteligência artificial" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className="group relative p-6 md:p-8 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/60 hover:border-primary/50 transition-all hover:-translate-y-1"
            >
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-100 transition-opacity -z-10`} />
              <div className={`w-14 h-14 rounded-xl bg-background/60 border border-border/50 flex items-center justify-center mb-5 ${f.iconColor} group-hover:scale-110 transition-transform`}>
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================================================================

const EXAMPLES = [
  { title: "NBA — Jogos do Dia", team1: "LAKERS", team2: "CELTICS", meta: "Hoje 21h30 • Crypto.com Arena", tag: "NBA", grad: "from-orange-700 to-purple-900", accent: "#fb923c" },
  { title: "UFC Fight Night", team1: "POATAN", team2: "ALEX", meta: "Sábado 23h • T-Mobile Arena", tag: "UFC 305", grad: "from-red-950 to-black", accent: "#ef4444" },
  { title: "Brasileirão", team1: "FLAMENGO", team2: "PALMEIRAS", meta: "Sáb 21h30 • Maracanã", tag: "SÉRIE A • RODADA 15", grad: "from-emerald-900 to-slate-950", accent: "#facc15" },
  { title: "Filme em Cartaz", team1: "DUNA", team2: "PARTE III", meta: "Estreia 20 de dezembro", tag: "FICÇÃO CIENTÍFICA", grad: "from-amber-950 to-black", accent: "#f59e0b" },
  { title: "Série Original", team1: "STRANGER", team2: "THINGS", meta: "Temporada 5 • Episódio 1", tag: "SÉRIE", grad: "from-slate-950 to-red-950", accent: "#ef4444" },
  { title: "Quarta-feira", team1: "REAL", team2: "CITY", meta: "Qua 17h • Champions", tag: "CHAMPIONS", grad: "from-blue-950 to-slate-900", accent: "#38bdf8" },
];

function BannerCard({ ex }: { ex: typeof EXAMPLES[number] }) {
  return (
    <div className={`relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br ${ex.grad} border border-border/60 shadow-xl`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
      <div className="relative h-full p-5 flex flex-col justify-between text-white">
        <div className="text-[10px] font-bold tracking-[0.2em] text-center uppercase" style={{ color: ex.accent }}>
          {ex.tag}
        </div>
        <div className="flex items-center justify-center gap-3 -my-2">
          <div className="text-3xl md:text-4xl font-black leading-none text-right flex-1" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            {ex.team1}
          </div>
          <div className="text-4xl md:text-5xl font-black" style={{ color: ex.accent, fontFamily: "'Bebas Neue', sans-serif" }}>×</div>
          <div className="text-3xl md:text-4xl font-black leading-none text-left flex-1" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            {ex.team2}
          </div>
        </div>
        <div className="text-center">
          <div className="text-[11px] font-semibold opacity-90 tracking-wide">{ex.meta}</div>
        </div>
      </div>
      <div className="absolute bottom-2 right-2 text-[8px] font-bold text-white/60 tracking-wider">SEU LOGO</div>
    </div>
  );
}

function Gallery() {
  return (
    <section id="galeria" className="py-24 md:py-32 px-4 bg-gradient-to-b from-transparent via-card/20 to-transparent">
      <div className="max-w-6xl mx-auto">
        <SectionHeader kicker="Galeria de Exemplos" title="Veja a Qualidade"
          desc="Cada banner é criado automaticamente com qualidade profissional" />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
          {EXAMPLES.map((ex, i) => (
            <motion.div
              key={ex.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <BannerCard ex={ex} />
              <div className="mt-2 text-sm text-center text-muted-foreground">{ex.title}</div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="w-4 h-4 text-accent" />
          <span>Todos criados automaticamente pelo Banner Pro — com seu logotipo e telefone.</span>
        </div>
      </div>
    </section>
  );
}

// ==================================================================

const PLAN_INCLUDES = [
  "Banners ilimitados de jogos do dia",
  "Banners de UFC, NBA e esportes",
  "Banners de filmes e séries",
  "Vídeos com trailers automáticos",
  "Propagandas personalizadas",
  "Seu logotipo em todos os banners",
  "Seu telefone automaticamente",
  "Atualizações inclusas",
  "Suporte prioritário",
];

function Pricing() {
  return (
    <section id="precos" className="py-24 md:py-32 px-4 relative">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] glow-blob opacity-50" />
      </div>
      <div className="max-w-3xl mx-auto">
        <SectionHeader kicker="Plano Único" title="Acesso mensal"
          desc="Gere suas propagandas de forma automática sem complicações" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl bg-card/70 backdrop-blur-xl border-2 border-accent/60 p-8 md:p-10 shadow-gold"
        >
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gold-gradient text-accent-foreground text-xs font-black uppercase tracking-wider shadow-lg">
            Mais Popular
          </div>

          <div className="text-center mb-8">
            <h3 className="text-3xl font-black">Banner Pro</h3>
            <p className="text-muted-foreground mt-2">Acesso completo a todas as ferramentas</p>
            <div className="mt-6 flex items-baseline justify-center gap-2">
              <span className="text-6xl md:text-7xl font-black bg-gold-gradient bg-clip-text text-transparent">R$35</span>
              <span className="text-xl text-muted-foreground">,00/mês</span>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">Pagamento mensal • Cancele quando quiser</div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <Link to="/editor" className="flex-1 py-4 rounded-full bg-gold-gradient text-accent-foreground font-bold text-center shadow-gold hover:brightness-110 transition">
              Quero meu gerador
            </Link>
            <Link to="/editor" className="flex-1 py-4 rounded-full border-2 border-border font-bold text-center hover:bg-white/5 transition">
              Teste Grátis
            </Link>
          </div>

          <div className="border-t border-border/60 pt-6">
            <div className="text-xs uppercase font-bold text-muted-foreground tracking-wider mb-4">Tudo que está incluído:</div>
            <ul className="space-y-2.5">
              {PLAN_INCLUDES.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm">
                  <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-border/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs text-muted-foreground">
            {[
              { icon: Shield, l: "Sem fidelidade" },
              { icon: Zap, l: "Pagamento seguro" },
              { icon: Clock, l: "Acesso imediato" },
              { icon: Users, l: "Suporte incluído" },
            ].map((x) => (
              <div key={x.l} className="flex flex-col items-center gap-1">
                <x.icon className="w-4 h-4 text-primary" /> {x.l}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ==================================================================

const RESELLER_TIERS = [
  { credits: 10, price: 13, popular: false },
  { credits: 25, price: 11, popular: true },
  { credits: 50, price: 10, popular: false },
  { credits: 100, price: 8.5, popular: false },
  { credits: 200, price: 7, popular: false },
];

function Reseller() {
  return (
    <section id="revenda" className="py-24 md:py-32 px-4 bg-gradient-to-b from-transparent via-card/30 to-transparent">
      <div className="max-w-6xl mx-auto">
        <SectionHeader kicker="Programa de Revenda" title="Seja um Revendedor"
          desc="Transforme o Banner Pro em uma fonte de renda extra" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            { icon: TrendingUp, t: "Comissões Atrativas", d: "Ganhe vendendo para seus clientes" },
            { icon: Users, t: "Crescimento Escalável", d: "Monte sua rede de afiliados" },
            { icon: Award, t: "Suporte Completo", d: "Material de vendas e treinamento" },
            { icon: Star, t: "Seja Referência", d: "Destaque-se no mercado digital" },
          ].map((x) => (
            <div key={x.t} className="p-5 rounded-2xl bg-card/60 border border-border/60 text-center backdrop-blur-sm">
              <x.icon className="w-8 h-8 mx-auto text-primary mb-3" />
              <div className="font-bold mb-1">{x.t}</div>
              <div className="text-xs text-muted-foreground">{x.d}</div>
            </div>
          ))}
        </div>

        <div className="rounded-3xl bg-card/70 backdrop-blur-xl border border-border/60 p-6 md:p-10">
          <h3 className="text-2xl md:text-3xl font-black text-center mb-2">Comece a Revender Hoje</h3>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-8">
            Além de ter acesso ao Banner Pro, você pode revender e ganhar comissões em cada venda.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {RESELLER_TIERS.map((t) => (
              <div
                key={t.credits}
                className={`relative p-5 rounded-2xl border text-center transition ${
                  t.popular
                    ? "border-accent/80 bg-accent/10 shadow-gold"
                    : "border-border/60 bg-background/40 hover:border-primary/50"
                }`}
              >
                {t.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase bg-gold-gradient text-accent-foreground px-2 py-0.5 rounded-full">
                    Popular
                  </div>
                )}
                <div className="text-4xl font-black">{t.credits}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Créditos</div>
                <div className="mt-3 text-lg font-bold">R$ {t.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
                <div className="text-[10px] text-muted-foreground">por crédito</div>
                <div className="mt-2 text-xs font-semibold">Total: R$ {(t.price * t.credits).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
                <button className="mt-4 w-full py-2 rounded-full border border-border/60 text-xs font-bold hover:bg-white/5 transition">
                  Adquirir
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <InfoCard title="🔸 Painel Master" text="Mínimo: 10 créditos. Cria clientes." />
            <InfoCard title="🔹 Painel Ultra Master" text="Mínimo: 25 créditos. Cria Master e clientes." />
            <InfoCard title="Créditos não expiram" text="Ficam disponíveis indefinidamente." />
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-background/40 border border-border/60">
            <div className="text-sm">
              <span className="text-muted-foreground">Custo mensal do painel: </span>
              <span className="font-bold">R$ 30,00/mês</span>
            </div>
            <button className="px-6 py-3 rounded-full bg-gold-gradient text-accent-foreground font-bold shadow-gold hover:brightness-110 transition">
              Quero Ser Revendedor
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="p-4 rounded-xl bg-background/40 border border-border/60">
      <div className="font-bold mb-1">{title}</div>
      <div className="text-xs text-muted-foreground">{text}</div>
    </div>
  );
}

// ==================================================================

const FAQS = [
  { q: "Como funciona o Banner Pro?", a: "Você acessa o painel, escolhe o tipo de conteúdo (jogo, luta, filme, série ou vídeo) e a IA gera o banner automaticamente com seu logotipo e telefone. Basta baixar e postar." },
  { q: "Como funciona o pagamento?", a: "Cobrança mensal recorrente de R$ 35,00 via cartão ou Pix. Sem fidelidade — cancele quando quiser diretamente pelo painel." },
  { q: "Posso personalizar com minha marca?", a: "Sim. Faça upload do seu logo e cadastre seu telefone. Todos os banners gerados sairão com sua identidade visual aplicada automaticamente." },
  { q: "Quantos banners posso criar?", a: "Ilimitados. Não há restrição no plano mensal — gere quantos precisar todos os dias." },
  { q: "Como funciona o programa de revenda?", a: "Você adquire créditos (a partir de R$ 7/crédito) e revende contas Banner Pro para seus clientes, com margem em cada venda." },
  { q: "Que tipos de banners posso criar?", a: "Partidas de futebol e basquete, cards de UFC e MMA, filmes, séries, thumbs de vídeo e propagandas personalizadas." },
  { q: "Preciso de conhecimento técnico?", a: "Não. A ferramenta foi pensada pra quem quer velocidade — em poucos cliques o banner está pronto." },
  { q: "Há suporte disponível?", a: "Sim. Suporte prioritário via WhatsApp e email, incluído no plano." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="py-24 md:py-32 px-4">
      <div className="max-w-3xl mx-auto">
        <SectionHeader kicker="Dúvidas Frequentes" title="Perguntas e Respostas"
          desc="Tire suas dúvidas sobre o Banner Pro" />

        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <div key={f.q} className="rounded-2xl bg-card/60 backdrop-blur-sm border border-border/60 overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left font-bold hover:bg-white/5 transition"
              >
                <span>{f.q}</span>
                <ChevronDown className={`w-5 h-5 shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && (
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================================================================

function FinalCTA() {
  return (
    <section className="py-24 md:py-32 px-4">
      <div className="max-w-4xl mx-auto text-center relative rounded-3xl bg-gradient-to-br from-primary/20 via-accent/10 to-transparent border border-border/60 p-10 md:p-16 overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-40">
          <div className="absolute top-0 left-1/4 w-64 h-64 glow-blob" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 glow-blob" />
        </div>
        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-accent/20 border border-accent/40 text-xs font-semibold text-accent">
          <Sparkles className="w-3 h-3" /> Oferta Especial
        </div>
        <h2 className="text-4xl md:text-6xl font-black leading-tight">
          Pronto para Transformar
          <br />
          <span className="bg-rainbow-text">Seu Conteúdo?</span>
        </h2>
        <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
          Junte-se a centenas de profissionais que já automatizaram a criação de banners e aumentaram suas vendas.
        </p>
        <Link
          to="/editor"
          className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gold-gradient text-accent-foreground font-bold shadow-gold hover:brightness-110 transition text-base"
        >
          Quero meu gerador <ArrowRight className="w-5 h-5" />
        </Link>
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-green-400" /> Acesso imediato</div>
          <div className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-green-400" /> Sem fidelidade</div>
        </div>
      </div>
    </section>
  );
}

// ==================================================================

function Footer() {
  return (
    <footer className="border-t border-border/60 py-10 px-4 text-center text-sm text-muted-foreground">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Banner Pro" width={80} height={60} className="h-8 w-auto" loading="lazy" />
          <span className="font-bold text-foreground">Banner Pro</span>
        </div>
        <div>© {new Date().getFullYear()} Banner Pro. Todos os direitos reservados.</div>
        <div className="flex gap-4">
          <a href="#recursos" className="hover:text-foreground transition">Recursos</a>
          <a href="#precos" className="hover:text-foreground transition">Preços</a>
          <Link to="/editor" className="hover:text-foreground transition">Painel</Link>
        </div>
      </div>
    </footer>
  );
}

// ==================================================================

function SectionHeader({ kicker, title, desc }: { kicker: string; title: string; desc: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-16"
    >
      <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-5 rounded-full bg-primary/10 border border-primary/30 text-xs font-semibold text-primary">
        <Palette className="w-3 h-3" /> {kicker}
      </div>
      <h2 className="text-4xl md:text-6xl font-black tracking-tight">{title}</h2>
      <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">{desc}</p>
    </motion.div>
  );
}
