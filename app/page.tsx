import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { copy } from "@/content/copy";

export default function Home() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(60%_60%_at_50%_0%,hsl(var(--brand)/0.18),transparent_70%)]"
      />
      <div className="mx-auto max-w-5xl px-6">
        <header className="flex items-center justify-between py-6">
          <span className="text-base font-semibold tracking-tight">Sistema de Reservas</span>
          <nav className="flex items-center gap-1">
            <Link href="/login"><Button variant="ghost" size="sm">Entrar</Button></Link>
            <Link href="/register"><Button size="sm">Começar agora</Button></Link>
          </nav>
        </header>
        <section className="pt-16 pb-20 text-center sm:pt-24 sm:pb-28">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-fg-muted backdrop-blur-sm">
            <Sparkles className="h-3 w-3 text-brand" />
            Sistema de Reservas
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            {copy.marketing.headline || "Sistema de Reservas"}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-fg-muted">
            {copy.marketing.subheadline}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/register"><Button size="lg" className="gap-2">Começar agora<ArrowRight className="h-4 w-4" /></Button></Link>
            <Link href="/login"><Button variant="secondary" size="lg">Já tenho conta</Button></Link>
          </div>
        </section>
        {copy.marketing.bullets.length > 0 && (
          <section className="grid gap-4 pb-24 sm:grid-cols-3">
            {copy.marketing.bullets.slice(0, 3).map((b, i) => (
              <div key={i} className="rounded-lg border border-border bg-surface/70 p-6 backdrop-blur-sm">
                <CheckCircle2 className="h-5 w-5 text-brand" />
                <p className="mt-3 text-sm leading-relaxed text-fg">{b}</p>
              </div>
            ))}
          </section>
        )}
        <footer className="border-t border-border py-8 text-sm text-fg-muted">Sistema de Reservas.</footer>
      </div>
    </div>
  );
}
