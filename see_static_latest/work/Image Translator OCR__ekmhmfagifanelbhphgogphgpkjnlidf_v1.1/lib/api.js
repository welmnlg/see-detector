export class LLMClient {
    constructor(provider, apiKey, modelName, targetLang = 'Vietnamese') {
        this.provider = provider;
        this.apiKey = apiKey;
        this.modelName = modelName;
        this.targetLang = targetLang;
    }

    getTranslateInstruction() {
        const isAuto = !this.targetLang || this.targetLang === 'Auto' || this.targetLang.startsWith('Auto ');
        if (isAuto) {
            return 'Extract all text from this image, detect its language, and translate it to English (or the most appropriate language).';
        }
        return `Extract all text from this image and translate it to ${this.targetLang}.`;
    }

    async translateImage(base64Image) {
        if (this.provider === 'gemini') {
            return this.callGemini(base64Image);
        } else if (this.provider === 'openai') {
            return this.callOpenAI(base64Image);
        } else {
            throw new Error('Unknown provider');
        }
    }

    async callGemini(base64Image) {
        // Remove header if present
        const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|webp);base64,/, '');
        const instruction = this.getTranslateInstruction();

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;

        const payload = {
            contents: [{
                parts: [
                    {
                        text: `${instruction} Format the output as follows:\nOriginal: [Original Text]\nTranslated: [Translated Text]\nIf no text is found, say 'No text found'.`
                    },
                    {
                        inline_data: {
                            mime_type: "image/png",
                            data: cleanBase64
                        }
                    }
                ]
            }]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API Error: ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) throw new Error("No response from Gemini");

        return this.parseResponse(text);
    }

    async callOpenAI(base64Image) {
        const url = 'https://api.openai.com/v1/chat/completions';
        const instruction = this.getTranslateInstruction();

        const payload = {
            model: this.modelName || "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: `${instruction} Format the output as follows:\nOriginal: [Original Text]\nTranslated: [Translated Text]` },
                        { type: "image_url", image_url: { url: base64Image } }
                    ]
                }
            ],
            max_tokens: 600
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenAI API Error: ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;

        if (!text) throw new Error("No response from OpenAI");

        return this.parseResponse(text);
    }

    parseResponse(text) {
        if (!text) return { original: null, translated: null };
        if (text.toLowerCase().includes("no text found")) {
            return { original: null, translated: null };
        }

        const originalMatch = text.match(/Original:\s*([\s\S]*?)(?=Translated:|$)/i);
        const translatedMatch = text.match(/Translated:\s*([\s\S]*?)(?=$)/i);

        if (originalMatch && translatedMatch) {
            return {
                original: originalMatch[1].trim(),
                translated: translatedMatch[1].trim()
            };
        } else {
            // Fallback: If format isn't followed, treat the whole text as translated (or original)
            // It's better to show something than nothing.
            return {
                original: "(Raw output)",
                translated: text
            };
        }
    }
}
