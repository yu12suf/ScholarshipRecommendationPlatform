import { GoogleGenerativeAI } from "@google/generative-ai";
import configs from "../config/configs.js";

async function listModels() {
  try {
    if (!configs.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set in environment variables.");
      return;
    }

    const genAI = new GoogleGenerativeAI(configs.GEMINI_API_KEY);
    // Access the model manager through the cached instance or generic way if distinct
    // The SDK might not expose listModels directly on the instance easily depending on version,
    // but typically it's on the client or via a specific manager.
    // Actually, in @google/generative-ai, it is often via:
    // const genAI = new GoogleGenerativeAI(API_KEY);
    // But listing models might require a direct fetch if not exposed,
    // OR checking documentation.
    // Let's try to assume the user might have rights.
    // Actually, listing models is usually a separate API call.
    // Let's try to use the raw fetch if needed, but let's try to infer from common known issues first.

    console.log("Checking available models...");
    // Since listModels isn't always straightforward in the typed SDK without looking up the exact method signature for 0.21.0+,
    // I will write a simple fetch script using the API key directly to the REST API.

    const apiKey = configs.GEMINI_API_KEY;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
    );

    if (!response.ok) {
      console.error(
        `Failed to list models: ${response.status} ${response.statusText}`,
      );
      const text = await response.text();
      console.error(text);
      return;
    }

    const data = await response.json();
    console.log("Available Models:");
    if (data.models) {
      data.models.forEach((m: any) => {
        console.log(`- ${m.name} (${m.supportedGenerationMethods.join(", ")})`);
      });
    } else {
      console.log("No models found or different structure", data);
    }
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
