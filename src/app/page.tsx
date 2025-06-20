"use client";

import { useEffect, useState } from "react";
import { JobProgress } from "@/components/jobProgress";
import type { JobStatus } from "@/lib/jobStore";

export default function StartPage() {
    const [prompt, setPrompt] = useState("");
    const [jobId, setJobId] = useState<string | null>(null);
    const [status, setStatus] = useState<JobStatus | null>(null);
    const [articleUrl, setArticleUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!jobId) return;
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/jobs/${jobId}`);
                const data = await res.json();
                setStatus(data.status);
                if (data.status === "completed" || data.status === "error") {
                    clearInterval(interval);
                }
                if (data.status === "completed" && data.result) {
                    setArticleUrl(data.result);
                }
            } catch (err) {
                setStatus("error");
                clearInterval(interval);
                console.error("Polling error:", err);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [jobId]);

    async function runAgent() {
        try {
            setStatus("queued");
            setArticleUrl(null);
            const res = await fetch("/api/agent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error || "Unknown error");
            }

            setJobId(data.jobId || null);
        } catch (error) {
            if (error instanceof Error) {
                setStatus("error");
            } else {
                throw error;
            }
        }
    }

    return (
        <main className="max-w-xl mx-auto px-4 py-10 font-sans">
            <h1 className="text-3xl font-bold mb-4">🧠 ContentForge</h1>

            <label className="block mb-2 text-lg" htmlFor="prompt">
                What should the article be about?
            </label>
            <textarea
                id="prompt"
                className="w-full p-3 border rounded mb-4"
                rows={4}
                placeholder="e.g. AI in journalism"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
            />

            <button
                onClick={runAgent}
                disabled={status !== null && status !== "completed"}
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
            >
                {status !== null && status !== "completed"
                    ? "Generating..."
                    : "Generate Article"}
            </button>
            <JobProgress status={status} />

            {articleUrl && (
                <a
                    href={articleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-4 text-blue-600 underline"
                >
                    🔗 View Published Article
                </a>
            )}
        </main>
    );
}
