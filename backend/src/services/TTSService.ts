import * as googleTTS from 'google-tts-api';

export class TTSService {
    /**
     * Converts a long text string into a single Base64 encoded MP3 audio string.
     * Uses `google-tts-api` to chunk the text and concatenate the resulting audio buffers.
     * 
     * @param text The text to convert to speech
     * @returns A Promise that resolves to the Base64 audio string
     */
    static async generateAudioBase64(text: string): Promise<string | null> {
        try {
            // Regex to find speaker names (e.g., "Interviewer:", "Expert A:")
            const dialoguePattern = /([A-Za-z0-9 ]+):/g;
            const matches = Array.from(text.matchAll(dialoguePattern));
            
            if (matches.length >= 2) {
                // Determine unique speakers to assign different accents
                const uniqueSpeakers = Array.from(new Set(matches.map(m => m[1]!.trim())));
                console.log(`[TTSService] Detected conversation with ${uniqueSpeakers.length} participants.`);

                // Map each speaker to the same generic English voice, as regional codes are not supported
                const accents = ['en', 'en']; // Keep it simple to avoid errors
                const speakerAccents: Record<string, string> = {};
                uniqueSpeakers.forEach((name, i) => {
                    speakerAccents[name] = 'en'; // Force 'en' for all
                });

                // Split text by speaker turns
                const parts = text.split(dialoguePattern);
                // The split result: ["", "Speaker1", "Content1", "Speaker2", "Content2", ...]
                const allBuffers: Buffer[] = [];

                for (let i = 1; i < parts.length; i += 2) {
                    const speakerName = parts[i]?.trim();
                    const utterance = parts[i+1]?.trim() || "";
                    if (!speakerName || !utterance) continue;

                    // We include the speaker name in the utterance to help the listener distinguish speakers
                    const voicedUtterance = `${speakerName}: ${utterance}`;

                    try {
                        const chunks = await googleTTS.getAllAudioBase64(voicedUtterance, {
                            lang: 'en',
                            slow: false,
                            host: 'https://translate.google.com',
                            splitPunct: ',.?',
                        });

                        if (chunks && chunks.length > 0) {
                            chunks.forEach(c => allBuffers.push(Buffer.from(c.base64, 'base64')));
                        }
                    } catch (turnError) {
                        console.error(`[TTSService] Failed turn for ${speakerName}:`, turnError);
                    }
                }

                if (allBuffers.length === 0) return null;
                return Buffer.concat(allBuffers).toString('base64');
            }

            // Fallback for monologues or single-speaker text
            const results = await googleTTS.getAllAudioBase64(text, {
                lang: 'en',
                slow: false,
                host: 'https://translate.google.com',
                splitPunct: ',.?',
            });

            if (!results || results.length === 0) return null;
            const buffers = results.map(result => Buffer.from(result.base64, 'base64'));
            return Buffer.concat(buffers).toString('base64');
        } catch (error) {
            console.error("[TTSService] Error generating dialogue audio:", error);
            return null;
        }
    }
}
