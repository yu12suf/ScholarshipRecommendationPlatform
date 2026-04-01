import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import configs from "./config/configs.js";
import fs from "fs";

async function testAudioGen() {
    try {
        const model = new ChatGoogleGenerativeAI({
            model: "gemini-2.5-flash",
            apiKey: configs.GEMINI_API_KEY as string,
        });

        // Let's create a tiny dummy 1-byte base64 pretending to be audio/webm just to see if the interface accepts it or throws a validation error.
        // Even better, let's use the tiny mp3 we generated from TTSService
        const mp3Base64 = fs.existsSync("../test.mp3") 
            ? fs.readFileSync("../test.mp3").toString("base64") 
            : Buffer.from("dummy").toString("base64");
            
        console.log("Testing model invocation with audio media...");
        const response = await model.invoke([
            new HumanMessage({
                content: [
                    { type: "text", text: "Is this audio clear? Just reply yes or no." },
                    { 
                        type: "media", 
                        mimeType: "audio/mp3", 
                        data: mp3Base64 
                    }
                ]
            })
        ]);

        console.log("Success! Response:", response.content);
    } catch (e) {
        console.error("Error invoking model with audio:", e);
    }
}

testAudioGen();
