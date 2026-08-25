import { ImageResponse } from "next/og";
import { getSettings } from "@/lib/settings";

export const alt = "Graphic designer portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 60;

// Тільки латиниця: вбудований у Satori шрифт не має кириличних гліфів.
export default async function OpengraphImage() {
  const settings = await getSettings();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#08080a",
          color: "#f3f1ec",
          padding: "72px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#ff5227",
          }}
        >
          Graphic designer
        </div>

        <div style={{ display: "flex", fontSize: 180, letterSpacing: "-0.05em" }}>
          {settings.name}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 28,
            color: "#8c8a93",
            borderTop: "1px solid #22222a",
            paddingTop: "32px",
          }}
        >
          <div style={{ display: "flex" }}>Identity · Posters · Digital</div>
          <div style={{ display: "flex" }}>Portfolio</div>
        </div>
      </div>
    ),
    size,
  );
}
