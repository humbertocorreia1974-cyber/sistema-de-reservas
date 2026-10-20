'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function CancelReservationClient({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/reservations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Não foi possível cancelar a reserva.');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="ghost" size="sm" onClick={handleCancel} disabled={loading}>
        {loading ? 'Cancelando...' : 'Cancelar'}
      </Button>
      {error && <p className="text-xs text-accent">{error}</p>}
    </div>
  );
}
