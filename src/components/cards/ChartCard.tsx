import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export default function ChartCard({
  title,
  subtitle,
  children,
  action,
  className,
}: ChartCardProps) {
  return (
    <div className={clsx('card', className)}>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  );
}
