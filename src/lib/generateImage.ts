import fs from "fs";
import path from "path";
import axios from "axios";
import { OpenAI } from "openai";
import slugify from "slugify";

function mapImageStyleToPrompt(style: string): string {
    switch (style.toLowerCase()) {
        case "illustration":
            return "editorial illustration, clean lines, vibrant colors, high detail, suitable for print";
        case "photo realistic":
            return "high-quality, photo-realistic, cinematic lighting, natural textures, realistic human figures, suitable for magazine publication";
        case "painting":
            return "digital painting, rich brushwork, artistic lighting, high contrast, expressive style, suitable for editorial artwork";
        case "3d render":
            return "high-detail 3D render, dramatic lighting, studio quality, sharp depth of field, magazine-style composition";
        default:
            return "professional, high-quality editorial style image suitable for publication"; // fallback
    }
}

function stripHtmlTags(text: string): string {
    return text.replace(/<[^>]*>/g, "");
}

function buildImagePrompt(
    title: string,
    content: string,
    imageStyle: string
): string {
    const strippedContent = stripHtmlTags(content);
    const topic = strippedContent.slice(0, 300).replace(/\s+/g, " ").trim(); // brief context
    const styleDescription = mapImageStyleToPrompt(imageStyle);
    return `Create an editorial-style image for an article titled: "${title}". It should depict the central theme of the article: ${topic}. Style: ${styleDescription}. The image should be high-quality, professional, and suitable for a magazine or news website.`;
}

export async function generateImageMetadata(title: string, content: string) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    const systemPrompt = `
You are a professional content assistant helping generate SEO-optimized image metadata for editorial content.

Given a title and content, return:
- a concise image title
- a one-sentence image description (alt text)
- a clean, SEO-friendly filename (without extension, lowercase, hyphenated)

Respond in this JSON format:
{
  "title": "...",
  "description": "...",
  "filename": "..."
}
`;

    const userPrompt = `Title: ${title}\nContent: ${content.slice(0, 500)}`;

    const chatResponse = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
    });

    const text = chatResponse.choices[0].message.content;
    try {
        return JSON.parse(text!);
    } catch (err) {
        console.warn("Failed to parse metadata:", text);
        console.warn("Error:", err);
        // Fallback: use a slugified title
        return {
            title,
            description: `Illustration for article titled "${title}"`,
            filename: slugify(title, { lower: true, strict: true }),
        };
    }
}

export async function generateImage(
    title: string,
    content: string,
    imageStyle: string = "illustration"
): Promise<string> {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = buildImagePrompt(title, content, imageStyle);
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

function getFileExtensionFromUrl(url: string): string | null {
    const pathname = new URL(url).pathname; // Extract the path part
    const filename = pathname.split("/").pop(); // Get the last part after the last "/"
    if (!filename) return null; // No filename found
    const match = filename.match(/\.(\w+)(?:\?|$)/); // Match file extension
    return match ? match[1].toLowerCase() : null;
}

export async function downloadImage(
    url: string,
    filename = "article-image"
): Promise<string> {
    // const imagePath = path.resolve(
    //     `${__dirname}/../generatedImages/`,
    //     filename
    // );
    const extension = getFileExtensionFromUrl(url);
    const tempDir = path.resolve("./tmp");
    const imagePath = path.join(tempDir, `${filename}.${extension || "jpg"}`);
    const writer = fs.createWriteStream(imagePath);
    const response = await axios.get(url, { responseType: "stream" });

    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on("finish", () => resolve(imagePath));
        writer.on("error", reject);
    });
}
