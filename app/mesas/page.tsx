import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard de Mesas | Sistema de Reservas",
  description:
    "Visualize a ocupação de mesas em tempo real e faça novas reservas no seu restaurante.",
  openGraph: {
    title: "Dashboard de Mesas | Sistema de Reservas",
    description:
      "Visualize a ocupação de mesas em tempo real e faça novas reservas no seu restaurante.",
    type: "website",
  },
};

type SearchParams = Promise<{ date?: string }> | { date?: string };

export default async function MesasPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const sp = await searchParams;
  const dateStr = sp.date || new Date().toISOString().slice(0, 10);
  const dayStart = new Date(dateStr + "T00:00:00");
  const dayEnd = new Date(dateStr + "T23:59:59.999");
  const now = new Date();

  const tables = await prisma.table.findMany({
    include: {
      restaurant: true,
      reservations: {
        where: {
          startDate: { gte: dayStart, lte: dayEnd },
          status: { in: ["pending", "confirmed"] },
        },
        include: { user: { select: { name: true, email: true } } },
        orderBy: { startDate: "asc" },
      },
    },
    orderBy: { number: "asc" },
  });

  const total = tables.length;
  const ocupadas = tables.filter((t) =>
    t.reservations.some(
      (r) => new Date(r.startDate) <= now && new Date(r.endDate) >= now
    )
  ).length;
  const reservadas = tables.filter((t) => {
    const hasCurrent = t.reservations.some(
      (r) => new Date(r.startDate) <= now && new Date(r.endDate) >= now
    );
    const hasFuture = t.reservations.some((r) => new Date(r.startDate) > now);
    return !hasCurrent && hasFuture;
  }).length;
  const disponiveis = total - ocupadas - reservadas;

  return (
    <main className="min-h-screen bg-bg px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-brand">
              Dashboard
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold text-fg sm:text-4xl">
              Mesas do Restaurante
            </h1>
            <p className="mt-2 text-fg-muted">
              Visualize a ocupação em tempo real e gerencie reservas.
            </p>
          </div>
          <Link href="/reservas/nova">
            <Button variant="primary" size="lg">
              Nova reserva
            </Button>
          </Link>
        </header>

        <form
          method="GET"
          className="mb-6 flex flex-wrap items-end gap-3 rounded-lg border border-border bg-surface p-4"
        >
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-fg-muted"
            >
              Data
            </label>
            <input
              id="date"
              name="date"
              type="date"
              defaultValue={dateStr}
              className="mt-1 rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg focus:border-brand focus:outline-none"
            />
          </div>
          <Button type="submit" variant="secondary" size="md">
            Filtrar
          </Button>
        </form>

        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardBody>
              <p className="text-xs uppercase tracking-wider text-fg-muted">
                Total
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-fg">
                {total}
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-xs uppercase tracking-wider text-fg-muted">
                Disponíveis
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-brand">
                {disponiveis}
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-xs uppercase tracking-wider text-fg-muted">
                Reservadas
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-accent">
                {reservadas}
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-xs uppercase tracking-wider text-fg-muted">
                Ocupadas
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-fg">
                {ocupadas}
              </p>
            </CardBody>
          </Card>
        </div>

        {tables.length === 0 ? (
          <Card>
            <CardBody>
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <p className="font-display text-lg font-semibold text-fg">
                  Nenhuma mesa cadastrada ainda
                </p>
                <p className="max-w-md text-sm text-fg-muted">
                  Cadastre mesas no painel administrativo para começar a
                  receber reservas dos seus clientes.
                </p>
                <Link href="/admin/ocupacao">
                  <Button variant="primary">Ir para o painel admin</Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tables.map((t) => {
              const current = t.reservations.find(
                (r) =>
                  new Date(r.startDate) <= now && new Date(r.endDate) >= now
              );
              const upcoming = t.reservations.find(
                (r) => new Date(r.startDate) > now
              );
              const status = current
                ? "ocupada"
                : upcoming
                ? "reservada"
                : "disponivel";
              const badge =
                status === "ocupada"
                  ? "bg-accent/10 text-accent"
                  : status === "reservada"
                  ? "bg-brand/10 text-brand"
                  : "bg-surface border border-border text-fg-muted";
              const label =
                status === "ocupada"
                  ? "Ocupada"
                  : status === "reservada"
                  ? "Reservada"
                  : "Disponível";
              const active = current || upcoming;
              return (
                <Card key={t.id}>
                  <CardBody>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-fg-muted">
                          Mesa
                        </p>
                        <p className="font-display text-2xl font-bold text-fg">
                          #{t.number}
                        </p>
                        <p className="text-sm text-fg-muted">
                          {t.restaurant.name}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge}`}
                      >
                        {label}
                      </span>
                    </div>
                    {active ? (
                      <div className="mt-4 rounded-md border border-border bg-bg/50 p-3 text-sm">
                        <p className="font-medium text-fg">
                          {active.user.name || active.user.email}
                        </p>
                        <p className="text-fg-muted">
                          {new Date(active.startDate).toLocaleTimeString(
                            "pt-BR",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                          {" – "}
                          {new Date(active.endDate).toLocaleTimeString(
                            "pt-BR",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <Link href={`/reservas/nova?tableId=${t.id}`}>
                          <Button variant="secondary" size="sm">
                            Reservar esta mesa
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
