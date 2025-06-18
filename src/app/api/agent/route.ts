// src/app/api/agent/route.ts
import { NextRequest, NextResponse } from "next/server";
import { runContentAgent } from "@/agents/contentAgent";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json();
        const jobId = uuidv4(); // Generate early

        if (!prompt) {
            return NextResponse.json(
                { success: false, error: "Missing prompt" },
                { status: 400 }
            );
        }

        // Start processing in the background (without awaiting)
        runContentAgent(jobId, prompt);

        // Respond with job ID immediately
        return NextResponse.json(
            { success: true, jobId: jobId },
            { status: 202, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { success: false, error: "Server error" },
            { status: 500 }
        );
    }
}
