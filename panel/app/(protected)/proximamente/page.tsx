import { Construction } from 'lucide-react';

export default function ProximamentePage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Construction className="mb-4 h-12 w-12 text-muted-foreground" />
      <h1 className="text-2xl font-semibold">Próximamente</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        Esta sección estará disponible en una fase posterior del proyecto.
      </p>
    </div>
  );
}
