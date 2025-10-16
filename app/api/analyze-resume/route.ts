import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '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',
});

const ANALYSIS_PROMPT = `You are an expert resume analyzer. Analyze the provided resume content and return ONLY valid JSON (no extra text, no markdown, no code blocks) matching this exact schema:

{
  "candidateInfo": {"name": "", "email": "", "phone": "", "location": ""},
  "experience": [{"company": "", "role": "", "duration": "", "responsibilities": [""]}],
  "skills": {"technical": [""], "soft": [""], "tools": [""]},
  "education": [{"degree": "", "institution": "", "year": ""}],
  "certifications": [""],
  "projects": [{"name": "", "description": "", "technologies": [""]}],
  "careerLevel": "junior|mid|senior|lead",
  "industryExperience": [""]
}

CRITICAL: Return ONLY the JSON object, no extra text before or after.`;

export async function POST(request: NextRequest) {
  console.log('🚀 PDF Analysis API called');
  
  try {
    // Parse form data
    let formData;
    try {
      formData = await request.formData();
      console.log('✅ FormData parsed successfully');
    } catch (formError) {
      console.error('❌ FormData parse error:', formError);
      return NextResponse.json(
        { error: 'Invalid form data. Please ensure you are sending a proper multipart/form-data request.' },
        { status: 400 }
      );
    }

    const file = formData.get('file') as File | null;

    if (!file) {
      console.error('❌ No file in request');
      return NextResponse.json(
        { error: 'No file provided. Please upload a PDF file.' },
        { status: 400 }
      );
    }

    console.log('📄 File received:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Validate file type
    if (file.type !== 'application/pdf') {
      console.error('❌ Invalid file type:', file.type);
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PDF file.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.error('❌ File too large:', file.size);
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    let buffer;
    try {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      console.log('✅ File converted to buffer, size:', buffer.length);
    } catch (bufferError) {
      console.error('❌ Buffer conversion error:', bufferError);
      return NextResponse.json(
        { error: 'Failed to process file. Please try again.' },
        { status: 500 }
      );
    }

    // Try to extract text from PDF using pdf-parse
    let pdfText = '';
    try {
      // Dynamic import of pdf-parse (it might not be installed yet)
      const pdf = await import('pdf-parse').then(m => m.default).catch(() => null);
      
      if (pdf) {
        const pdfData = await pdf(buffer);
        pdfText = pdfData.text || '';
        console.log('✅ PDF text extracted via pdf-parse, length:', pdfText.length);
      } else {
        console.warn('⚠️ pdf-parse not available, using fallback');
        // Fallback: Try to extract basic info from buffer as string
        pdfText = buffer.toString('utf-8', 0, Math.min(buffer.length, 5000));
      }
    } catch (pdfError: any) {
      console.error('⚠️ PDF extraction warning:', pdfError.message);
      // Continue with empty text - we'll use OpenAI Vision API or create fallback
      pdfText = '';
    }

    // If we have text, analyze it with OpenAI
    if (pdfText && pdfText.trim().length > 50) {
      console.log('🤖 Analyzing with OpenAI...');
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: ANALYSIS_PROMPT
            },
            {
              role: 'user',
              content: `Analyze this resume and extract information:\n\n${pdfText.slice(0, 8000)}`
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        });

        const responseText = completion.choices[0]?.message?.content || '{}';
        console.log('✅ OpenAI response received');

        // Clean and parse response
        let cleanedResponse = responseText.trim();
        if (cleanedResponse.startsWith('```json')) {
          cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (cleanedResponse.startsWith('```')) {
          cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
        }

        const analysis = JSON.parse(cleanedResponse);
        const validatedAnalysis = validateAnalysis(analysis);

        console.log('✅ Analysis completed successfully');
        return NextResponse.json({ analysis: validatedAnalysis });

      } catch (openaiError: any) {
        console.error('❌ OpenAI error:', openaiError.message);
        // Fall through to fallback analysis
      }
    }

    // Fallback: Create basic analysis from filename
    console.log('⚠️ Using fallback analysis');
    const fileName = file.name.replace('.pdf', '').replace(/[-_]/g, ' ');
    const fallbackAnalysis = createFallbackAnalysis(fileName, pdfText);
    
    return NextResponse.json({ 
      analysis: fallbackAnalysis,
      warning: 'Using basic analysis. For better results, ensure PDF is readable.'
    });

  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json(
      { 
        error: error?.message || 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Create fallback analysis
function createFallbackAnalysis(fileName: string, text: string = '') {
  const nameParts = fileName.split(' ').filter(p => p.length > 2);
  const possibleName = nameParts.slice(0, 2).join(' ') || fileName;

  // Try to extract email and phone from text
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  const phoneMatch = text.match(/[\+\d][\d\s\-\(\)]{8,}/);
  
  // Extract potential skills
  const techKeywords = ['JavaScript', 'Python', 'Java', 'React', 'Node', 'SQL', 'AWS', 'Docker', 'Git', 'TypeScript'];
  const foundSkills = techKeywords.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  );

  return {
    candidateInfo: {
      name: possibleName,
      email: emailMatch ? emailMatch[0] : 'Not found in PDF',
      phone: phoneMatch ? phoneMatch[0] : 'Not found in PDF',
      location: 'Not extracted from PDF'
    },
    experience: [
      {
        company: 'Experience details from PDF',
        role: 'Role information from PDF',
        duration: 'Duration from PDF',
        responsibilities: ['Details extracted from PDF content']
      }
    ],
    skills: {
      technical: foundSkills.length > 0 ? foundSkills : ['Technical skills from PDF'],
      soft: ['Communication', 'Team collaboration', 'Problem solving'],
      tools: ['Tools mentioned in PDF']
    },
    education: [
      {
        degree: 'Education from PDF',
        institution: 'Institution from PDF',
        year: 'Year from PDF'
      }
    ],
    certifications: ['Certifications from PDF'],
    projects: [
      {
        name: 'Project from PDF',
        description: 'Project description from PDF',
        technologies: foundSkills.slice(0, 3)
      }
    ],
    careerLevel: 'mid',
    industryExperience: ['Industry experience from PDF']
  };
}

// Validate analysis structure
function validateAnalysis(analysis: any) {
  const template = {
    candidateInfo: { name: '', email: '', phone: '', location: '' },
    experience: [],
    skills: { technical: [], soft: [], tools: [] },
    education: [],
    certifications: [],
    projects: [],
    careerLevel: 'mid',
    industryExperience: []
  };

  return {
    candidateInfo: { ...template.candidateInfo, ...(analysis.candidateInfo || {}) },
    experience: Array.isArray(analysis.experience) ? analysis.experience : [],
    skills: { 
      technical: Array.isArray(analysis.skills?.technical) ? analysis.skills.technical : [],
      soft: Array.isArray(analysis.skills?.soft) ? analysis.skills.soft : [],
      tools: Array.isArray(analysis.skills?.tools) ? analysis.skills.tools : []
    },
    education: Array.isArray(analysis.education) ? analysis.education : [],
    certifications: Array.isArray(analysis.certifications) ? analysis.certifications : [],
    projects: Array.isArray(analysis.projects) ? analysis.projects : [],
    careerLevel: analysis.careerLevel || 'mid',
    industryExperience: Array.isArray(analysis.industryExperience) ? analysis.industryExperience : []
  };
}