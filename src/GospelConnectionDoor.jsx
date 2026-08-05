import React, { useState } from "react";

/* =====================================================================
   GOSPEL CONNECTION — DOOR ENTRANCE
   A themed entry point: an arched wooden door with warm light spilling
   from beneath it. Clicking it plays a Stargate-style "wormhole" event
   horizon transition, then calls onEnter() to route into the Gospel
   Connection feed.

   Usage:
     <GospelConnectionDoor onEnter={() => setPage("gospel-connection")} />
   ===================================================================== */

const NAVY = "#0B1F3A";
const NAVY_DEEP = "#071527";
const GOLD = "#C6A15B";
const GOLD_LIGHT = "#E8D5A8";

export default function GospelConnectionDoor({ onEnter }) {
  const [hover, setHover] = useState(false);
  const [entering, setEntering] = useState(false);

  const handleEnter = () => {
    if (entering) return;
    setEntering(true);
    // Let the wormhole animation play, then actually navigate.
    setTimeout(() => {
      onEnter();
    }, 1300);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "48px 20px",
        background: `radial-gradient(ellipse at center 70%, ${hover ? "#1A2E4E" : NAVY} 0%, ${NAVY_DEEP} 70%)`,
        borderRadius: 18,
        transition: "background 0.5s ease",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <style>{`
        @keyframes wormholeRing {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          8% { opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
        @keyframes wormholeFlash {
          0% { opacity: 0; }
          55% { opacity: 0; }
          75% { opacity: 1; }
          100% { opacity: 1; }
        }
        @keyframes wormholeShimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>

      {entering && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            pointerEvents: "none",
            overflow: "hidden",
            background: "#000",
            animation: "wormholeFlash 1.3s ease forwards",
          }}
        >
          {[0, 0.12, 0.24, 0.36, 0.48].map((delay, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: `2px solid ${i % 2 === 0 ? "#8FD6FF" : GOLD_LIGHT}`,
                boxShadow: `0 0 40px 10px ${i % 2 === 0 ? "#8FD6FF" : GOLD_LIGHT}`,
                animation: `wormholeRing 1.1s ease-out ${delay}s forwards`,
              }}
            />
          ))}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(circle at 50% 50%, #eaf6ff 0%, #8FD6FF 20%, ${GOLD_LIGHT} 45%, ${NAVY_DEEP} 75%)`,
              backgroundSize: "200% 200%",
              opacity: 0,
              animation: "wormholeShimmer 1.3s linear infinite, wormholeFlash 1.3s ease forwards",
              mixBlendMode: "screen",
            }}
          />
        </div>
      )}

      <p
        style={{
          fontFamily: "Georgia, serif",
          fontStyle: "italic",
          color: "#B9C4D8",
          fontSize: 13.5,
          margin: "0 0 26px",
          textAlign: "center",
          letterSpacing: 0.3,
        }}
      >
        "Behold, I stand at the door and knock." — Revelation 3:20
      </p>

      <button
        onClick={handleEnter}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        aria-label="Enter Gospel Connection"
        disabled={entering}
        style={{
          background: "none",
          border: "none",
          cursor: entering ? "default" : "pointer",
          padding: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Door + glow */}
        <div style={{ position: "relative", width: 150, height: 210 }}>
          {/* light spill glow behind door */}
          <div
            style={{
              position: "absolute",
              bottom: -10,
              left: "50%",
              transform: "translateX(-50%)",
              width: hover ? 220 : 170,
              height: hover ? 90 : 60,
              background: `radial-gradient(ellipse, ${GOLD_LIGHT}66 0%, transparent 70%)`,
              transition: "all 0.4s ease",
              filter: "blur(4px)",
            }}
          />

          {/* door frame */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              borderRadius: "75px 75px 6px 6px",
              background: "linear-gradient(180deg, #142943 0%, #0C1E36 100%)",
              border: `2px solid ${GOLD}`,
              boxShadow: hover
                ? `0 0 30px 4px ${GOLD}55, inset 0 0 20px ${GOLD}22`
                : `0 0 12px 1px ${GOLD}33`,
              transition: "box-shadow 0.4s ease",
              overflow: "hidden",
            }}
          >
            {/* vertical panel seam */}
            <div
              style={{
                position: "absolute",
                top: 14,
                bottom: 14,
                left: "50%",
                width: 1,
                background: `${GOLD}44`,
              }}
            />
            {/* door panels (top arch + bottom rectangle), subtle */}
            <div
              style={{
                position: "absolute",
                top: 18,
                left: 14,
                right: 14,
                height: 70,
                borderRadius: "50px 50px 6px 6px",
                border: `1px solid ${GOLD}33`,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 100,
                left: 14,
                right: 14,
                bottom: 18,
                borderRadius: 6,
                border: `1px solid ${GOLD}33`,
              }}
            />

            {/* light seam glowing through the door crack as it "opens" on hover */}
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: "50%",
                width: hover ? 10 : 2,
                background: `${GOLD_LIGHT}`,
                opacity: hover ? 0.85 : 0.35,
                filter: "blur(2px)",
                transform: "translateX(-50%)",
                transition: "all 0.4s ease",
              }}
            />

            {/* handle */}
            <div
              style={{
                position: "absolute",
                top: "52%",
                right: 22,
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: GOLD,
                boxShadow: `0 0 6px ${GOLD}`,
              }}
            />

            {/* cross emblem on upper panel */}
            <div
              style={{
                position: "absolute",
                top: 38,
                left: "50%",
                transform: "translateX(-50%)",
                width: 26,
                height: 34,
              }}
            >
              {/* vertical beam */}
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: 0,
                  bottom: 0,
                  width: 3.5,
                  transform: "translateX(-50%)",
                  background: GOLD,
                  borderRadius: 2,
                  boxShadow: hover ? `0 0 8px ${GOLD}99` : `0 0 3px ${GOLD}55`,
                  transition: "box-shadow 0.4s ease",
                }}
              />
              {/* horizontal beam */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 9,
                  height: 3.5,
                  background: GOLD,
                  borderRadius: 2,
                  boxShadow: hover ? `0 0 8px ${GOLD}99` : `0 0 3px ${GOLD}55`,
                  transition: "box-shadow 0.4s ease",
                }}
              />
            </div>
          </div>
        </div>

        <span
          style={{
            marginTop: 22,
            fontFamily: "Georgia, serif",
            fontSize: 19,
            fontWeight: 700,
            color: GOLD,
            letterSpacing: 0.5,
          }}
        >
          {entering ? "Stepping through…" : "Enter Gospel Connection"}
        </span>
        <span
          style={{
            marginTop: 4,
            fontSize: 12.5,
            color: "#8FA0BE",
          }}
        >
          {hover && !entering ? "Tap to step inside" : !entering ? "A space for the community to connect" : ""}
        </span>
      </button>
    </div>
  );
}
