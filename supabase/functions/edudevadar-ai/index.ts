import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function callAI(chatMessages: any[], shouldGenerateImage = false) {
  console.log('Calling AI with messages:', chatMessages);
  console.log('Should generate image:', shouldGenerateImage);

  if (shouldGenerateImage) {
    // Use Nano Banana for image generation
    const lastMessage = chatMessages[chatMessages.length - 1]?.content || '';
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          { role: 'system', content: 'You are an AI that generates educational images based on prompts.' },
          { role: 'user', content: lastMessage }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Image generation error:', errText);
      throw new Error(`Image generation failed: ${errText}`);
    }

    const data = await response.json();
    console.log('Image generation response:', data);
    
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const textResponse = data.choices?.[0]?.message?.content || '';
    
    return { text: textResponse, imageUrl };
  } else {
    // Use Gemini 2.5 Flash for text responses with web search
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'You are Neodevadar AI, a helpful study assistant for a school app. When asked questions, search the web for current information and provide long, detailed, comprehensive answers with examples and explanations. Always cite sources when using web search results. You are knowledgeable, thorough, and educational.' 
          },
          ...chatMessages
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('AI error:', errText);
      throw new Error(`AI request failed: ${errText}`);
    }

    const data = await response.json();
    console.log('AI response:', data);
    
    const text = data.choices?.[0]?.message?.content || '';
    return { text };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, prompt, generateImage: shouldGenerateImage } = await req.json();
    console.log('Received request:', { messages, prompt, shouldGenerateImage });

    if (!lovableApiKey) {
      console.error('Missing LOVABLE_API_KEY');
      return new Response(JSON.stringify({ error: 'Missing LOVABLE_API_KEY' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Normalize input to chat format
    const chatMessages = Array.isArray(messages) && messages.length
      ? messages
      : [{ role: 'user', content: String(prompt || 'Hello!') }];

    // Check if user is asking for image generation
    const lastMessage = chatMessages[chatMessages.length - 1]?.content || '';
    const imageKeywords = ['generate image', 'create image', 'draw', 'show me', 'visualize', 'picture', 'diagram'];
    const needsImage = shouldGenerateImage || imageKeywords.some(keyword => 
      lastMessage.toLowerCase().includes(keyword)
    );

    console.log('Getting AI response...');
    const result = await callAI(chatMessages, needsImage);

    const response: any = {
      generatedText: result.text
    };

    if (result.imageUrl) {
      response.image = {
        success: true,
        imageUrl: result.imageUrl,
        description: 'Generated image'
      };
    }

    console.log('Sending response:', response);
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in edudevadar-ai function:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
