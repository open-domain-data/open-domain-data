import { STATUS_KIND } from "@/lib/data";
import type { ReactNode } from "react";

export function StatusBadge({ v, label }: { v: string; label?: string }) {
  const kind = STATUS_KIND[v] ?? "muted";
  return <span className={`od-status ${kind}`}>{label ?? v}</span>;
}

export function Chip({ children }: { children: ReactNode }) {
  return <span className="od-chip">{children}</span>;
}

export function Chips({ items }: { items: string[] }) {
  return (
    <span className="od-chips">
      {items.map((f) => (
        <Chip key={f}>{f}</Chip>
      ))}
    </span>
  );
}

export function Pill({ children, mono = false }: { children: ReactNode; mono?: boolean }) {
  return <span className={`od-pill ${mono ? "mono" : ""}`}>{children}</span>;
}

export function MetaBlock({ rows }: { rows: [string, ReactNode, boolean?][] }) {
  return (
    <div className="od-meta">
      {rows.map(([k, v, sans], i) => (
        <div key={i} className="od-meta__row">
          <span className="od-meta__k">{k}</span>
          <span className={"od-meta__v" + (sans ? " sans" : "")}>{v}</span>
        </div>
      ))}
    </div>
  );
}

export function InlineCode({ children }: { children: ReactNode }) {
  return <span className="od-icode">{children}</span>;
}
