"use client";

import { useEffect, useState } from "react";

export default function StartPage() {
    const [prompt, setPrompt] = useState("");
    const [jobId, setJobId] = useState<string | null>(null);
    const [status, setStatus] = useState("");
    const [error, setError] = useState<string | null>(null);

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
            } catch (err) {
                setError("Polling failed");
                clearInterval(interval);
                console.error("Polling error:", err);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [jobId]);

    async function runAgent() {
        setError(null);

        try {
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
                setError(error.message);
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
                placeholder="e.g. AI in local journalism"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
            />

            <button
                onClick={runAgent}
                disabled={status === "running"}
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
            >
                {status === "running" ? "Generating..." : "Generate Article"}
            </button>
            {error && <div className="text-red-500 mt-4">❌ {error}</div>}
            <div>📌 Status: {status}</div>
        </main>
    );
}
