import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: { value: string; positive: boolean };
  className?: string;
}

export default function KPICard({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
}: KPICardProps) {
  return (
    <div className={clsx('card flex items-start gap-4', className)}>
      {icon && (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        {(subtitle || trend) && (
          <div className="mt-1 flex items-center gap-2">
            {trend && (
              <span
                className={clsx(
                  'badge',
                  trend.positive ? 'badge-success' : 'badge-warning'
                )}
              >
                {trend.positive ? '↑' : '↓'} {trend.value}
              </span>
            )}
            {subtitle && (
              <span className="text-xs text-gray-400">{subtitle}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
