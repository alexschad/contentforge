export type JobStatus =
    | "queued"
    | "generating_article"
    | "generating_tags"
    | "generating_image"
    | "generating_image_metadata"
    | "downloading_image"
    | "uploading_image"
    | "uploading_article"
    | "uploading_tags"
    | "completed"
    | "error";

export interface Job {
    id: string;
    status: JobStatus;
    error?: string;
    createdAt: Date;
}

const jobs: Record<string, Job> = {};

export const jobSteps: JobStatus[] = [
    "queued",
    "generating_article",
    "generating_tags",
    "generating_image",
    "generating_image_metadata",
    "downloading_image",
    "uploading_image",
    "uploading_article",
    "uploading_tags",
    "completed",
];

export const jobStatusDisplayMap: Record<JobStatus, string> = {
    queued: "🕒 Queued...",
    generating_article: "📝 Generating article...",
    generating_tags: "🏷️ Generating tags...",
    generating_image: "🎨 Generating image...",
    generating_image_metadata: "🧠 Generating image metadata...",
    downloading_image: "⬇️ Downloading image...",
    uploading_image: "📤 Uploading image...",
    uploading_article: "📄 Uploading article...",
    uploading_tags: "🔗 Uploading tags...",
    completed: "✅ Completed!",
    error: "❌ Error occurred.",
};

export function getJobProgressPercent(status: JobStatus | null): number {
    if (!status) return 0;
    const index = jobSteps.indexOf(status);
    if (index === -1) return 0;
    return Math.round((index / (jobSteps.length - 1)) * 100);
}

export default jobs;
