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

    const normalizeMessage = (m: any) => {
      const attachments = Array.isArray(m.attachments) ? m.attachments : [];
      const imageParts = attachments
        .filter((a: any) => String(a?.type || '').startsWith('image/') && a?.url)
        .map((a: any) => ({ type: 'image_url', image_url: { url: a.url } }));

      if (imageParts.length) {
        return {
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: [
            { type: 'text', text: String(m.content || 'Analyze this image.') },
            ...imageParts,
          ],
        };
      }

      return { role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content || '') };
    };

    const chatMessages = Array.isArray(messages) && messages.length
      ? messages.map(normalizeMessage)
      : [{ role: 'user', content: String(prompt || 'Hello!') }];

    const lastContent = chatMessages[chatMessages.length - 1]?.content;
    const lastMessage = Array.isArray(lastContent)
      ? String(lastContent.find((part: any) => part.type === 'text')?.text || '')
      : String(lastContent || '');
    const imageKeywords = ['generate image', 'create image', 'draw', 'visualize', 'picture of', 'image of', 'diagram of', 'make an image'];
    const needsImage = generateImage === true || imageKeywords.some(k => lastMessage.toLowerCase().includes(k));
    const searchKeywords = ['search web', 'search the web', 'look up', 'latest', 'current', 'today', 'news', 'web search'];
    const needsSearch = searchKeywords.some(k => lastMessage.toLowerCase().includes(k));

    if (needsImage) {
      const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image',
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

    let webContext = '';
    if (needsSearch) {
      const searchResp = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(lastMessage)}&format=json&no_html=1&skip_disambig=1`);
      const searchData = await searchResp.json().catch(() => ({}));
      const topics = Array.isArray(searchData.RelatedTopics)
        ? searchData.RelatedTopics.flatMap((item: any) => item.Topics || [item]).slice(0, 5)
        : [];
      webContext = [searchData.AbstractText, ...topics.map((item: any) => item.Text)].filter(Boolean).join('\n');
    }

    const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: `You are BTC AI, a helpful study assistant for a tuition app. Give exactly one clear final answer, not multiple alternative answers. If images are provided, analyze what is visible and answer the user's request. If web context is provided, use it and mention only the most useful source facts. Be friendly and concise.\n\nWeb context:\n${webContext || 'No web context provided.'}` },
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
