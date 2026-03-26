import { GoogleGenerativeAI } from "@google/generative-ai";
import configs from "./config/configs.js";
import fs from "fs";

async function testAudioGenNative() {
    try {
        const genAI = new GoogleGenerativeAI(configs.GEMINI_API_KEY as string);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const mp3Base64 = fs.readFileSync("../test.mp3").toString("base64");
            
        console.log("Testing native model invocation with audio...");
        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType: "audio/mp3",
                    data: mp3Base64
                }
            },
            { text: "Listen to this audio and tell me exactly what it says word for word." }
        ]);

        console.log("Success! Response:", result.response.text());
    } catch (e) {
        console.error("Error invoking native model with audio:", e);
    }
}

testAudioGenNative();
