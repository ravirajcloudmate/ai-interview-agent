import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: NextRequest) {
  try {
    const { formData, analysis } = await request.json();

    if (!formData || !analysis) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      );
    }

    // Build comprehensive prompt
    const prompt = `Create a professional candidate profile summary combining the following information:

CANDIDATE INFORMATION:
- Name: ${formData.candidate_name || 'Not provided'}
- Email: ${formData.candidate_email || 'Not provided'}
- Skills (from form): ${formData.candidate_skills || 'Not provided'}
- Experience (from form): ${formData.experience || 'Not provided'}
- Projects (from form): ${formData.candidate_projects || 'Not provided'}

RESUME ANALYSIS (PDF):
${JSON.stringify(analysis, null, 2)}

Create a comprehensive professional summary that:
1. Highlights key qualifications and experience
2. Emphasizes technical skills and expertise
3. Mentions notable projects and achievements
4. Provides an overall assessment of fit for technical roles
5. Is 3-4 paragraphs, professional tone

Format the summary as clear, readable text without JSON structure.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert HR professional creating comprehensive candidate profile summaries. Write professional, well-structured summaries that combine form data with resume analysis.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    const summary = completion.choices[0].message.content || 'Summary generation failed';

    return NextResponse.json({
      success: true,
      summary
    });

  } catch (error: any) {
    console.error('❌ Summary generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
