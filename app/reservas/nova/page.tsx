import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { CalendarPlus, UtensilsCrossed } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardBody, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ReservationFormClient from './reservation-form-client';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Nova reserva | Sistema de Reservas',
  description:
    'Escolha mesa, data, horário e duração e confirme sua reserva no restaurante em poucos cliques.',
  openGraph: {
    title: 'Nova reserva | Sistema de Reservas',
    description: 'Reserve sua mesa em segundos com confirmação imediata.',
    type: 'website',
  },
};

export default async
