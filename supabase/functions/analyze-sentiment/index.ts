// supabase/functions/analyze-sentiment/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0'
import OpenAI from 'https://deno.land/x/openai@v4.47.1/mod.ts';

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } });
  }

  try {
    const payload = await req.json();
    const newFeedback = payload.record;

    if (!newFeedback.comment || newFeedback.comment.trim() === '') {
      return new Response(JSON.stringify({ message: 'Nenhum comentário para analisar.' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // --- MUDANÇA AQUI NO PROMPT ---
    const prompt = `
      Analyze the sentiment of the following customer feedback.
      Return a JSON object with three keys:
      1. "sentiment": a string that must be one of "positive", "negative", or "neutral".
      2. "sentiment_score": a number from -1.0 to 1.0.
      3. "topics": an array of up to 3 main topic strings.
      Feedback: "${newFeedback.comment}"
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const analysisResult = JSON.parse(completion.choices[0].message.content);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: updateError } = await supabaseAdmin
      .from('feedbacks')
      .update({
        sentiment: analysisResult.sentiment,
        sentiment_score: analysisResult.sentiment_score,
        topics: analysisResult.topics,
      })
      .eq('id', newFeedback.id);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true, analysis: analysisResult }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 500,
    });
  }
});