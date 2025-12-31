/* File: worker.js */
export default {
  async fetch(req, env) {
    // Настройка заголовков CORS, чтобы браузер разрешил запрос
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // Для большей безопасности можно заменить '*' на 'https://comry.net'
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Обработка preflight-запроса (браузер проверяет, можно ли отправлять данные)
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const { name, email, message } = await req.json();

      if (!name || !email || !message) {
        return new Response('Invalid data', { status: 400, headers: corsHeaders });
      }

      // Отправка данных на реальный Discord Webhook
      // env.DISCORD_WEBHOOK берется из переменных окружения (Secrets) в Cloudflare
      const discordResponse = await fetch(env.DISCORD_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: "📩 New Message from Comry.net",
            color: 0xB21752,
            fields: [
              { name: "Name", value: name },
              { name: "Email", value: email },
              { name: "Message", value: message }
            ],
            timestamp: new Date().toISOString()
          }]
        })
      });

      if (!discordResponse.ok) {
        return new Response('Error sending to Discord', { status: 500, headers: corsHeaders });
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );

    } catch (e) {
      return new Response('Server Error', { status: 500, headers: corsHeaders });
    }
  }
};
