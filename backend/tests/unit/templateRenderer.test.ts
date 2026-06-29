import { renderTemplate } from '../../src/utils/templateRenderer';

describe('templateRenderer', () => {
  it('reemplaza placeholders {{key}}', () => {
    const out = renderTemplate('Hola {{clienteNombre}}, turno {{fecha}} {{hora}}', {
      clienteNombre: 'Ana',
      fecha: '20/05/2026',
      hora: '10:00',
    });
    expect(out).toBe('Hola Ana, turno 20/05/2026 10:00');
  });

  it('omite placeholders sin valor', () => {
    const out = renderTemplate('{{clienteNombre}} {{direccion}}', {
      clienteNombre: 'Ana',
      direccion: null,
    });
    expect(out).toBe('Ana ');
  });
});
