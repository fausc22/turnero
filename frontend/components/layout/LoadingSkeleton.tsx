import { Skeleton } from '@/components/ui/skeleton';

export function LandingSkeleton() {
  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-12">
      <Skeleton className="mx-auto h-48 w-full rounded-xl" />
      <Skeleton className="mx-auto h-8 w-48" />
      <Skeleton className="mx-auto h-4 w-64" />
      <Skeleton className="mx-auto h-11 w-40" />
    </div>
  );
}

export function WizardSkeleton() {
  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 py-8">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
