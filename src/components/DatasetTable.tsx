import Link from "next/link";
import type { Dataset } from "@/lib/data";
import { Chips, StatusBadge } from "./Atoms";

export function DatasetTable({ datasets, showUpdated = true }: { datasets: Dataset[]; showUpdated?: boolean }) {
  return (
    <div className="od-table--bordered">
      <table className="od-table">
        <thead>
          <tr>
            <th>Dataset</th>
            <th>Description</th>
            <th style={{ textAlign: "right" }}>Records</th>
            <th>Formats</th>
            <th>Version</th>
            <th>Status</th>
            {showUpdated && <th>Last updated</th>}
          </tr>
        </thead>
        <tbody>
          {datasets.map((d) => (
            <tr key={d.name}>
              <td>
                <Link href={`/datasets/${d.slug}`} className="od-table__name">
                  {d.name}
                </Link>
              </td>
              <td style={{ maxWidth: 320, color: "var(--od-ink-2)" }}>{d.desc}</td>
              <td className="num">{d.records}</td>
              <td>
                <Chips items={d.fmts} />
              </td>
              <td className="mono" style={{ fontSize: 12.5, color: "var(--od-ink-2)" }}>
                {d.ver}
              </td>
              <td>
                <StatusBadge v={d.status} />
              </td>
              {showUpdated && (
                <td className="mono" style={{ fontSize: 12, color: "var(--od-ink-3)" }}>
                  {d.updated}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
