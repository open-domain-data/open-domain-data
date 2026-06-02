import Link from "next/link";
import type { ReactNode } from "react";
import { DATASETS } from "@/lib/data";

export type SideLink = { label: string; href?: string; mono?: boolean; active?: boolean; badge?: ReactNode };
export type SideGroup = { h?: string; links: SideLink[] };

export function Sidebar({ groups }: { groups: SideGroup[] }) {
  return (
    <aside className="od-side" aria-label="Section navigation">
      {groups.map((g, gi) => (
        <div key={gi} className="od-side__group">
          {g.h && <div className="od-side__h">{g.h}</div>}
          {g.links.map((l, li) => {
            const cls = "od-side__link" + (l.mono ? " mono" : "") + (l.active ? " active" : "");
            const inner = (
              <>
                <span>{l.label}</span>
                {l.badge}
              </>
            );
            return l.href ? (
              <Link key={li} href={l.href} className={cls}>
                {inner}
              </Link>
            ) : (
              <span key={li} className={cls}>
                {inner}
              </span>
            );
          })}
        </div>
      ))}
    </aside>
  );
}

export function DocShell({
  groups,
  toc,
  children,
}: {
  groups: SideGroup[];
  toc?: { label: string; href: string }[];
  children: ReactNode;
}) {
  return (
    <div className={"od-shell" + (toc ? " od-shell--toc" : "")}>
      <Sidebar groups={groups} />
      <main className="od-main">{children}</main>
      {toc && (
        <nav className="od-toc" aria-label="On this page">
          <div className="od-toc__h">On this page</div>
          {toc.map((t, i) => (
            <a key={i} className={"od-toc__link" + (i === 0 ? " active" : "")} href={t.href}>
              {t.label}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}

export function Crumb({ parts }: { parts: { label: string; href?: string }[] }) {
  return (
    <div className="od-crumb" aria-label="Breadcrumb">
      {parts.map((p, i) => (
        <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
          {i > 0 && <span className="sep">/</span>}
          {p.href ? (
            <Link href={p.href} className="od-link">
              {p.label}
            </Link>
          ) : (
            <span style={{ color: "var(--od-ink)" }}>{p.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}

export function PageHead({
  crumb,
  title,
  mono,
  desc,
  actions,
  status,
}: {
  crumb?: { label: string; href?: string }[];
  title: ReactNode;
  mono?: boolean;
  desc?: ReactNode;
  actions?: ReactNode;
  status?: ReactNode;
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      {crumb && (
        <div style={{ marginBottom: 14 }}>
          <Crumb parts={crumb} />
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h1
          className="od-h1"
          style={{
            fontFamily: mono ? "var(--od-mono)" : undefined,
            fontSize: mono ? 26 : 30,
            letterSpacing: mono ? "-0.01em" : undefined,
          }}
        >
          {title}
        </h1>
        {status}
      </div>
      {desc && (
        <p className="od-lead" style={{ marginTop: 12, maxWidth: 660 }}>
          {desc}
        </p>
      )}
      {actions && <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>{actions}</div>}
    </div>
  );
}

export function H2A({
  id,
  children,
  right,
}: {
  id?: string;
  children: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 16,
        margin: "36px 0 14px",
      }}
    >
      <h2 className="od-h2" id={id} style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        {children}
        {id && (
          <a
            href={`#${id}`}
            className="mono"
            style={{ fontSize: 12, color: "var(--od-ink-4)", fontWeight: 400, textDecoration: "none" }}
            aria-label={`Link to ${id}`}
          >
            #{id}
          </a>
        )}
      </h2>
      {right}
    </div>
  );
}

export function FieldTable({ fields }: { fields: { f: string; t: string; r: boolean; d: string }[] }) {
  return (
    <div className="od-table--bordered">
      <table className="od-table od-fieldtable">
        <thead>
          <tr>
            <th style={{ width: 200 }}>Field</th>
            <th style={{ width: 170 }}>Type</th>
            <th style={{ width: 90 }}>Required</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((f) => (
            <tr key={f.f}>
              <td className="mono" style={{ fontSize: 12.5, color: "var(--od-ink)" }}>
                {f.f}
              </td>
              <td>
                <span className="ftype">{f.t}</span>
              </td>
              <td>
                <span className="freq" style={{ color: f.r ? "var(--od-ink-2)" : "var(--od-ink-4)" }}>
                  {f.r ? "required" : "optional"}
                </span>
              </td>
              <td style={{ color: "var(--od-ink-2)" }}>{f.d}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function dsSide(activeSlug?: string): SideGroup[] {
  return [
    { h: "Catalog", links: [{ label: "All datasets", href: "/datasets", active: !activeSlug }] },
    {
      h: "Datasets",
      links: DATASETS.map((d) => ({
        label: d.name,
        href: `/datasets/${d.slug}`,
        mono: true,
        active: d.slug === activeSlug,
      })),
    },
  ];
}
