import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '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',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formData, analysis } = body;

    console.log('API received data:', {
      hasFormData: !!formData,
      hasAnalysis: !!analysis,
      formDataKeys: formData ? Object.keys(formData) : [],
      analysisKeys: analysis ? Object.keys(analysis) : []
    });

    let prompt = '';

    if (formData && analysis) {
      console.log('Generating combined summary with both profile and PDF data');
      // Generate combined summary from both profile data and PDF analysis
      prompt = `Generate a comprehensive candidate profile summary by combining the following information:

PROFILE INFORMATION:
- Candidate Name: ${formData.candidate_name}
- Email: ${formData.candidate_email}
- Skills: ${formData.candidate_skills || 'Not specified'}
- Experience: ${formData.experience || 'Not specified'}
- Projects: ${formData.candidate_projects || 'Not specified'}
- Interview Date: ${formData.interview_date || 'Not scheduled'}
- Interview Time: ${formData.interview_time || 'Not scheduled'}

RESUME ANALYSIS (PDF):
${JSON.stringify(analysis, null, 2)}

Please provide a professional summary that combines and analyzes both sources of information. The summary should include:
1. Candidate overview (combine profile info with resume data)
2. Key skills and strengths (from both sources)
3. Experience highlights (merge profile experience with resume experience)
4. Project achievements (combine profile projects with resume projects)
5. Interview readiness assessment (based on complete information)
6. Recommendations for interview focus areas (using all available data)
7. Any discrepancies or additional insights from comparing both sources

Format the response in a clear, structured manner suitable for an interview panel.`;
      
      console.log('Generated prompt length:', prompt.length);
      console.log('Profile data included:', {
        name: formData.candidate_name,
        email: formData.candidate_email,
        skills: formData.candidate_skills,
        experience: formData.experience
      });
      console.log('PDF analysis included:', {
        candidateInfo: analysis.candidateInfo,
        skillsCount: analysis.skills?.technical?.length || 0,
        experienceCount: analysis.experience?.length || 0,
        projectsCount: analysis.projects?.length || 0
      });
      
    } else if (analysis) {
      // Fallback: Generate summary from PDF analysis only
      prompt = `Generate a comprehensive candidate profile summary based on this resume analysis:

${JSON.stringify(analysis, null, 2)}

Please provide a professional summary that includes:
1. Candidate overview
2. Key skills and strengths
3. Experience highlights
4. Project achievements
5. Interview readiness assessment
6. Recommendations for interview focus areas

Format the response in a clear, structured manner suitable for an interview panel.`;
    } else if (formData) {
      // Fallback: Generate summary from form data only
      prompt = `Generate a comprehensive candidate profile summary based on the following information:

Candidate Name: ${formData.candidate_name}
Email: ${formData.candidate_email}
Skills: ${formData.candidate_skills || 'Not specified'}
Experience: ${formData.experience || 'Not specified'}
Projects: ${formData.candidate_projects || 'Not specified'}
Interview Date: ${formData.interview_date || 'Not scheduled'}
Interview Time: ${formData.interview_time || 'Not scheduled'}

Please provide a professional summary that includes:
1. Candidate overview
2. Key skills and strengths
3. Experience highlights
4. Project achievements
5. Interview readiness assessment
6. Recommendations for interview focus areas

Format the response in a clear, structured manner suitable for an interview panel.`;
    } else {
      throw new Error('No data provided for summary generation');
    }

    // Generate via OpenAI SDK
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert HR professional creating comprehensive candidate profiles. 
          Create a detailed, professional summary that combines the candidate's profile information 
          with their resume analysis. The summary should be well-structured, highlighting key 
          strengths, experiences, and qualifications.`
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const summary = completion.choices[0]?.message?.content || 'Unable to generate summary';

    return NextResponse.json({ summary });

  } catch (error: any) {
    console.error('❌ Error generating summary:', error);
    return NextResponse.json(
      { 
        error: error?.message || 'Failed to generate summary',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

function buildSummaryPrompt(formData: any, analysis: any): string {
  const sections: string[] = [];

  sections.push('Generate a comprehensive candidate profile summary based on the following information:\n');
  sections.push('=== PROFILE INFORMATION ===');
  sections.push(`Name: ${formData.candidate_name}`);
  sections.push(`Email: ${formData.candidate_email}`);
  if (formData.candidate_skills) sections.push(`Skills (from profile): ${formData.candidate_skills}`);
  if (formData.experience) sections.push(`Experience (from profile): ${formData.experience}`);
  if (formData.candidate_projects) sections.push(`Projects (from profile): ${formData.candidate_projects}`);
  if (formData.interview_date) sections.push(`Interview Date: ${formData.interview_date}`);
  if (formData.interview_time) sections.push(`Interview Time: ${formData.interview_time}`);

  sections.push('\n=== RESUME ANALYSIS (FROM PDF) ===');
  if (analysis.candidateInfo) {
    sections.push('\nCandidate Information:');
    if (analysis.candidateInfo.name) sections.push(`- Name: ${analysis.candidateInfo.name}`);
    if (analysis.candidateInfo.email) sections.push(`- Email: ${analysis.candidateInfo.email}`);
    if (analysis.candidateInfo.phone) sections.push(`- Phone: ${analysis.candidateInfo.phone}`);
    if (analysis.candidateInfo.location) sections.push(`- Location: ${analysis.candidateInfo.location}`);
  }
  if (analysis.skills) {
    sections.push('\nSkills from Resume:');
    if (analysis.skills.technical?.length) sections.push(`- Technical: ${analysis.skills.technical.join(', ')}`);
    if (analysis.skills.soft?.length) sections.push(`- Soft Skills: ${analysis.skills.soft.join(', ')}`);
    if (analysis.skills.tools?.length) sections.push(`- Tools: ${analysis.skills.tools.join(', ')}`);
  }
  if (analysis.experience?.length) {
    sections.push('\nWork Experience:');
    analysis.experience.forEach((exp: any, idx: number) => {
      sections.push(`${idx + 1}. ${exp.role || 'Role'} at ${exp.company || 'Company'}`);
      if (exp.duration) sections.push(`   Duration: ${exp.duration}`);
      if (exp.responsibilities?.length) sections.push(`   Responsibilities: ${exp.responsibilities.join(', ')}`);
    });
  }
  if (analysis.education?.length) {
    sections.push('\nEducation:');
    analysis.education.forEach((edu: any, idx: number) => {
      sections.push(`${idx + 1}. ${edu.degree || 'Degree'} from ${edu.institution || 'Institution'}`);
      if (edu.year) sections.push(`   Year: ${edu.year}`);
    });
  }
  if (analysis.projects?.length) {
    sections.push('\nProjects:');
    analysis.projects.forEach((proj: any, idx: number) => {
      sections.push(`${idx + 1}. ${proj.name || 'Project'}`);
      if (proj.description) sections.push(`   Description: ${proj.description}`);
      if (proj.technologies?.length) sections.push(`   Technologies: ${proj.technologies.join(', ')}`);
    });
  }
  if (analysis.certifications?.length) sections.push(`\nCertifications: ${analysis.certifications.join(', ')}`);
  if (analysis.careerLevel) sections.push(`\nCareer Level: ${analysis.careerLevel}`);
  if (analysis.industryExperience?.length) sections.push(`\nIndustry Experience: ${analysis.industryExperience.join(', ')}`);

  sections.push('\n=== INSTRUCTIONS ===');
  sections.push('Create a comprehensive 2-3 paragraph summary that:');
  sections.push('1. Combines information from BOTH the profile form and the PDF resume analysis');
  sections.push("2. Highlights the candidate's key strengths and qualifications");
  sections.push('3. Mentions relevant technical skills, experience, and projects');
  sections.push('4. Uses professional language suitable for an interview assessment');
  sections.push('5. Is concise but informative (300-500 words)');
  sections.push('\nIMPORTANT: Merge and synthesize information from both sources. Do not just list them separately.');

  return sections.join('\n');
}
