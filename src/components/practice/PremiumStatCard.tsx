import type { LucideIcon } from "lucide-react";

export function PremiumStatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  /** hex accent color for this stat's icon chip */
  color: string;
}) {
  return (
    <div className="pp-glass pp-stat-card">
      <div className="pp-stat-icon" style={{ backgroundColor: `${color}22`, color }}>
        <Icon size={18} strokeWidth={2.4} />
      </div>
      <div className="min-w-0">
        <div className="pp-stat-value truncate">{value}</div>
        <div className="pp-stat-label truncate">{label}</div>
      </div>
    </div>
  );
}
