import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ReactNode } from "react";

type Color = "blue" | "green" | "orange" | "purple" | "red" | "indigo" | "pink";

const colors: Record<Color, { card: string; icon: string }> = {
  blue:   { card: "border-blue-100",   icon: "bg-blue-100 text-blue-600" },
  green:  { card: "border-green-100",  icon: "bg-green-100 text-green-600" },
  orange: { card: "border-orange-100", icon: "bg-orange-100 text-orange-600" },
  purple: { card: "border-purple-100", icon: "bg-purple-100 text-purple-600" },
  red:    { card: "border-red-100",    icon: "bg-red-100 text-red-600" },
  indigo: { card: "border-indigo-100", icon: "bg-indigo-100 text-indigo-600" },
  pink:   { card: "border-pink-100",   icon: "bg-pink-100 text-pink-600" },
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: number;
  trendLabel?: string;
  color?: Color;
  loading?: boolean;
  className?: string;
}

export function StatCard({ title, value, icon, trend, trendLabel, color = "blue", loading = false, className }: StatCardProps) {
  const c = colors[color];
  const isPositive = trend !== undefined && trend > 0;
  const isNeutral  = trend === 0;

  if (loading) return (
    <div className={cn("bg-white rounded-2xl border shadow-sm p-5 animate-pulse", c.card, className)}>
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-3 w-24 bg-gray-200 rounded" />
          <div className="h-7 w-16 bg-gray-200 rounded" />
        </div>
        <div className="w-10 h-10 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );

  return (
    <div className={cn("bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md transition-shadow", c.card, className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend !== undefined && (
            <div className={cn("flex items-center gap-1 mt-1.5 text-xs font-medium",
              isNeutral ? "text-gray-500" : isPositive ? "text-green-600" : "text-red-600"
            )}>
              {isNeutral ? <Minus className="w-3 h-3" /> : isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isNeutral ? "Stable" : `${Math.abs(trend)}% ${trendLabel || "ce mois"}`}
            </div>
          )}
        </div>
        {icon && <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", c.icon)}>{icon}</div>}
      </div>
    </div>
  );
}

// Grille prête à l'emploi
export function StatGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {children}
    </div>
  );
}
