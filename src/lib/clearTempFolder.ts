// utils/clearTempFolder.ts
import fs from "fs";
import path from "path";

const TEMP_DIR = path.join(process.cwd(), "tmp");
const MAX_FILE_AGE_MS = 1000 * 60 * 60; // 1 hour

export function clearOldTempFiles() {
    fs.readdir(TEMP_DIR, (err, files) => {
        if (err) return console.error("Error reading temp directory:", err);

        const now = Date.now();

        files.forEach((file) => {
            const filePath = path.join(TEMP_DIR, file);

            fs.stat(filePath, (err, stats) => {
                if (err) return console.error("Error getting file stats:", err);

                const fileAge = now - stats.mtimeMs;

                if (fileAge > MAX_FILE_AGE_MS) {
                    fs.unlink(filePath, (err) => {
                        if (err)
                            console.error(
                                "Error deleting file:",
                                filePath,
                                err
                            );
                        else console.log("Deleted temp file:", filePath);
                    });
                }
            });
        });
    });
}
