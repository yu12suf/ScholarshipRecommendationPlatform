import * as googleTTS from 'google-tts-api';
import fs from 'fs';

async function test() {
    console.log("Starting TTS generation...");
    try {
        const text = "Hello everyone! Welcome to the IELTS listening test. This consists of multiple parts. We will begin with part one. Please listen carefully as the recording will be played only once.";
        const results = await googleTTS.getAllAudioBase64(text, {
            lang: 'en',
            slow: false,
            host: 'https://translate.google.com',
            splitPunct: ',.?',
        });
        console.log(`Received ${results.length} chunks.`);
        
        const buffers = results.map(r => Buffer.from(r.base64, 'base64'));
        const finalBuffer = Buffer.concat(buffers);
        
        fs.writeFileSync('test.mp3', finalBuffer);
        const base64Str = finalBuffer.toString('base64');
        console.log(`Success! Base64 length: ${base64Str.length}`);
    } catch (e) {
        console.error(e);
    }
}

test();
