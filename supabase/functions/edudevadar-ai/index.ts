import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY missing');
      return new Response(
        JSON.stringify({ error: 'AI is not configured. Missing LOVABLE_API_KEY.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { messages, prompt, generateImage } = body;

    const chatMessages = Array.isArray(messages) && messages.length
      ? messages.map((m: any) => ({ role: m.role, content: m.content }))
      : [{ role: 'user', content: String(prompt || 'Hello!') }];

    const lastMessage = String(chatMessages[chatMessages.length - 1]?.content || '');
    const imageKeywords = ['generate image', 'create image', 'draw', 'visualize', 'picture of', 'image of', 'diagram of'];
    const needsImage = generateImage === true || imageKeywords.some(k => lastMessage.toLowerCase().includes(k));

    if (needsImage) {
      const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image-preview',
          messages: [{ role: 'user', content: lastMessage }],
          modalities: ['image', 'text'],
        }),
      });

      if (!resp.ok) {
        const t = await resp.text();
        console.error('Image gen error', resp.status, t);
        if (resp.status === 429) return new Response(JSON.stringify({ error: 'Rate limit reached. Please wait a moment.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        if (resp.status === 402) return new Response(JSON.stringify({ error: 'AI credits exhausted. Add credits in Settings → Workspace → Usage.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        return new Response(JSON.stringify({ error: 'Image generation failed.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const data = await resp.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      const text = data.choices?.[0]?.message?.content || 'Here is your image.';
      return new Response(JSON.stringify({
        generatedText: text,
        image: imageUrl ? { success: true, imageUrl, description: 'Generated image' } : undefined,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are BTC AI, a helpful study assistant for a tuition app. Provide clear, detailed, well-structured answers with examples. Be friendly and encouraging.' },
          ...chatMessages,
        ],
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error('AI error', resp.status, t);
      if (resp.status === 429) return new Response(JSON.stringify({ error: 'Rate limit reached. Please wait a moment.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      if (resp.status === 402) return new Response(JSON.stringify({ error: 'AI credits exhausted. Add credits in Settings → Workspace → Usage.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      return new Response(JSON.stringify({ error: 'AI request failed.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const data = await resp.json();
    const text = data.choices?.[0]?.message?.content || '';
    return new Response(JSON.stringify({ generatedText: text }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('btc-ai exception', err);
    return new Response(JSON.stringify({ error: (err as Error).message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
