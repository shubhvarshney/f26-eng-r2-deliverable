import { generateResponse } from "@/lib/services/species-chat";
import { NextResponse } from "next/server";

// POST Endpoint
export async function POST(request: Request) {
  let body: unknown;

  // Check for valid JSON
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  // Check for non-empty message
  if (
    typeof body !== "object" ||
    body === null ||
    !("message" in body) ||
    typeof body.message !== "string" ||
    body.message.trim().length === 0
  ) {
    return NextResponse.json({ error: "A non-empty message is required." }, { status: 400 });
  }

  // Generate response and handle failures
  try {
    const response = await generateResponse(body.message.trim());
    return NextResponse.json({ response });
  } catch {
    return NextResponse.json({ error: "The species chat service is unavailable." }, { status: 502 });
  }
}
