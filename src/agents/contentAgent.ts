import generateArticle from "@/lib/generateArticle";
import generateTags from "@/lib/generateTags";
import { generateImage, downloadImage } from "@/lib/generateImage";
import uploadImage from "@/lib/uploadImage";
import uploadArticle from "@/lib/uploadArticle";
import tagArticle from "@/lib/tagArticle";
import jobs from "@/lib/jobStore";

export async function runContentAgent(jobId: string, prompt: string) {
    jobs[jobId] = { id: jobId, status: "queued", createdAt: new Date() };

    // Step 1: Generate article content
    console.log("Generating article for prompt:", prompt);
    jobs[jobId].status = "generating_article";
    const article = await generateArticle(prompt);
    console.log(article);
    if (article) {
        // Step 2: Generate tags
        // console.log("Generating tags for article content:", article.content);
        jobs[jobId].status = "generating_tags";
        const tags = await generateTags(article.content);

        // // Step 3: Generate image
        jobs[jobId].status = "generating_image";
        const imageUrl = await generateImage(article.title, article.content);
        console.log("Generated image URL:", imageUrl);

        // // Step 4: Download and upload image
        jobs[jobId].status = "downloading_image";
        const imagePath = await downloadImage(imageUrl);
        console.log("Image downloaded to:", imagePath);

        jobs[jobId].status = "uploading_image";
        const imageAssetUUID = await uploadImage(imagePath);
        console.log("Image uploaded with ID:", imageAssetUUID, imagePath);

        // Step 5: Publish article
        jobs[jobId].status = "uploading_article";
        const contentId = await uploadArticle(
            article.title,
            article.content,
            article.status || "publish",
            imageAssetUUID
        );

        // Step 6: Add tags to article
        // Assuming you have a function to add tags to an article
        if (contentId && tags && tags.length > 0) {
            jobs[jobId].status = "uploading_tags";
            await tagArticle(contentId, tags);
        }
        jobs[jobId].status = "completed";

    //     // console.log("Tags added:", tags);
    //     // console.log("Image added:", imageAssetUUID);
    //     // console.log("Article published:");
    // }
}
