import generateArticle from "@/lib/generateArticle";
import generateTags from "@/lib/generateTags";
import {
    generateImage,
    downloadImage,
    generateImageMetadata,
} from "@/lib/generateImage";
import uploadImage from "@/lib/uploadImage";
import uploadArticle from "@/lib/uploadArticle";
import tagArticle from "@/lib/tagArticle";
import jobs from "@/lib/jobStore";

export async function runContentAgent(jobId: string, prompt: string) {
    jobs[jobId] = { id: jobId, status: "queued", createdAt: new Date() };

    // Generate article content
    console.log("Generating article for prompt:", prompt);
    jobs[jobId].status = "generating_article";
    const article = await generateArticle(prompt);
    console.log(article);
    if (article) {
        // Generate tags
        // console.log("Generating tags for article content:", article.content);
        jobs[jobId].status = "generating_tags";
        const tags = await generateTags(article.content);

        // Generate image
        jobs[jobId].status = "generating_image";
        const imageUrl = await generateImage(article.title, article.content);
        console.log("Generated image URL:", imageUrl);

        // Generate image metadata
        jobs[jobId].status = "generating_image_metadata";
        const imageMetaData = await generateImageMetadata(
            article.title,
            article.content
        );
        console.log("Generated image metadata:", imageMetaData);

        // Download and upload image
        jobs[jobId].status = "downloading_image";
        const imagePath = await downloadImage(imageUrl, imageMetaData.filename);
        console.log("Image downloaded to:", imagePath);

        jobs[jobId].status = "uploading_image";
        const imageAssetUUID = await uploadImage(
            imagePath,
            imageMetaData.title,
            imageMetaData.description
        );
        console.log("Image uploaded with ID:", imageAssetUUID, imagePath);

        // Publish article
        jobs[jobId].status = "uploading_article";
        const contentId = await uploadArticle(article, imageAssetUUID);

        // Add tags to article
        // Assuming you have a function to add tags to an article
        if (contentId && tags && tags.length > 0) {
            jobs[jobId].status = "uploading_tags";
            await tagArticle(contentId, tags);
        }
        jobs[jobId].status = "completed";
    }
    jobs[jobId].status = "completed";
}
