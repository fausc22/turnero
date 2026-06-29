'use client';

interface Props {
  nombre: string;
  textoBienvenida: string;
  colorPrimario: string;
  heroPreviewUrl?: string | null;
}

export function TenantPreview({ nombre, textoBienvenida, colorPrimario, heroPreviewUrl }: Props) {
  return (
    <div
      className="overflow-hidden rounded-xl border border-border"
      style={{ ['--preview-accent' as string]: colorPrimario }}
    >
      <div
        className="relative min-h-[160px] bg-gradient-to-br from-[var(--preview-accent)]/30 to-muted"
        style={heroPreviewUrl ? { backgroundImage: `url(${heroPreviewUrl})`, backgroundSize: 'cover' } : undefined}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] to-transparent" />
        <div className="relative z-10 flex min-h-[160px] flex-col justify-end p-4">
          <p className="text-lg font-semibold text-white">{nombre || 'Mi local'}</p>
          {textoBienvenida && (
            <p className="mt-1 text-xs text-white/70 line-clamp-2">{textoBienvenida}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 border-t border-border bg-card p-3">
        <div
          className="h-6 w-6 rounded-full"
          style={{ backgroundColor: colorPrimario }}
        />
        <span className="text-xs text-muted-foreground">Vista previa landing</span>
      </div>
    </div>
  );
}
