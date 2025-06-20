import { v4 as uuidv4 } from "uuid";
import { retryFetch, formatDate, makeUrlName } from "./MetroPublisherUtility";

export default async function uploadArticle(
    article: {
        title: string;
        sub_title: string;
        kicker: string;
        description: string;
        meta_title: string;
        meta_description: string;
        content: string;
        status?: "draft" | "published";
    },
    imageAssetId: string | null = null
): Promise<[string, string]> {
    console.log("Received Article:", article);
    const {
        title,
        sub_title,
        kicker,
        description,
        meta_title,
        meta_description,
        content,
        status = "published",
    } = article;

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
            sub_title: string;
            kicker: string;
            meta_title: string;
            meta_description: string;
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
            sub_title: sub_title,
            description: description,
            meta_title: meta_title,
            meta_description: meta_description,
            kicker: kicker,
            state: status,
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
        return [contentId, urlname];
    } catch (error) {
        console.error("Error uploading article:", error);
        return ["", ""];
    }
}
