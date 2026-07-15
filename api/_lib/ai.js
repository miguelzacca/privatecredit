import axios from "axios";

async function callLlama(systemPrompt, userPrompt) {
  const NVIDIA_KEY = process.env.NVIDIA_API_KEY || process.env.API_KEY;
  if (!NVIDIA_KEY) throw new Error('NVIDIA_API_KEY or API_KEY not configured.');

  try {
    const response = await axios.post('https://integrate.api.nvidia.com/v1/chat/completions', {
      model: 'meta/llama-3.1-8b-instruct',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      top_p: 0.9,
      max_tokens: 1024,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NVIDIA_KEY}`,
      }
    });

    if (response.status >= 400) {
      throw new Error('Error from NVIDIA API');
    }

    let msg = response.data?.choices?.[0]?.message?.content || '';
    msg = msg.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    return msg;
  } catch (err) {
    console.error('[ai]', err.message);
    throw err;
  }
}

export { callLlama };
