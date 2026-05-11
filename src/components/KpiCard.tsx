import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  variant?: "default" | "success" | "warning" | "destructive";
}

const variantStyles = {
  default: "bg-primary/8 text-primary border-primary/10",
  success: "bg-success/8 text-success border-success/10",
  warning: "bg-warning/8 text-warning border-warning/10",
  destructive: "bg-destructive/8 text-destructive border-destructive/10",
};

const KpiCard = ({ title, value, subtitle, trend, icon: Icon, variant = "default" }: KpiCardProps) => (
  <div className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-all duration-200">
    <div className="flex items-start justify-between">
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-heading font-bold text-card-foreground tracking-tight">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        {trend && <p className="text-xs font-medium text-success">{trend}</p>}
      </div>
      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center border", variantStyles[variant])}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  </div>
);

export default KpiCard;
