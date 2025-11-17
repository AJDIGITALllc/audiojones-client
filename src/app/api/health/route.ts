import { NextResponse } from "next/server";

export async function GET() {
  try {
    const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "unknown";
    const nodeEnv = process.env.NODE_ENV || "development";
    const timestamp = new Date().toISOString();

    return NextResponse.json({
      status: "ok",
      timestamp,
      env: nodeEnv,
      project: firebaseProjectId,
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      { error: "unhealthy" },
      { status: 500 }
    );
  }
}
