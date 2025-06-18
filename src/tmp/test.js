const fs = require("fs");

const imagePath =
    "/Volumes/Extreme SSD/git/contentforge/src/generatedImages/article-image.jpg";
const fileData = fs.readFileSync(imagePath, "base64");
const binaryImage = atob(fileData);
const buf = Buffer.from(binaryImage, "binary");
console.log(buf);
