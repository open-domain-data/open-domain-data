"use client";

import { useState, type ReactNode } from "react";
import { IcCopy } from "./Icons";

type Tab = { label: string; content: ReactNode };

export function CodeBlock({ tabs, action = "Copy" }: { tabs: Tab[]; action?: string }) {
  const [active, setActive] = useState(0);
  const current = tabs[active];
  return (
    <div className="od-code">
      <div className="od-code__bar">
        <div className="od-code__tabs">
          {tabs.map((t, i) => (
            <button
              key={t.label}
              type="button"
              className={"od-code__tab" + (i === active ? " is-active" : "")}
              onClick={() => setActive(i)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button type="button" className="od-code__act" aria-label={action}>
          <IcCopy s={13} /> {action}
        </button>
      </div>
      <pre>
        <code>{current.content}</code>
      </pre>
    </div>
  );
}

export const K = ({ children }: { children: ReactNode }) => <span className="t-key">{children}</span>;
export const S = ({ children }: { children: ReactNode }) => <span className="t-str">{children}</span>;
export const N = ({ children }: { children: ReactNode }) => <span className="t-num">{children}</span>;
export const Bo = ({ children }: { children: ReactNode }) => <span className="t-bool">{children}</span>;
export const Pu = ({ children }: { children: ReactNode }) => <span className="t-pun">{children}</span>;
export const Cm = ({ children }: { children: ReactNode }) => <span className="t-cmt">{children}</span>;
export const Mt = ({ children }: { children: ReactNode }) => <span className="t-mtd">{children}</span>;
