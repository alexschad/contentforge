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

export default jobs;
