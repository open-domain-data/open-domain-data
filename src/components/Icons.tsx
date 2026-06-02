import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { s?: number; w?: number };

const make = (path: React.ReactNode) =>
  function Icon({ s = 16, w = 1.7, style, ...rest }: IconProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        width={s}
        height={s}
        fill="none"
        stroke="currentColor"
        strokeWidth={w}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={style}
        aria-hidden="true"
        {...rest}
      >
        {path}
      </svg>
    );
  };

export const IcSearch = make(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </>,
);
export const IcDownload = make(<path d="M12 3v12M7 11l5 5 5-5M5 21h14" />);
export const IcArrow = make(<path d="M5 12h14M13 6l6 6-6 6" />);
export const IcExt = make(<path d="M7 17 17 7M8 7h9v9" />);
export const IcCheck = make(<polyline points="20 6 9 17 4 12" />);
export const IcCopy = make(
  <>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h8" />
  </>,
);
export const IcFile = make(
  <>
    <path d="M7 3h7l4 4v14H7z" />
    <path d="M14 3v4h4" />
  </>,
);
export const IcBook = make(
  <>
    <path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2zM18 19H6a2 2 0 0 0-2 2" />
  </>,
);
export const IcTerminal = make(
  <>
    <path d="M5 7l4 4-4 4M12 16h6" />
    <rect x="2.5" y="3.5" width="19" height="17" rx="2.2" />
  </>,
);
export const IcDb = make(
  <>
    <ellipse cx="12" cy="5.5" rx="8" ry="3" />
    <path d="M4 5.5v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6M4 11.5v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
  </>,
);
export const IcPr = make(
  <>
    <circle cx="6" cy="6" r="2.5" />
    <circle cx="6" cy="18" r="2.5" />
    <circle cx="18" cy="18" r="2.5" />
    <path d="M6 8.5v7M18 15.5V13a3 3 0 0 0-3-3h-3l2.5-2.5M11.5 12.5 14 10" />
  </>,
);
export const IcIssue = make(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v4M12 16h.01" />
  </>,
);
export const IcEdit = make(
  <>
    <path d="M12 20h8M4 20l1-4 11-11 3 3-11 11z" />
  </>,
);
export const IcSchema = make(
  <>
    <rect x="3" y="3" width="7" height="7" rx="1.4" />
    <rect x="14" y="14" width="7" height="7" rx="1.4" />
    <path d="M10 6.5h4a2 2 0 0 1 2 2V14" />
  </>,
);
export const IcShield = make(<path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />);
export const IcGit = ({ s = 16, style }: { s?: number; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill="currentColor" style={style} aria-hidden="true">
    <path d="M12 1.5C6.2 1.5 1.5 6.2 1.5 12c0 4.6 3 8.6 7.2 10 .5.1.7-.2.7-.5v-1.8c-2.9.6-3.5-1.4-3.5-1.4-.5-1.2-1.2-1.5-1.2-1.5-.9-.6.1-.6.1-.6 1 .1 1.6 1 1.6 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.7-1.4-2.3-.3-4.8-1.2-4.8-5.2 0-1.1.4-2.1 1-2.8-.1-.3-.5-1.4.1-2.9 0 0 .9-.3 2.8 1a9.6 9.6 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .6 1.5.2 2.6.1 2.9.7.7 1 1.7 1 2.8 0 4-2.5 4.9-4.8 5.2.4.3.7 1 .7 2v3c0 .3.2.6.7.5 4.2-1.4 7.2-5.4 7.2-10C22.5 6.2 17.8 1.5 12 1.5z" />
  </svg>
);
