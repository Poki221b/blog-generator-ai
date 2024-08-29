const express = require('express');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const { Model, Recognizer } = require('vosk');

const router = express.Router();

// Učitajte Vosk model
const modelPath = 'C:/vosk-model/vosk-model-small-en-us-0.15';  // Putanja do preuzetog Vosk modela
const model = new Model(modelPath);

router.post('/generate-blog', async (req, res) => {
    const youtubeUrl = req.body.url;

    try {
        // Preuzimanje audio zapisa direktno iz YouTube videa
        const audioStream = ytdl(youtubeUrl, { filter: 'audioonly' });
        const audioFilePath = 'audio.wav';

        // Konverzija i snimanje audio fajla
        ffmpeg(audioStream)
            .audioCodec('pcm_s16le')
            .format('wav')
            .audioChannels(1)
            .audioFrequency(16000)
            .save(audioFilePath)
            .on('end', async () => {
                // Transkripcija pomoću Vosk
                const wfStream = fs.createReadStream(audioFilePath);
                const rec = new Recognizer({ model: model, sampleRate: 16000 });
                let transcript = '';

                wfStream.on('data', (chunk) => {
                    const result = rec.acceptWaveform(chunk);
                    if (result) {
                        transcript += rec.result().text + ' ';
                    }
                });

                wfStream.on('end', () => {
                    transcript += rec.finalResult().text;
                    rec.free();
                    fs.unlinkSync(audioFilePath);
                    res.json({ transcript: transcript });
                });
            })
            .on('error', (err) => {
                console.error('Error during audio processing:', err);
                res.status(500).json({ error: 'Failed to process video.' });
            });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to download video.' });
    }
});

module.exports = router;
