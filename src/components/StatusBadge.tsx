import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  paid: { label: "Payée", className: "bg-success/10 text-success" },
  sent: { label: "Envoyée", className: "bg-info/10 text-info" },
  draft: { label: "Brouillon", className: "bg-muted text-muted-foreground" },
  partial: { label: "Partielle", className: "bg-warning/10 text-warning" },
  overdue: { label: "En retard", className: "bg-destructive/10 text-destructive" },
  cancelled: { label: "Annulée", className: "bg-muted text-muted-foreground" },
};

interface StatusBadgeProps {
  status: string;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = statusConfig[status] ?? { label: status, className: "bg-muted text-muted-foreground" };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", config.className)}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
