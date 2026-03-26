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
            // googleTTS.getAllAudioBase64 automatically splits long text by punctuation
            const results = await googleTTS.getAllAudioBase64(text, {
                lang: 'en',
                slow: false,
                host: 'https://translate.google.com',
                splitPunct: ',.?',
            });

            if (!results || results.length === 0) {
                return null;
            }

            // Convert Base64 chunks into Node.js Buffers
            const buffers = results.map(result => Buffer.from(result.base64, 'base64'));
            
            // Concatenate all audio buffers into one single MP3 buffer
            const finalBuffer = Buffer.concat(buffers);
            
            // Return as a single Base64 string so frontend can easily decode and play
            return finalBuffer.toString('base64');
        } catch (error) {
            console.error("Error generating TTS audio:", error);
            return null; // Fallback to text if TTS generation fails
        }
    }
}
