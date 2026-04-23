import { HU } from '@/config/ui-text';
import type { RiskLevel } from '@/lib/types';

const RISK_LABEL: Record<RiskLevel, string> = {
  low: HU.risk_low,
  medium: HU.risk_medium,
  high: HU.risk_high,
  critical: HU.risk_critical,
};

const RISK_STYLE: Record<RiskLevel, string> = {
  low: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  medium: 'bg-amber-100 text-amber-900 ring-amber-200',
  high: 'bg-orange-100 text-orange-900 ring-orange-300',
  critical: 'bg-red-100 text-red-900 ring-red-300',
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ring-1 ${RISK_STYLE[level]}`}
    >
      <span className="h-2 w-2 rounded-full bg-current opacity-70" />
      {RISK_LABEL[level]}
    </span>
  );
}
