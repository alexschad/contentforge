"use client";

import { jobStatusDisplayMap, getJobProgressPercent } from "@/lib/jobStore";
import type { JobStatus } from "@/lib/jobStore";

export function JobProgress({ status }: { status: JobStatus | null }) {
    if (!status) return null;
    const progress = getJobProgressPercent(status);
    const label = jobStatusDisplayMap[status] || "Working...";

    return (
        <div className="my-4">
            <div className="mb-2 text-sm font-medium text-gray-700">
                {label}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                    className={`h-4 rounded-full transition-all duration-500 ${
                        status === "completed"
                            ? "bg-green-500"
                            : status === "error"
                            ? "bg-red-500"
                            : "bg-blue-500"
                    }`}
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
}
