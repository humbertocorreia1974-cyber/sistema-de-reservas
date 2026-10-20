import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { CalendarDays, Clock, LayoutGrid, ArrowRight, Users } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardTitle, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CancelReservationClient from './cancel-reservation-client';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Dashboard de mesas | Sistema de Reservas',
  description:
    'Acompanhe em tempo real a ocupação das mesas do restaurante, filtre por data e horário e reserve o seu lugar em segundos.',
  openGraph: {
    title: 'Dashboard de mesas | Sistema de Reservas',
    description:
      'Ocupação de mesas em tempo real, reservas de horários e gestão completa do seu restaurante.',
    type: 'website',
  },
};

const HORAS = ['11:00', '12:00', '13:00', '14:00', '18:00', '19:00', '20:00', '21:00', '22:00'];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function resolveSlot(dateStr?: string, horaStr?: string) {
  const now = new Date();
  const date = dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
    ? dateStr
    : `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const hora = horaStr && /^\d{2}:\d{2}$/.test(horaStr) ? horaStr : `${pad(now.getHours())}:00`;
  const start = new Date(`${date}T${hora}:00`);
  const end = new Date(start.getTime() + 90 * 60 * 1000);
  return { date, hora, start, end };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { date?: string; hora?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const { date, hora, start, end } = resolveSlot(searchParams.date, searchParams.hora);

  const restaurant = await prisma.restaurant.findFirst({ orderBy: { createdAt: 'asc' } });

  const tables = restaurant
    ? await prisma.table.findMany({
        where: { restaurantId: restaurant.id },
        orderBy: { number: 'asc' },
        include: {
          reservations: {
            where: {
              status: { in: ['pending', 'confirmed'] },
              startDate: { lt: end },
              endDate: { gt: start },
            },
            include: { user: { select: { name: true } } },
          },
        },
      })
    : [];

  const myReservations = await prisma.reservation.findMany({
    where: {
      userId: session.user.id,
      status: { in: ['pending', 'confirmed'] },
      endDate: { gte: new Date() },
    },
    orderBy: { startDate: 'asc' },
    take: 5,
    include: { table: { include: { restaurant: { select: { name: true } } } } },
  });

  const total = tables.length;
  const occupied = tables.filter((t) => t.reservations.length > 0).length;
  const free = total - occupied;
  const rate = total > 0 ? Math.round((occupied / total) * 100) : 0;

  return (
    <main className="min-h-screen bg-bg px-6 py-12">
      <div className="mx-auto max-w-6xl space-y-12">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand">
              <LayoutGrid className="h-3.5 w-3.5" /> Ocupação em tempo real
            </span>
            <h1 className="font-display text-4xl font-bold tracking-tight text-fg md:text-5xl">
              Dashboard de mesas
            </h1>
            <p className="max-w-xl text-fg-muted">
              {restaurant ? restaurant.name : 'Seu restaurante'} · veja quais mesas estão livres no
              horário escolhido e garanta a sua reserva.
            </p>
          </div>
          <Link href="/reservas/nova">
            <Button variant="primary" size="lg">
              Nova reserva <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Mesas', value: total },
            { label: 'Ocupadas', value: occupied },
            { label: 'Livres', value: free },
            { label: 'Taxa de ocupação', value: `${rate}%` },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardBody>
                <p className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
                  {stat.label}
                </p>
                <p className="mt-2 font-display text-3xl font-bold text-brand">{stat.value}</p>
              </CardBody>
            </Card>
          ))}
        </section>

        <Card>
          <CardBody>
            <form action="/dashboard" method="get" className="flex flex-wrap items-end gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="date" className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
                  Data
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  defaultValue={date}
                  className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg transition-colors duration-150 hover:border-brand/60"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="hora" className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
                  Horário
                </label>
                <select
                  id="hora"
                  name="hora"
                  defaultValue={hora}
                  className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg transition-colors duration-150 hover:border-brand/60"
                >
                  {HORAS.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" variant="secondary" size="md">
                <CalendarDays className="mr-2 h-4 w-4" /> Ver ocupação
              </Button>
            </form>
          </CardBody>
        </Card>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-fg">
              Mesas em {date.split('-').reverse().join('/')} às {hora}
            </h2>
            <span className="text-sm text-fg-muted">{free} livre(s)</span>
          </div>

          {tables.length === 0 ? (
            <Card>
              <CardBody className="flex flex-col items-center gap-4 py-16 text-center">
                <Users className="h-10 w-10 text-brand" />
                <CardTitle>Nenhuma mesa cadastrada ainda</CardTitle>
                <p className="max-w-md text-sm text-fg-muted">
                  Cadastre as mesas do restaurante para começar a receber reservas e acompanhar a
                  ocupação em tempo real.
                </p>
                <Link href="/admin/ocupacao">
                  <Button variant="primary" size="md">
                    Ir para o painel admin
                  </Button>
                </Link>
              </CardBody>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tables.map((table) => {
                const busy = table.reservations.length > 0;
                return (
                  <Card key={table.id} className="transition-all duration-200 hover:border-brand/60">
                    <CardBody className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
                            Mesa
                          </p>
                          <p className="font-display text-3xl font-bold text-fg">
                            {String(table.number).padStart(2, '0')}
                          </p>
                        </div>
                        <span
                          className={
                            busy
                              ? 'rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent'
                              : 'rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand'
                          }
                        >
                          {busy ? 'Ocupada' : 'Livre'}
                        </span>
                      </div>
                      <p className="flex items-center gap-2 text-sm text-fg-muted">
                        <Clock className="h-4 w-4" />
                        {busy
                          ? `Reservada por ${table.reservations[0].user?.name ?? 'cliente'}`
                          : `Disponível às ${hora}`}
                      </p>
                      {busy ? (
                        <Button variant="ghost" size="sm" disabled>
                          Indisponível neste horário
                        </Button>
                      ) : (
                        <Link href={`/reservas/nova?tableId=${table.id}&date=${date}&hora=${hora}`}>
                          <Button variant="primary" size="sm">
                            Reservar esta mesa
                          </Button>
                        </Link>
                      )}
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        <section className="space-y-6">
          <h2 className="font-display text-2xl font-bold text-fg">Minhas próximas reservas</h2>
          {myReservations.length === 0 ? (
            <Card>
              <CardBody className="flex flex-col items-center gap-3 py-12 text-center">
                <CalendarDays className="h-8 w-8 text-brand" />
                <p className="text-sm text-fg-muted">
                  Você ainda não tem reservas ativas. Escolha uma mesa livre acima e garanta seu lugar.
                </p>
                <Link href="/reservas/nova">
                  <Button variant="primary" size="sm">
                    Fazer minha primeira reserva
                  </Button>
                </Link>
              </CardBody>
            </Card>
          ) : (
            <div className="space-y-3">
              {myReservations.map((r) => (
                <Card key={r.id}>
                  <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <p className="font-semibold text-fg">
                        Mesa {String(r.table.number).padStart(2, '0')} · {r.table.restaurant.name}
                      </p>
                      <p className="text-sm text-fg-muted">
                        {new Date(r.startDate).toLocaleString('pt-BR')} até{' '}
                        {new Date(r.endDate).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                        {r.status === 'confirmed' ? 'Confirmada' : 'Pendente'}
                      </span>
                      <CancelReservationClient id={r.id} />
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
