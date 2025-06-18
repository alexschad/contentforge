import { ArticleType } from "@/types/Article";

export type JobStatus =
    | "queued"
    | "generating_article"
    | "generating_tags"
    | "generating_image"
    | "downloading_image"
    | "uploading_image"
    | "uploading_article"
    | "uploading_tags"
    | "completed"
    | "error";

export interface Job {
    id: string;
    status: JobStatus;
    result?: ArticleType;
    error?: string;
    createdAt: Date;
}

const jobs: Record<string, Job> = {};

export default jobs;
