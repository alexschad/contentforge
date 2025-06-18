const { OpenAI } = require("openai");

async function generateTags2(articleText: string) {
    // For testing purposes, we will return a static list of tags
    const tags = [
        "berlin",
        "burger joints",
        "top 10 burgers",
        "burgermeister",
        "burgeramt",
        "windburger",
    ];
    return tags;
}

async function generateTags(articleText: string) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = `
Generate 1 to 5 concise, relevant tags for the article below.
Return tags as a comma-separated list.

Article:
"""
${articleText}
"""`;

    const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
    });

    const rawTags = completion.choices[0].message.content;
    return rawTags.split(",").map((t: string) => t.trim().toLowerCase());
}

export default generateTags;
