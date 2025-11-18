import { NextRequest, NextResponse } from "next/server";
import { webhookLogger } from "@/lib/webhook-logger";

// TODO: Add proper admin authentication
function validateAdminRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  // TODO: Verify admin token/session
  return !!authHeader;
}

export async function GET(request: NextRequest) {
  if (!validateAdminRequest(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get("level") || undefined;
    const eventType = searchParams.get("eventType") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 100;

    const logs = webhookLogger.getLogs({ level, eventType, limit });

    return NextResponse.json({
      logs,
      count: logs.length,
      filters: { level, eventType, limit },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to retrieve logs" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!validateAdminRequest(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  webhookLogger.clearLogs();

  return NextResponse.json({ success: true, message: "Logs cleared" });
}
