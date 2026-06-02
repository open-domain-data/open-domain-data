import type { Metadata } from "next";
import { CHANGELOG, DATASETS } from "@/lib/data";
import { DocShell, PageHead } from "@/components/DocShell";
import { StatusBadge } from "@/components/Atoms";
import { IcFile } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Changelog",
  description: "Every dataset and schema change is recorded here, newest first.",
  alternates: { canonical: "/changelog" },
};

function ChangeRow({ c }: { c: { date: string; ds: string; ver: string; body: string } }) {
  return (
    <div className="od-clog">
      <div className="od-clog__meta">
        <span className="od-clog__date">{c.date}</span>
        <span className="od-clog__ds">
          {c.ds}
          <span style={{ color: "var(--od-ink-4)" }}>@{c.ver}</span>
        </span>
        <StatusBadge v="independently_tested" label="release" />
      </div>
      <div className="od-clog__body">{c.body}</div>
    </div>
  );
}

export default function ChangelogPage() {
  const side = [
    {
      h: "Changelog",
      links: [
        { label: "All changes", href: "/changelog", active: true },
        { label: "2026-06", href: "#2026-06" },
        { label: "2026-05", href: "#2026-05" },
      ],
    },
    {
      h: "By dataset",
      links: DATASETS.map((d) => ({ label: d.name, href: `/datasets/${d.slug}#changelog`, mono: true })),
    },
  ];

  const june = CHANGELOG.filter((c) => c.date.startsWith("2026-06"));
  const may = CHANGELOG.filter((c) => c.date.startsWith("2026-05"));

  return (
    <DocShell groups={side}>
      <PageHead
        crumb={[{ label: "changelog" }]}
        title="Changelog"
        desc="Every dataset and schema change is recorded here, newest first. Each entry references the dataset and the release it landed in."
        actions={
          <>
            <a className="od-btn od-btn--sm" href="/changelog.xml">
              <IcFile s={14} /> RSS
            </a>
            <a className="od-btn od-btn--sm" href="/changelog.json">
              <IcFile s={14} /> JSON feed
            </a>
          </>
        }
      />
      <div style={{ marginBottom: 18 }} id="2026-06">
        <div className="od-eyebrow" style={{ marginBottom: 4 }}>
          2026-06
        </div>
        {june.map((c, i) => (
          <ChangeRow key={i} c={c} />
        ))}
      </div>
      <div id="2026-05">
        <div className="od-eyebrow" style={{ marginBottom: 4 }}>
          2026-05
        </div>
        {may.map((c, i) => (
          <ChangeRow key={i} c={c} />
        ))}
      </div>
    </DocShell>
  );
}
