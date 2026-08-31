import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { DOSSIER_SYSTEM_PROMPT, type AiDossierResult } from "@/features/dossiers/ai-dossier-prompt";

export const runtime = "nodejs";

interface GenerateDossierRequestBody {
  rawInput?: string;
  existingDossier?: unknown;
}

/** Calls the Content IQ Brand Dossier Generator (see ai-dossier-prompt.ts)
 *  server-side, so the API key never reaches the browser. Requires
 *  ANTHROPIC_API_KEY — see .env.example. The client falls back to the
 *  offline mock generator whenever this returns a non-2xx response. */
export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY is not configured on this server." }, { status: 501 });
  }

  let body: GenerateDossierRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const rawInput = body.rawInput?.trim();
  if (!rawInput) {
    return NextResponse.json({ error: "rawInput is required." }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  const userContent = [
    "RAW_INPUT:",
    rawInput,
    "",
    "EXISTING_DOSSIER:",
    body.existingDossier ? JSON.stringify(body.existingDossier) : "null",
  ].join("\n");

  try {
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      system: DOSSIER_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    });

    const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
    if (!textBlock) {
      return NextResponse.json({ error: "The model returned no text content." }, { status: 502 });
    }

    const jsonText = textBlock.text
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```\s*$/i, "");

    let parsed: AiDossierResult;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      return NextResponse.json({ error: "The model's response was not valid JSON." }, { status: 502 });
    }

    return NextResponse.json({ result: parsed });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: "Invalid Anthropic API key." }, { status: 401 });
    }
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "Rate limited — try again shortly." }, { status: 429 });
    }
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json({ error: error.message }, { status: error.status ?? 500 });
    }
    return NextResponse.json({ error: "Failed to generate the dossier." }, { status: 500 });
  }
}
