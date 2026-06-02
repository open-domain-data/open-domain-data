import Link from "next/link";

export default function NotFound() {
  return (
    <main className="od-section" style={{ flex: 1 }}>
      <div className="od-wrap">
        <div className="od-eyebrow" style={{ marginBottom: 8 }}>
          {"// 404"}
        </div>
        <h1 className="od-h1">Not found.</h1>
        <p className="od-lead" style={{ marginTop: 12, maxWidth: 560 }}>
          That page is not part of the catalog. Browse the{" "}
          <Link href="/datasets" className="od-link">
            datasets
          </Link>{" "}
          or the{" "}
          <Link href="/schemas" className="od-link">
            schemas
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
