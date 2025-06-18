import fs from "fs";
import path from "path";
import axios from "axios";
import { OpenAI } from "openai";

function buildImagePrompt(title: string, content: string): string {
    const topic = content.slice(0, 300).replace(/\s+/g, " ").trim(); // brief context
    return `An editorial-style illustration for an article titled: "${title}". It should depict the central theme of the article: ${topic}. Style: realistic, professional, high-quality composition, suitable for a magazine or news website.`;
}

export async function generateImage(title: string, content: string) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = buildImagePrompt(title, content);
    console.log("Generating image with prompt:", prompt);
    const response = await openai.images.generate({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
    });

    if (!response.data || response.data.length === 0) {
        throw new Error("Image generation failed, no URL returned.");
    }
    return response.data[0].url || "";
}

export async function downloadImage(
    url: string,
    filename = "article-image.jpg"
): Promise<string> {
    // const imagePath = path.resolve(
    //     `${__dirname}/../generatedImages/`,
    //     filename
    // );
    const tempDir = path.resolve("./src/tmp");
    const imagePath = path.join(tempDir, filename);
    const writer = fs.createWriteStream(imagePath);
    const response = await axios.get(url, { responseType: "stream" });

    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on("finish", () => resolve(imagePath));
        writer.on("error", reject);
    });
}
