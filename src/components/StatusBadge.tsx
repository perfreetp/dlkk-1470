
import { ApplicationStatus, STATUS_MAP, STATUS_COLOR_MAP } from '@/types';
import { CheckCircle, Clock, AlertCircle, FileText, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: ApplicationStatus;
  size?: 'sm' | 'md';
}

const iconMap: Record<ApplicationStatus, typeof CheckCircle> = {
  draft: FileText,
  submitted: Clock,
  reviewing: Clock,
  approved: CheckCircle,
  returned: XCircle,
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const Icon = iconMap[status];
  const colorClass = STATUS_COLOR_MAP[status];
  const label = STATUS_MAP[status];
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs gap-1' : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span className={`inline-flex items-center ${sizeClass} rounded-full font-medium ${colorClass}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {label}
    </span>
  );
}
