import { ImageResponse } from "next/og";

export const alt = "AutoRent: Rent a car in Prishtina";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
          padding: 90,
          background: "#0A0B0D",
          color: "#F5F6F7",
          fontFamily: "sans-serif",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -160,
            right: -120,
            width: 620,
            height: 620,
            display: "flex",
            background: "radial-gradient(circle, rgba(76,130,255,0.40), transparent 60%)",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              width: 76,
              height: 76,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 20,
              background: "linear-gradient(135deg, #4C82FF, #8AB0FF)",
              color: "#0A0B0D",
              fontSize: 36,
              fontWeight: 800,
            }}
          >
            AR
          </div>
          <div style={{ display: "flex", fontSize: 44, fontWeight: 800 }}>
            Auto<span style={{ color: "#4C82FF" }}>Rent</span>
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 74, fontWeight: 800, marginTop: 46, maxWidth: 940, lineHeight: 1.05 }}>
          Rent a car in Prishtina
        </div>
        <div style={{ display: "flex", fontSize: 34, color: "#8A8F98", marginTop: 26 }}>
          Book online, pay instantly, pick up the keys.
        </div>
      </div>
    ),
    { ...size },
  );
}
