import { IcDownload, IcFile } from "./Icons";

export function DownloadLinks({
  jsonHref,
  csvHref,
  schemaHref,
  jsonSize,
  csvSize,
  schemaSize,
}: {
  jsonHref: string;
  csvHref?: string;
  schemaHref?: string;
  jsonSize?: string;
  csvSize?: string;
  schemaSize?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <a className="od-dl" href={jsonHref}>
        <IcDownload s={14} /> {jsonHref.split("/").pop()}
        {jsonSize && <span className="sz">· {jsonSize}</span>}
      </a>
      {csvHref && (
        <a className="od-dl" href={csvHref}>
          <IcDownload s={14} /> {csvHref.split("/").pop()}
          {csvSize && <span className="sz">· {csvSize}</span>}
        </a>
      )}
      {schemaHref && (
        <a className="od-dl" href={schemaHref}>
          <IcFile s={14} /> {schemaHref.split("/").pop()}
          {schemaSize && <span className="sz">· {schemaSize}</span>}
        </a>
      )}
    </div>
  );
}
