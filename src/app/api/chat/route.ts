import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Prepare messages for OpenAI
    const openAIMessages = [
      {
        role: 'system' as const,
        content: systemPrompt || `You are an AI assistant helping street vendors understand supplier certifications and quality standards. You specialize in:

1. BIS (Bureau of Indian Standards) certifications
2. ISO (International Organization for Standardization) certifications  
3. MSME (Micro, Small & Medium Enterprises) registration
4. Quality standards for different product categories
5. Supplier verification processes
6. Price negotiation tips

Provide clear, practical advice in simple language that street vendors can easily understand. Focus on actionable guidance that helps them make informed decisions about suppliers and product quality.

Always be helpful, accurate, and supportive. If you're unsure about specific certification details, recommend they verify with official sources.`
      },
      ...messages.map((msg: any) => ({
        role: msg.isBot ? 'assistant' : 'user',
        content: msg.content
      }))
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: openAIMessages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const botResponse = completion.choices[0]?.message?.content;

    if (!botResponse) {
      return NextResponse.json(
        { error: 'No response from OpenAI' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: botResponse,
      usage: completion.usage 
    });

  } catch (error: any) {
    console.error('OpenAI API error:', error);
    
    if (error.code === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'OpenAI API quota exceeded. Please check your billing.' },
        { status: 429 }
      );
    }
    
    if (error.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key. Please check your configuration.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to get response from AI assistant' },
      { status: 500 }
    );
  }
}
