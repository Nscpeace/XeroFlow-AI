import { GoogleGenAI, Type } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (aiClient) return aiClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
  return aiClient;
}

export async function handleGenerateCommentary(prompt: string): Promise<Record<string, unknown>> {
  const ai = getAIClient();
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      systemInstruction:
        'You are an expert CPA and Financial Controller. Your job is to draft concise, highly credible management commentary for the board pack based ONLY on the numbers provided in the user prompt. Never invent figures or calculate numbers. Cite the exact dollar amounts and percentages provided.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          executiveSummary: {
            type: Type.STRING,
            description: '1-2 paragraphs summarizing total revenue, gross margin, net income, burn, and primary drivers.',
          },
          revenueAndMargins: {
            type: Type.STRING,
            description: 'Analysis of top-line performance, revenue streams, and gross margin movements against budget.',
          },
          opexDrivers: {
            type: Type.STRING,
            description: 'Breakdown of operating expenditure, citing largest over/under budget lines and anomalies.',
          },
          workingCapitalAndRunway: {
            type: Type.STRING,
            description: 'Assessment of cash balance, monthly burn, runway in months, debtor days (DSO), and liquidity ratios.',
          },
          riskAndAuditNotes: {
            type: Type.STRING,
            description: 'Key risks, flagged anomalies requiring ledger audit, and recommended operational next steps.',
          },
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
  });

  const text = response.text;
  if (!text) {
    throw new Error('Empty response from model');
  }

  const parsed = JSON.parse(text);
  return {
    ...parsed,
    generatedAt: new Date().toISOString(),
    modelUsed: 'gemini-3.8-flash (Server-Side Grounded Inference)',
  };
}
