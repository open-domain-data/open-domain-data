export function CitationBlock({ dataset, version, slug }: { dataset: string; version: string; slug: string }) {
  return (
    <div
      style={{
        background: "var(--od-panel)",
        border: "1px solid var(--od-line)",
        borderRadius: 8,
        padding: "14px 16px",
        fontFamily: "var(--od-mono)",
        fontSize: 12.5,
        color: "var(--od-ink-2)",
        lineHeight: 1.7,
      }}
    >
      Open Domain Data (2026). <span style={{ color: "var(--od-ink)" }}>{dataset}</span>, v{version}.
      <br />
      opendomaindata.org/datasets/{slug}. Retrieved 2026-06-01. Licensed CC-BY-4.0.
    </div>
  );
}
