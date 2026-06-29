import { cn } from '@/lib/utils';

export function Badge({
  className,
  variant = 'default',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'outline';
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        variant === 'default' && 'border-transparent bg-primary text-primary-foreground',
        variant === 'secondary' && 'border-transparent bg-secondary text-secondary-foreground',
        variant === 'success' && 'border-transparent bg-success/20 text-success',
        variant === 'warning' && 'border-transparent bg-warning/20 text-warning',
        variant === 'outline' && 'border-border bg-transparent',
        className
      )}
      {...props}
    />
  );
}
