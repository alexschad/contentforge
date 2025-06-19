const fs = require("fs");
const path = require("path");
const axios = require("axios");

// const imagePath =
//     "/Volumes/Extreme SSD/git/contentforge/src/generatedImages/article-image.jpg";
// const fileData = fs.readFileSync(imagePath, "base64");
// const binaryImage = atob(fileData);
// const buf = Buffer.from(binaryImage, "binary");
// console.log(buf);

function getFileExtensionFromUrl(url) {
    const pathname = new URL(url).pathname; // Extract the path part
    const filename = pathname.split("/").pop(); // Get the last part after the last "/"
    const match = filename.match(/\.(\w+)(?:\?|$)/); // Match file extension
    return match ? match[1].toLowerCase() : null;
}

async function downloadImage() {
    const url =
        "https://oaidalleapiprodscus.blob.core.windows.net/private/org-YWpM37l9SBHIayedjdDN9nBO/user-Ht06b5LjG4a82DQZhgIZxwjq/img-GasUBCeWdpqYlDxbbHan5aQK.png?st=2025-06-19T14%3A23%3A03Z&se=2025-06-19T16%3A23%3A03Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=cc612491-d948-4d2e-9821-2683df3719f5&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-06-18T19%3A57%3A16Z&ske=2025-06-19T19%3A57%3A16Z&sks=b&skv=2024-08-04&sig=1fCKghLKnMMUQQ80/UxPl1n4gOa0py9c0p1v2f1BHxY%3D";

    const extension = getFileExtensionFromUrl(url);
    const tempDir = path.resolve("./tmp");
    const filename = `article-image.${extension}`;
    const imagePath = path.join(tempDir, filename);
    const writer = fs.createWriteStream(imagePath);

    const response = await axios.get(url, { responseType: "stream" });
    response.data.pipe(writer);
    writer.on("finish", () => {
        console.log("Image downloaded successfully:", imagePath);
    });
}

downloadImage();
