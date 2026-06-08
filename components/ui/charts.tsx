"use client";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { cn } from "@/lib/utils";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

interface ChartWrapperProps {
  title?: string;
  className?: string;
  children: React.ReactNode;
}

function ChartWrapper({ title, className, children }: ChartWrapperProps) {
  return (
    <div className={cn("bg-white rounded-2xl border border-gray-100 shadow-sm p-5", className)}>
      {title && <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>}
      {children}
    </div>
  );
}

// ---- LINE CHART ----
interface LineChartProps {
  data: Record<string, any>[];
  lines: { key: string; label: string; color?: string }[];
  xKey: string;
  title?: string;
  height?: number;
  className?: string;
}

export function LineChartCard({ data, lines, xKey, title, height = 260, className }: LineChartProps) {
  return (
    <ChartWrapper title={title} className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {lines.map((l, i) => (
            <Line key={l.key} type="monotone" dataKey={l.key} name={l.label}
              stroke={l.color || COLORS[i % COLORS.length]} strokeWidth={2} dot={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

// ---- BAR CHART ----
interface BarChartProps {
  data: Record<string, any>[];
  bars: { key: string; label: string; color?: string }[];
  xKey: string;
  title?: string;
  height?: number;
  className?: string;
}

export function BarChartCard({ data, bars, xKey, title, height = 260, className }: BarChartProps) {
  return (
    <ChartWrapper title={title} className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {bars.map((b, i) => (
            <Bar key={b.key} dataKey={b.key} name={b.label} radius={[6, 6, 0, 0]}
              fill={b.color || COLORS[i % COLORS.length]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

// ---- PIE CHART ----
interface PieChartProps {
  data: { name: string; value: number; color?: string }[];
  title?: string;
  height?: number;
  className?: string;
}

export function PieChartCard({ data, title, height = 260, className }: PieChartProps) {
  return (
    <ChartWrapper title={title} className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
            paddingAngle={3} dataKey="value">
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
