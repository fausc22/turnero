import { GestionarTurnoClient } from '@/components/gestionar/GestionarTurnoClient';

export default async function GestionarTurnoPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <GestionarTurnoClient token={token} />;
}
