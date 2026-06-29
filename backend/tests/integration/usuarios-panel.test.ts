import * as usuarioPanelService from '../../src/services/usuarioPanelService';
import * as usuarioRepo from '../../src/repositories/tenant/usuarioRepository';
import { withDemoTenant } from '../helpers/tenantContext';

const skipDb = process.env.CI_SKIP_DB === 'true';

(skipDb ? describe.skip : describe)('usuarioPanelService', () => {
  it('createUsuario y listUsuarios', async () => {
    await withDemoTenant(async () => {
      const email = `recep-${Date.now()}@test.local`;
      const created = await usuarioPanelService.createUsuario({
        nombre: 'Recep Test',
        email,
        password: 'Password123!',
        rol: 'RECEPCIONISTA',
      });
      expect(created.email).toBe(email);
      const list = await usuarioPanelService.listUsuarios();
      expect(list.some((u) => u.email === email)).toBe(true);
      await usuarioRepo.updateUsuario(created.id, { activo: 0 });
    });
  });
});
