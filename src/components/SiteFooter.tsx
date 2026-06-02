import Link from "next/link";
import { IcDb, IcGit } from "./Icons";
import { OdLogo } from "./SiteHeader";

const COLS: [string, [string, string][]][] = [
  [
    "Datasets",
    [
      ["Catalog", "/datasets"],
      ["registrars", "/datasets/registrars"],
      ["tld_pricing", "/datasets/tld-pricing"],
      ["dns_capabilities", "/datasets/dns-capabilities"],
      ["rdap_metadata", "/datasets/rdap-metadata"],
    ],
  ],
  [
    "Reference",
    [
      ["Schemas", "/schemas"],
      ["Verification model", "/methodology#verification"],
      ["Licensing", "/methodology#licensing"],
      ["API status", "/developers"],
    ],
  ],
  [
    "Developers",
    [
      ["API reference", "/developers"],
      ["llms.txt", "/llms.txt"],
      ["JSON / CSV", "/developers#formats"],
      ["OpenAPI", "/developers#endpoints"],
    ],
  ],
  [
    "Project",
    [
      ["GitHub", "https://github.com/open-domain-data/open-domain-data"],
      ["Changelog", "/changelog"],
      ["Contribute", "/contribute"],
      ["Contact", "/contribute"],
    ],
  ],
];

export function SiteFooter() {
  return (
    <footer className="od-footer">
      <div className="od-footer__cols">
        <div>
          <OdLogo />
          <p className="od-body" style={{ marginTop: 12, maxWidth: 300, fontSize: 13 }}>
            Open, versioned datasets for the domain infrastructure ecosystem. Maintained as an open-source project.
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <span className="od-pill">
              <IcDb s={13} /> CC BY 4.0
            </span>
            <span className="od-pill">
              <IcGit s={13} /> Open source
            </span>
          </div>
        </div>
        {COLS.map(([h, links]) => (
          <div key={h}>
            <div className="od-footer__h">{h}</div>
            {links.map(([l, href]) =>
              href.startsWith("http") ? (
                <a key={l} className="od-footer__link" href={href}>
                  {l}
                </a>
              ) : (
                <Link key={l} className="od-footer__link" href={href}>
                  {l}
                </Link>
              ),
            )}
          </div>
        ))}
      </div>
      <div className="od-footer__bottom">
        <span>© 2026 Open Domain Data</span>
        <span style={{ marginLeft: "auto", fontFamily: "var(--od-mono)" }}>opendomaindata.org</span>
      </div>
    </footer>
  );
}
