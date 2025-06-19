import { NextRequest, NextResponse } from "next/server";
import jobs from "@/lib/jobStore";

export async function GET(
    req: NextRequest,
    { params }: { params: { jobId: string } }
) {
    const { jobId } = await params;

    // TODO: fetch job status from your DB/cache/memory by jobId
    console.log(jobs, jobId);
    const job = jobs[jobId];

    if (!job) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(job);
}
