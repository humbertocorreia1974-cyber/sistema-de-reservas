import { ImageResponse } from "next/og";
import { landing } from "@/content/landing";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  const letter = (landing.name || "A").trim().charAt(0).toUpperCase() || "A";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d4a4f",
          color: "#fff",
          fontSize: 20,
          fontWeight: 700,
          fontFamily: "sans-serif",
          borderRadius: 6,
        }}
      >
        {letter}
      </div>
    ),
    size
  );
}
