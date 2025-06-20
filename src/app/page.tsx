"use client";

import { useEffect, useState } from "react";
import { JobProgress } from "@/components/jobProgress";
import type { JobStatus } from "@/lib/jobStore";

export default function StartPage() {
    const [prompt, setPrompt] = useState("");
    const [jobId, setJobId] = useState<string | null>(null);
    const [status, setStatus] = useState<JobStatus | null>(null);
    const [articleUrl, setArticleUrl] = useState<string | null>(null);
    const [showOptions, setShowOptions] = useState(false);
    const [wordCount, setWordCount] = useState(500);
    const [tone, setTone] = useState("neutral");
    const [includeImage, setIncludeImage] = useState(true);
    const [imageStyle, setImageStyle] = useState("illustration");

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
                body: JSON.stringify({
                    prompt,
                    wordCount,
                    tone,
                    includeImage,
                    imageStyle,
                }),
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
                onClick={() => setShowOptions(!showOptions)}
                className="bg-black text-white px-4 py-2 m-2 rounded hover:bg-gray-800"
            >
                {showOptions ? "Hide options" : "Show options"}
            </button>

            {showOptions && (
                <div className="border mt-4 p-4 m-2 rounded bg-gray-50">
                    <div className="mb-3">
                        <label className="block font-medium">
                            Minimum Word Count
                        </label>
                        <select
                            value={wordCount}
                            onChange={(e) =>
                                setWordCount(Number(e.target.value))
                            }
                            className="w-full border rounded p-2"
                        >
                            <option value="500">500</option>
                            <option value="1000">1000</option>
                            <option value="1500">1500</option>
                            <option value="2000">2000</option>
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="block font-medium">Tone</label>
                        <select
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                            className="w-full border rounded p-2"
                        >
                            <option value="neutral">Neutral</option>
                            <option value="professional">Professional</option>
                            <option value="journalistic">Journalistic</option>
                            <option value="poetic">Poetic</option>
                            <option value="formal">Formal</option>
                            <option value="casual">Casual</option>
                            <option value="humorous">Humorous</option>
                            <option value="inspirational">Inspirational</option>
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={includeImage}
                                onChange={() => setIncludeImage(!includeImage)}
                            />
                            Include image
                        </label>
                    </div>

                    {includeImage && (
                        <div className="mb-3">
                            <label className="block font-medium">
                                Image Style
                            </label>
                            <select
                                value={imageStyle}
                                onChange={(e) => setImageStyle(e.target.value)}
                                className="w-full border rounded p-2"
                            >
                                <option value="illustration">
                                    Illustration
                                </option>
                                <option value="photo realistic">
                                    Photo Realistic
                                </option>
                                <option value="3d render">3D Render</option>
                                <option value="painting">Painting</option>
                            </select>
                        </div>
                    )}
                </div>
            )}

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
