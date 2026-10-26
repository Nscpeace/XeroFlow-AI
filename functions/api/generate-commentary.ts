interface Env {
  GEMINI_API_KEY?: string;
}

interface RequestBody {
  prompt?: string;
}

export const onRequestPost = async (context: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  try {
    const apiKey = context.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'GEMINI_API_KEY environment variable is not configured on Cloudflare.',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const body = (await context.request.json()) as RequestBody;
    const prompt = body.prompt;

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Missing prompt parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Call Google Gemini REST API on Cloudflare Edge Runtime
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              executiveSummary: { type: 'STRING' },
              revenueAndMargins: { type: 'STRING' },
              opexDrivers: { type: 'STRING' },
              workingCapitalAndRunway: { type: 'STRING' },
              riskAndAuditNotes: { type: 'STRING' },
            },
            required: [
              'executiveSummary',
              'revenueAndMargins',
              'opexDrivers',
              'workingCapitalAndRunway',
              'riskAndAuditNotes',
            ],
          },
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return new Response(
        JSON.stringify({ error: `Gemini API error: ${geminiRes.status}`, details: errText }),
        {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const data = (await geminiRes.json()) as any;
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return new Response(JSON.stringify({ error: 'Empty output from Gemini API' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const parsed = JSON.parse(rawText);
    return new Response(
      JSON.stringify({
        ...parsed,
        generatedAt: new Date().toISOString(),
        modelUsed: 'Cloudflare Pages Functions + Gemini 2.5 Flash',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal Server Error';
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const onRequestOptions = async (): Promise<Response> => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
