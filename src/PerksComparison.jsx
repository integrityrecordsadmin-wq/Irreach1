import React from "react";
import { Check, X } from "lucide-react";

/* =====================================================================
   PERKS COMPARISON TABLE
   Shows Free vs Subscriber side by side. Drop this into the Subscription
   page so people can see exactly what they unlock — including Gospel
   Connection, which is a subscriber-only perk.

   Usage:
     <PerksComparison />
   ===================================================================== */

const NAVY = "#0B1F3A";
const GOLD = "#C6A15B";
const CREAM = "#FAF6EE";

const ROWS = [
  { label: "Preview ringtone clips", free: true, sub: true },
  { label: "Download all 8 versions of every released song", free: false, sub: true },
  { label: "\"What to Look Out For Before Signing a Music Contract\" ebook", free: false, sub: true },
  { label: "Daily Planner for the Working Artist", free: false, sub: true },
  { label: "Early access to new releases from Integrity Records artists", free: false, sub: true },
  { label: "Gospel Connection — share and connect with other subscribers", free: false, sub: true },
  { label: "Cancel any time — no contracts, no fine print", free: true, sub: true },
];

function Cell({ included }) {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      {included ? (
        <Check size={18} color={GOLD} strokeWidth={3} />
      ) : (
        <X size={16} color="#C9C2B0" strokeWidth={2.5} />
      )}
    </div>
  );
}

export default function PerksComparison() {
  return (
    <div
      style={{
        maxWidth: 640,
        margin: "0 auto",
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid #E7E1D3",
        background: "white",
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 90px 90px",
          background: NAVY,
          padding: "18px 20px",
        }}
      >
        <div style={{ color: "white", fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700 }}>
          What's included
        </div>
        <div style={{ color: "#B9C4D8", fontSize: 12.5, fontWeight: 700, textAlign: "center" }}>
          Free
        </div>
        <div style={{ color: GOLD, fontSize: 12.5, fontWeight: 700, textAlign: "center" }}>
          Subscriber
        </div>
      </div>

      {/* Rows */}
      {ROWS.map((row, i) => (
        <div
          key={row.label}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 90px 90px",
            alignItems: "center",
            padding: "14px 20px",
            background: i % 2 === 0 ? "white" : CREAM,
            borderTop: "1px solid #F0EBDC",
          }}
        >
          <div style={{ fontSize: 13.5, color: "#333", lineHeight: 1.4, paddingRight: 12 }}>
            {row.label}
          </div>
          <Cell included={row.free} />
          <Cell included={row.sub} />
        </div>
      ))}
    </div>
  );
}
