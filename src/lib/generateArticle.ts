import OpenAI from "openai";
import { decode } from "he";
import { ArticleType } from "@/types/Article";

export async function generateArticle2(prompt: string) {
    // For testing purposes, we will return a static article
    console.log("Generating article for prompt:", prompt);
    const article = {
        title: "Top 10 Burger Havens in Berlin You Simply Can't Miss",
        content:
            "<h1>Top 10 Burger Havens in Berlin You Simply Can't Miss</h1>" +
            "<p>Berlin, a city known for its rich history, vibrant culture, and diverse culinary scene, also boasts some of the best burger joints in Europe. A melting pot of flavors and influences, the German capital offers a tantalizing array of options for burger enthusiasts. From classic American-style burgers to innovative creations with a German twist, here's a roundup of the 10 best places in Berlin to satisfy your burger cravings.</p>" +
            "<h2>1. Burgermeister Schlesisches Tor</h2>" +
            "<p>Originally a public toilet, this iconic burger spot transformed into a Berlin burger legend. Located beneath the U-Bahn tracks, Burgermeister offers up juicy burgers with a side of edgy atmosphere.</p>" +
            "<h2>2. The Bird</h2>" +
            "<p>This New York-style steakhouse known for its no-nonsense, high-quality beef, serves up some of the most succulent burgers in town. Their hefty patties on an English muffin bread make for a unique burger experience.</p>" +
            "<h2>3. BBI - Berlin Burger International</h2>" +
            "<p>A neighborhood gem in Neukölln, BBI delights with its creative toppings and perfectly charred patties. Vegetarian options here are just as delicious and satisfying as their meaty counterparts.</p>" +
            "<h2>4. Shiso Burger</h2>" +
            "<p>Shiso Burger brings an Asian flair to the Berlin burger scene, offering mouthwatering combinations like the bulgogi burger with kimchi. The fusion of flavors here is bold and exciting.</p>" +
            "<h2>5. Kumpel & Keule Speisewirtschaft</h2>" +
            "<p>Committed to serving only the freshest, locally sourced meat, this spot in Kreuzberg is a butcher shop turned diner. The burgers are simple yet refined, showcasing the quality of the ingredients.</p>" +
            "<h2>6. Beef Grill Club by Hasir</h2>" +
            "<p>For a more upscale burger experience, head to Beef Grill Club. Their gourmet burgers, grilled to perfection, and the elegant setting make for a delightful indulgence.</p>" +
            "<h2>7. Tommi's Burger Joint</h2>" +
            "<p>Brought to Berlin by way of Iceland, Tommi's keeps things classic and straightforward with American-style burgers that focus on the essentials — good meat and good buns.</p>" +
            "<h2>8. Piri's Chicken Burgers</h2>" +
            "<p>If you're looking for something different, Piri's specializes in spicy chicken burgers. The fiery flavors and juicy chicken make for an exceptional burger adventure.</p>" +
            "<h2>9. Burgeramt</h2>" +
            "<p>This funky spot in Friedrichshain is a feast for the eyes as well as the palate. Unique artwork lines the walls while you dig into creative burger concoctions with names as quirky as their ingredients.</p>" +
            "<h2>10. Windburger</h2>" +
            "<p>Known for its quick service and delectable burgers, Windburger is an excellent choice for anyone wanting a tasty bite on the go. Their selection includes both classic options and innovative burgers with a twist.</p>" +
            "<p>No matter which burger destination you choose from this list, you're guaranteed a satisfying meal that's bursting with flavor. Berlin's burger scene is as diverse and dynamic as the city itself — so go ahead, take a hearty bite out of the capital's burger offerings!</p>",
        status: "publish",
    };
    return article as ArticleType;
}

export async function generateArticle(prompt: string) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const functions: OpenAI.Chat.Completions.ChatCompletionTool[] = [
        {
            type: "function",
            function: {
                name: "create_article",
                description:
                    "Publishes a new article to Metropublisher with a title and content.",
                parameters: {
                    type: "object",
                    properties: {
                        title: {
                            type: "string",
                            description: "The title of the article",
                        },
                        content: {
                            type: "string",
                            description: "body of the article",
                        },
                        status: {
                            type: "string",
                            enum: ["draft", "publish"],
                            description: "Whether to publish or save as draft",
                            default: "publish",
                        },
                    },
                    required: ["title", "content"],
                },
            },
        },
    ];

    const systemPrompt = `
    You are a professional editorial assistant.

    Your task is:
    1. Read the user’s request for an article.
    2. Generate a structured article with a title and body (minimum 300 words).
    3. The body should be formatted in HTML, using <p> tags for paragraphs, <h1> for the main title, and <h2> for subheadings.
    Don't use <br> tags, but use <p> tags to separate paragraphs. Don't use any other tags tahn <p>, <h1>, <h2>, <ul>, <ol> and <li>.
    4. Repond in the language of the user’s request.
    6. The article should be informative, engaging, and well-researched.
    7. The article should be relevant to the topic provided by the user.
    8. ALWAYS call the function \`create_article\` with the generated content. Do not return the article directly in chat.
    9. HTML encode any special characters.

    Do not explain your actions. Only respond with a tool call.
    `;

    const chat = await openai.chat.completions.create({
        model: "gpt-4-1106-preview",
        messages: [
            {
                role: "system",
                content: systemPrompt,
            },
            { role: "user", content: prompt },
        ],
        tools: functions,
        tool_choice: "auto",
    });
    console.log("Chat response:", chat);
    const toolCalls = chat.choices[0].message.tool_calls;
    if (!toolCalls || toolCalls.length === 0) {
        console.error("No tool call detected.");
        return;
    }

    const call = toolCalls[0];
    const article = JSON.parse(call.function.arguments || "{}");
    article.content = decode(article.content);
    console.log("Calling create_article with:", article);
    return article;
}

export default generateArticle;
