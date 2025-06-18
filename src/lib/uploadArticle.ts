import { v4 as uuidv4 } from "uuid";
import { retryFetch, formatDate, makeUrlName } from "./MetroPublisherUtility";

export default async function uploadArticle(
    title: string,
    content: string,
    status: "publish" | "draft" = "publish",
    imageAssetId: string | null = null
) {
    console.log("Received Article:", { title, content, status });
    try {
        const contentId = uuidv4() as string;
        const urlname = makeUrlName(title, true);
        const now = new Date();
        const nowFormatted = formatDate(now);
        console.log("Formatted date:", nowFormatted);

        // let htmlcontent = `<p>${content}</p>`;
        let htmlcontent = content;
        htmlcontent = htmlcontent.replace(/(&)/gim, "and");

        // replace h1 with h4 tags
        htmlcontent = htmlcontent
            .replace(/(<h1>)/gim, "<h4>")
            .replace(/<\/h1>/gim, "</h4>");
        // replace h2 with h5 tags
        htmlcontent = htmlcontent
            .replace(/(<h2>)/gim, "<h5>")
            .replace(/<\/h2>/gim, "</h5>");
        // replace h3 with h6 tags
        htmlcontent = htmlcontent
            .replace(/(<h3>)/gim, "<h6>")
            .replace(/<\/h3>/gim, "</h6>");

        type dataType = {
            urlname: string;
            content_type: string;
            created: string;
            issued: string;
            title: string;
            description: string;
            state: string;
            content: string;
            teaser_image_uuid: string | null;
            header_image_uuid: string | null;
        };
        const data = {
            urlname,
            content_type: "article",
            created: nowFormatted,
            issued: nowFormatted,
            title: title,
            description: title,
            state: "published",
            content: htmlcontent,
        } as dataType;

        if (imageAssetId) {
            data.teaser_image_uuid = imageAssetId;
            data.header_image_uuid = imageAssetId;
        }

        const response = await retryFetch(
            `/content/${contentId}`,
            "application/json",
            "PUT",
            JSON.stringify(data)
        );
        console.log("Response from Metropublisher:", response);
        return contentId;
    } catch (error) {
        console.error("Error uploading article:", error);
    }
}
