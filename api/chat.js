// 伺服器端代理：前端不接觸 API 金鑰
// 金鑰存放於 Vercel 環境變數 AI_GATEWAY_API_KEY
module.exports = async function handler(req, res) {
  // 只允許 POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: '只接受 POST 請求' });
    return;
  }

  const key = process.env.AI_GATEWAY_API_KEY;
  if (!key) {
    res.status(500).json({ error: '伺服器尚未設定 AI_GATEWAY_API_KEY 環境變數' });
    return;
  }

  try {
    // 解析前端傳來的訊息（相容 訊息 / messages 兩種寫法）
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    body = body || {};

    let messages = body.messages;
    if (!messages) {
      const content = body.訊息 !== undefined ? body.訊息 : body.message;
      messages = [{ role: 'user', content: content || '' }];
    }

    const upstream = await fetch('https://ai-gateway.vercel.app/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + key,
      },
      body: JSON.stringify({
        model: body.model || 'gpt-4o-mini',
        messages: messages,
      }),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      res.status(upstream.status).json({
        error: 'AI Gateway 回應錯誤',
        detail: data,
      });
      return;
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: '代理發生錯誤：' + String(err) });
  }
};
