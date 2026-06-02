import type { Metadata } from "next";
import Link from "next/link";
import { REGISTRARS } from "@/lib/data";
import { DocShell, PageHead } from "@/components/DocShell";
import { StatusBadge } from "@/components/Atoms";

export const metadata: Metadata = {
  title: "Registrars",
  description: "Registrar data records assembled across datasets. Neutral entity pages, no rankings.",
  alternates: { canonical: "/registrars" },
};

export default function RegistrarsIndexPage() {
  const side = [
    {
      h: "Registrars",
      links: [{ label: "All registrars", href: "/registrars", active: true }],
    },
    {
      h: "Examples",
      links: REGISTRARS.map((r) => ({ label: r.id, href: `/registrars/${r.id}`, mono: true })),
    },
  ];
  return (
    <DocShell groups={side}>
      <PageHead
        crumb={[{ label: "registrars" }]}
        title="Registrars"
        desc="Entity records assembled across datasets. Open Domain Data describes these registrars; it does not rate or recommend them."
      />
      <div className="od-table--bordered">
        <table className="od-table">
          <thead>
            <tr>
              <th>ID</th>
              <th className="num" style={{ textAlign: "right" }}>
                IANA ID
              </th>
              <th>Name</th>
              <th>Country</th>
              <th>Status</th>
              <th>Verification</th>
              <th>Last checked</th>
            </tr>
          </thead>
          <tbody>
            {REGISTRARS.map((r) => (
              <tr key={r.id}>
                <td>
                  <Link href={`/registrars/${r.id}`} className="od-table__name">
                    {r.id}
                  </Link>
                </td>
                <td className="num">{r.iana_id}</td>
                <td style={{ color: "var(--od-ink-2)" }}>{r.name}</td>
                <td className="mono" style={{ fontSize: 12 }}>
                  {r.country}
                </td>
                <td>
                  <StatusBadge v={r.status} />
                </td>
                <td>
                  <StatusBadge v={r.verification_status} />
                </td>
                <td className="mono" style={{ fontSize: 12, color: "var(--od-ink-3)" }}>
                  {r.last_checked.slice(0, 10)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="od-micro" style={{ marginTop: 14 }}>
        Sample dataset. The full <Link href="/datasets/registrars" className="od-link">registrars dataset</Link> contains
        2,841 records.
      </p>
    </DocShell>
  );
}
