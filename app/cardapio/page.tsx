import { prisma } from '@/lib/prisma';
import { Card, CardTitle, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Cardápio | Sistema de Reservas',
  description:
    'Explore nosso cardápio digital com pratos organizados por categoria. Pratos frescos e saborosos para todos os gostos.',
  openGraph: {
    title: 'Cardápio | Sistema de Reservas',
    description:
      'Explore nosso cardápio digital com pratos organizados por categoria.',
    type: 'website',
  },
};

type SearchParams = { categoria?: string; q?: string };

export default async function CardapioPage({
  searchParams,
}: {
  searchParams: SearchParams | Promise<SearchParams>;
}) {
  const params = (await searchParams) as SearchParams;
  const categoriaId = params.categoria;
  const q = params.q?.trim();

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      menuItems: {
        where: q ? { name: { contains: q, mode: 'insensitive' } } : undefined,
        orderBy: { name: 'asc' },
      },
    },
  });

  const filtered = categoriaId
    ? categories.filter((c) => c.id === categoriaId)
    : categories;
  const totalItems = filtered.reduce((acc, c) => acc + c.menuItems.length, 0);

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-brand">
              Cardápio digital
            </p>
            <h1 className="mt-1 font-display text-4xl font-bold text-fg">
              Nosso Cardápio
            </h1>
            <p className="mt-2 max-w-xl text-fg-muted">
              Pratos frescos, organizados por categoria. Escolha o que vai pedir
              e reserve sua mesa em segundos.
            </p>
          </div>
          <Link href="/reservas/nova">
            <Button variant="primary" size="lg">
              Reservar mesa
            </Button>
          </Link>
        </header>

        <form
          method="get"
          className="mb-10 flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-center"
        >
          <input
            type="text"
            name="q"
            defaultValue={q ?? ''}
            placeholder="Buscar prato pelo nome..."
            className="flex-1 rounded-md border border-border bg-bg px-4 py-2 text-fg placeholder:text-fg-muted focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <select
            name="categoria"
            defaultValue={categoriaId ?? ''}
            className="rounded-md border border-border bg-bg px-4 py-2 text-fg focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="">Todas as categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-md bg-brand px-5 py-2 font-medium text-brand-fg transition-all duration-150 hover:bg-brand/90 focus:outline-none focus:ring-2 focus:ring-brand"
          >
            Filtrar
          </button>
        </form>

        {totalItems === 0 ? (
          <Card>
            <CardBody>
              <div className="flex flex-col items-center gap-4 py-16 text-center">
                <p className="text-lg font-medium text-fg">
                  Nenhum prato encontrado
                </p>
                <p className="max-w-md text-fg-muted">
                  Tente ajustar os filtros ou buscar por outro termo. Se o
                  cardápio ainda está vazio, o administrador precisa cadastrar
                  os pratos.
                </p>
                <Link href="/cardapio">
                  <Button variant="secondary">Limpar filtros</Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-12">
            {filtered
              .filter((c) => c.menuItems.length > 0)
              .map((cat) => (
                <section key={cat.id}>
                  <div className="mb-4 flex items-center gap-3">
                    <h2 className="font-display text-2xl font-bold text-fg">
                      {cat.name}
                    </h2>
                    <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand">
                      {cat.menuItems.length}{' '}
                      {cat.menuItems.length === 1 ? 'item' : 'itens'}
                    </span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {cat.menuItems.map((item) => (
                      <Card key={item.id}>
                        <CardBody>
                          <div className="flex items-start justify-between gap-3">
                            <CardTitle className="text-lg">
                              {item.name}
                            </CardTitle>
                            <span className="whitespace-nowrap rounded-full bg-accent/10 px-3 py-1 text-sm font-semibold text-accent">
                              R$ {Number(item.price).toFixed(2)}
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                            {item.description}
                          </p>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                </section>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
