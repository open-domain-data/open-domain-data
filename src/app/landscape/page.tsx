import type { Metadata } from "next";
import { DocShell, PageHead } from "@/components/DocShell";
import { LandscapeView, lsSide } from "@/components/LandscapeView";
import { JsonLd } from "@/components/JsonLd";
import { LANDSCAPE } from "@/lib/landscape";
import { landscapeEditionJsonLd } from "@/lib/structuredData";

export const metadata: Metadata = {
  title: "Domain registrar landscape",
  description:
    "Quarterly aggregate statistics on the domain registrar market — public-API coverage, OAuth and scoped tokens, MCP/agent interfaces, DNSSEC, RDAP and security.txt — computed over the registrars Open Domain Data tracks. Facts, not rankings.",
  alternates: { canonical: "/landscape" },
};

export default function LandscapeHubPage() {
  const edition = LANDSCAPE;
  return (
    <>
      <JsonLd data={landscapeEditionJsonLd(edition, "https://opendomaindata.org/landscape")} />
      <DocShell groups={lsSide()}>
        <PageHead
          crumb={[{ label: "landscape" }]}
          title={`Domain registrar landscape — ${edition.edition}`}
          desc="A quarterly, source-derived snapshot of where the registrar market stands on the capabilities that matter for automation and AI agents: public APIs, delegated auth, machine-readable specs, agent interfaces, DNS, RDAP and security disclosure."
        />
        <LandscapeView edition={edition} />
      </DocShell>
    </>
  );
}
