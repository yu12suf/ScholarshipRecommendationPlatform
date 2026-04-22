import axios from "axios";

async function testVapi() {
    const vapiApi = axios.create({
        baseURL: "https://api.vapi.ai",
        headers: {
            Authorization: `Bearer 99dd8420-f1fc-4630-a433-df6dd68ab9ea`,
            "Content-Type": "application/json",
        },
    });

    const payload = {
        name: `Test Assistant`,
        model: {
            provider: "openai",
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a test assistant."
                }
            ]
        },
        voice: {
            provider: "openai",
            voiceId: "alloy"
        },
        firstMessage: "Hello",
    };

    try {
        const res = await vapiApi.post("/assistant", payload);
        console.log("Success:", res.data);
    } catch (err: any) {
        console.error("Error:", err.response?.data || err.message);
    }
}

testVapi();
