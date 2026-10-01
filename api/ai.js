const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    let macroContext = "";
    try {
      macroContext = fs.readFileSync(path.join(process.cwd(), 'data_makro.md'), 'utf-8');
    } catch (e) {
      console.log("Could not load macro data:", e);
    }

    const systemPrompt = `Anda adalah analis investasi kripto kuantitatif dan makro-ekonomi jenius. Analisis Anda sangat tajam. Jawab dalam bahasa Indonesia. Gunakan tag HTML seperti <br>, <b>, atau <ul> untuk merapikan jawaban.

[PEDOMAN MAKRO & PROYEKSI INVESTASI (Jadikan acuan arah pasar)]:
${macroContext}
`;

    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer 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`
      },
      body: JSON.stringify({
        model: "nvidia/nemotron-3-super-120b-a12b",
        messages: [
          {"role": "system", "content": systemPrompt},
          {"role": "user", "content": prompt}
        ],
        temperature: 0.5,
        max_tokens: 1024
      })
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
