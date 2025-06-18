import { v4 as uuidv4 } from "uuid";
import { retryFetch, makeUrlName } from "./MetroPublisherUtility";

export const addTag = async (title: string) => {
    const urlname = makeUrlName(title);
    const tagId = uuidv4() as string;

    const data = {
        type: "default",
        last_name_or_title: title,
        urlname,
        state: "approved",
    };
    console.log("ADD TAG", tagId, data);
    // Add the tag
    await retryFetch(
        `/tags/${tagId}`,
        "application/json",
        "PUT",
        JSON.stringify(data)
    );
    return tagId;
};

export default async function tagArticle(
    contentId: string,
    tags: string[],
    predicate: string = "describes"
) {
    tags.forEach(async (tag) => {
        try {
            const tagId = await addTag(tag);
            const data = {};
            await retryFetch(
                `/tags/${tagId}/${predicate}/${contentId}`,
                "application/json",
                "PUT",
                JSON.stringify(data)
            );
        } catch (error) {
            console.error(`Error tagging article with tag "${tag}":`, error);
        }
    });
}
