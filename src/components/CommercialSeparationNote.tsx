import { IcShield } from "./Icons";

export function CommercialSeparationNote() {
  return (
    <div className="od-note od-note--accent" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      <span style={{ color: "var(--od-ink-3)", marginTop: 2 }}>
        <IcShield s={20} />
      </span>
      <div>
        <div className="od-note__h">Commercial separation</div>
        <p className="od-body" style={{ fontSize: 14 }}>
          Open Domain Data publishes structured datasets only. It does not rank registrars or recommend providers.
          Ranking and recommendation products are maintained separately and must disclose how they use this data.
        </p>
      </div>
    </div>
  );
}
