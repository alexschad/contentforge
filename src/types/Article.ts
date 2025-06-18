export interface ArticleType {
    title: string;
    content: string;
    status?: "publish" | "draft";
}
