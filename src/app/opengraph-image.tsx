import { ImageResponse } from "next/og";

export const alt = "Zodiac Veda — Free Vedic Astrology Calculators";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", overflow: "hidden", background: "radial-gradient(circle at 70% 20%, #372370 0%, #131130 45%, #080718 100%)", color: "white", padding: "62px 72px", fontFamily: "serif" }}>
      <div style={{ position: "absolute", right: -60, top: -100, width: 520, height: 520, border: "3px solid rgba(218,184,107,.42)", borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-12deg)" }}>
        <div style={{ position: "absolute", width: 430, height: 210, border: "2px solid rgba(244,217,140,.4)", borderRadius: "50%", transform: "rotate(-23deg)" }} />
        <div style={{ width: 224, height: 224, borderRadius: 999, background: "radial-gradient(circle at 35% 30%, #292548, #0c0b1c 72%)", border: "6px solid #d6ad55", display: "flex", alignItems: "center", justifyContent: "center", color: "#fde9a3", fontFamily: "serif", fontWeight: 800, fontSize: 84, letterSpacing: -9, transform: "rotate(12deg)", boxShadow: "0 0 38px rgba(214,173,85,.28)" }}>ZV</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 900 }}>
        <div style={{ display: "flex", alignItems: "center", color: "#fbbf24", fontSize: 34, letterSpacing: 4, textTransform: "uppercase" }}>ZODIAC VEDA</div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 69, lineHeight: 1.05, fontWeight: 700 }}>Free Vedic Astrology Calculators</div>
        <div style={{ display: "flex", marginTop: 25, maxWidth: 930, fontFamily: "sans-serif", fontSize: 29, lineHeight: 1.4, color: "#d8d7eb" }}>Kundli · Horoscope Matching · Kuja Dosha · Yogas · Gemstones · Nakshatra · Vimshottari Dasha · Sade Sati</div>
        <div style={{ display: "flex", marginTop: 36, fontFamily: "sans-serif", fontSize: 22, color: "#a5b4fc" }}>Lahiri sidereal · Transparent calculations · Detailed saved reports</div>
      </div>
    </div>,
    size,
  );
}
