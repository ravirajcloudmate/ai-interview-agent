// Example: How to send candidate details to backend agent
// This can be called from InterviewManagement.tsx after creating invitation

import { supabase } from '@/lib/supabase';

/**
 * Send comprehensive candidate details to backend agent
 * Call this after creating interview invitation and analyzing resume
 */
export const sendCandidateDetailsToBackendAgent = async ({
  roomName,
  candidateEmail,
  candidateName,
  candidateSkills,
  experience,
  projects,
  resumeAnalysis,
  candidateSummary,
  jobId,
  jobTitle,
  department,
  interviewDate,
  interviewTime,
  sessionId
}: {
  roomName: string;
  candidateEmail: string;
  candidateName?: string;
  candidateSkills?: string;
  experience?: string;
  projects?: string;
  resumeAnalysis?: any;
  candidateSummary?: string;
  jobId?: string;
  jobTitle?: string;
  department?: string;
  interviewDate?: string;
  interviewTime?: string;
  sessionId?: string;
}) => {
  try {
    console.log('📤 Sending candidate details to backend agent...');

    // Call the API endpoint
    const response = await fetch('/api/send-candidate-details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roomName,
        candidateId: candidateEmail,
        candidateEmail,
        candidateName: candidateName || candidateEmail.split('@')[0],
        candidateSkills,
        experience,
        projects,
        resumeAnalysis: resumeAnalysis || null,
        candidateSummary,
        jobId,
        jobTitle,
        department,
        interviewDate,
        interviewTime,
        sessionId
      })
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Candidate details sent successfully:', result);
      return result;
    } else {
      console.warn('⚠️ Failed to send candidate details:', result.error);
      // Don't throw - this is optional functionality
      return result;
    }
  } catch (error: any) {
    console.error('❌ Error sending candidate details:', error);
    // Don't throw - this is optional and shouldn't block the interview flow
    return {
      success: false,
      error: error.message,
      note: 'Backend agent may still work with basic info'
    };
  }
};

/**
 * Example usage in InterviewManagement component:
 * 
 * After creating invitation and analyzing resume:
 * 
 * const handleInviteCandidate = async () => {
 *   // ... existing code to create invitation ...
 *   
 *   // After invitation is created and resume is analyzed:
 *   if (generatedSummary && uploadedFile) {
 *     // Send candidate details to backend agent
 *     await sendCandidateDetailsToBackendAgent({
 *       roomName: interviewLink.split('/').pop() || interviewLink,
 *       candidateEmail: inviteForm.candidate_email,
 *       candidateName: inviteForm.candidate_name,
 *       candidateSkills: inviteForm.candidate_skills,
 *       experience: inviteForm.experience,
 *       projects: inviteForm.candidate_projects,
 *       resumeAnalysis: pdfAnalysisResult?.analysis, // From PDF analysis
 *       candidateSummary: generatedSummary, // AI-generated summary
 *       jobId: inviteForm.job_id,
 *       jobTitle: selectedJob?.job_title,
 *       department: selectedJob?.department,
 *       interviewDate: inviteForm.interview_date,
 *       interviewTime: inviteForm.interview_time,
 *       sessionId: newInvitation?.id // If you have invitation ID
 *     });
 *   }
 * };
 */

