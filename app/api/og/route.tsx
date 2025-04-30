import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    // Get the poll title from the query parameters
    const { searchParams } = new URL(request.url);
    const hasTitle = searchParams.has("title");
    const title = hasTitle && searchParams.get("title")?.slice(0, 100);

    // Generate the OG image
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f4f4f5",
            backgroundImage:
              "linear-gradient(to bottom right, #3b82f6, #8b5cf6)",
            padding: "40px",
          }}
        >
          {title && (
            <div
              style={{
                display: "flex",
                fontSize: 40,
                fontWeight: "bold",
                color: "white",
                textAlign: "center",
                marginTop: 30,
                marginBottom: 30,
                lineHeight: 1.2,
              }}
            >
              {title}
            </div>
          )}
          <div
            style={{
              display: "flex",
              fontSize: 24,
              color: "white",
              opacity: 0.8,
              marginTop: "auto",
            }}
          >
            🗳️ 반반 • 당신이 선택하세요
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          "cache-control": "public, max-age=86400",
        },
      },
    );
  } catch (error) {
    console.error("Error generating OG image:", error);
    return new Response("Error generating image", { status: 500 });
  }
}
