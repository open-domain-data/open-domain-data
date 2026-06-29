"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IcSearch, IcGit, IcExt } from "./Icons";

export function OdLogo() {
  return (
    <Link href="/" className="od-logo" aria-label="Open Domain Data home">
      <svg width={22} height={22} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="22" height="22" rx="5.5" fill="#F1F4F8" stroke="#D5DCE5" />
        <circle
          cx="12"
          cy="12"
          r="6.5"
          stroke="#1F6FEB"
          strokeWidth="1.8"
          strokeDasharray="30 11"
          strokeLinecap="round"
          transform="rotate(-58 12 12)"
        />
        <circle cx="12" cy="12" r="2.4" fill="#157F4B" />
      </svg>
      <span className="od-logo__type">
        opendomaindata<span className="s">.org</span>
      </span>
    </Link>
  );
}

const NAV: { label: string; href: string; match: RegExp }[] = [
  { label: "Datasets", href: "/datasets", match: /^\/datasets/ },
  { label: "Schemas", href: "/schemas", match: /^\/schemas/ },
  { label: "Registrars", href: "/registrars", match: /^\/registrars/ },
  { label: "Methodology", href: "/methodology", match: /^\/methodology/ },
  { label: "Provenance", href: "/provenance", match: /^\/provenance/ },
  { label: "Changelog", href: "/changelog", match: /^\/changelog/ },
  { label: "Developers", href: "/developers", match: /^\/developers/ },
];

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  return (
    <nav className="od-nav" aria-label="Primary">
      <OdLogo />
      <div className="od-nav__links">
        {NAV.map((l) => (
          <Link
            key={l.label}
            href={l.href}
            className={"od-nav__link" + (l.match.test(pathname) ? " active" : "")}
          >
            {l.label}
          </Link>
        ))}
      </div>
      <div className="od-nav__spacer" />
      <div className="od-search" role="search" aria-label="Search datasets">
        <IcSearch s={14} /> Search datasets… <span className="od-kbd">/</span>
      </div>
      <a
        className="od-nav__link"
        href="https://github.com/open-domain-data/open-domain-data"
        style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
      >
        <IcGit s={15} /> GitHub <IcExt s={12} style={{ opacity: 0.5 }} />
      </a>
      <Link className="od-btn" href="/developers#downloads">
        Download data
      </Link>
    </nav>
  );
}
