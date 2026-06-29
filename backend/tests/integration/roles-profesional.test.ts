import { hashPassword } from '../../src/utils/password';
import * as usuarioRepo from '../../src/repositories/tenant/usuarioRepository';
import { listTurnos, getTurnoDetalle } from '../../src/services/turnoPanelService';
import { withDemoTenant } from '../helpers/tenantContext';
import { AppError } from '../../src/utils/errors';

const skipDb = process.env.CI_SKIP_DB === 'true';

async function ensureProfesionalUser(): Promise<{ userId: number; profesionalId: number }> {
  const email = 'juan.profesional@test.local';
  let usuario = await usuarioRepo.findUsuarioByEmail(email);
  if (!usuario) {
    const hash = await hashPassword('Password123!');
    const userId = await usuarioRepo.createUsuario({
      nombre: 'Juan Profesional',
      email,
      passwordHash: hash,
      rol: 'PROFESIONAL',
      profesionalId: 1,
    });
    usuario = await usuarioRepo.findUsuarioById(userId);
  }
  return { userId: usuario!.id, profesionalId: usuario!.profesional_id ?? 1 };
}

(skipDb ? describe.skip : describe)('roles PROFESIONAL', () => {
  it('listTurnos solo devuelve turnos propios', async () => {
    await withDemoTenant(async () => {
      await ensureProfesionalUser();
      const actor = { rol: 'PROFESIONAL', profesionalId: 1 };
      const turnos = await listTurnos(
        { from: '2026-01-01T00:00:00.000Z', to: '2026-12-31T23:59:59.999Z' },
        actor
      );
      expect(turnos.every((t) => t.profesionalId === 1)).toBe(true);
    });
  });

  it('getTurnoDetalle ajeno devuelve 403', async () => {
    await withDemoTenant(async () => {
      const gerenteTurnos = await listTurnos(
        { from: '2026-01-01T00:00:00.000Z', to: '2026-12-31T23:59:59.999Z' },
        { rol: 'GERENTE', profesionalId: null }
      );
      const ajeno = gerenteTurnos.find((t) => t.profesionalId != null && t.profesionalId !== 1);
      if (!ajeno) return;

      await expect(
        getTurnoDetalle(ajeno.id, { rol: 'PROFESIONAL', profesionalId: 1 })
      ).rejects.toBeInstanceOf(AppError);
    });
  });
});
