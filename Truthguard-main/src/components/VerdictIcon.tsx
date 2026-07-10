import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Clock,
  Drama,
} from 'lucide-react';
import type { VerdictDisplay } from '@/types';

type IconName = VerdictDisplay['iconName'];

const ICON_MAP: Record<IconName, React.ComponentType<{ className?: string }>> = {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Clock,
  Drama,
};

interface VerdictIconProps {
  iconName: IconName;
  className?: string;
}

export default function VerdictIcon({ iconName, className }: VerdictIconProps) {
  const Icon = ICON_MAP[iconName];
  return <Icon className={className} />;
}
