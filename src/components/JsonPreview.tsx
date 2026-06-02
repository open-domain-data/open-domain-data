import { CodeBlock } from "./CodeBlock";
import type { ReactNode } from "react";

function color(value: unknown, indent: number): ReactNode {
  const pad = "  ".repeat(indent);
  if (value === null) return <span className="t-bool">null</span>;
  if (typeof value === "boolean") return <span className="t-bool">{String(value)}</span>;
  if (typeof value === "number") return <span className="t-num">{value}</span>;
  if (typeof value === "string") return <span className="t-str">{JSON.stringify(value)}</span>;
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="t-pun">[]</span>;
    const allScalar = value.every((v) => typeof v !== "object" || v === null);
    if (allScalar) {
      return (
        <>
          <span className="t-pun">[</span>
          {value.map((v, i) => (
            <span key={i}>
              {color(v, indent)}
              {i < value.length - 1 && <span className="t-pun">, </span>}
            </span>
          ))}
          <span className="t-pun">]</span>
        </>
      );
    }
    return (
      <>
        <span className="t-pun">[</span>
        {"\n"}
        {value.map((v, i) => (
          <span key={i}>
            {pad}  {color(v, indent + 1)}
            {i < value.length - 1 && <span className="t-pun">,</span>}
            {"\n"}
          </span>
        ))}
        {pad}
        <span className="t-pun">]</span>
      </>
    );
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    return (
      <>
        <span className="t-pun">{"{"}</span>
        {"\n"}
        {entries.map(([k, v], i) => (
          <span key={k}>
            {pad}  <span className="t-key">{JSON.stringify(k)}</span>
            <span className="t-pun">: </span>
            {color(v, indent + 1)}
            {i < entries.length - 1 && <span className="t-pun">,</span>}
            {"\n"}
          </span>
        ))}
        {pad}
        <span className="t-pun">{"}"}</span>
      </>
    );
  }
  return String(value);
}

export function JsonPreview({ value, label = "JSON" }: { value: unknown; label?: string }) {
  return (
    <CodeBlock
      tabs={[
        {
          label,
          content: color(value, 0),
        },
      ]}
    />
  );
}
