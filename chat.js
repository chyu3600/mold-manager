export default async function handler(req, res) {
if (req.method !== 'POST') {
return res.status(405).json({ error: 'Method Not Allowed' });
}

const apiKey = process.env.AI_GATEWAY_API_KEY;
if (!apiKey) {
return res.status(500).json({ error: 'API Key未設定' });
}

const { message } = req.body;

try {
const response = await fetch('https://ai-gateway.vercel.app/v1/chat/completions', {
method: 'POST',
headers: {
'Authorization': `Bearer ${apiKey}`,
'Content-Type': 'application/json',
},
body: JSON.stringify({
model: 'gpt-4o-mini',
messages: [{ role: 'user', content: message }],
}),
});

const data = await response.json();
res.status(200).json({ reply: data.choices[0].message.content });
} catch (err)
res.status(500).json({ error: err.message });
}
}
