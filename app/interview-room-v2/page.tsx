'use client';

import InterviewRoom from '../components/InterviewRoom_v2';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function InterviewRoomContent() {
  const searchParams = useSearchParams();
  const candidateId = searchParams.get('candidateId') || 'candidate-123';
  const jobId = searchParams.get('jobId') || 'job-456';
  const candidateName = searchParams.get('candidateName') || 'Candidate';
  const roleType = (searchParams.get('roleType') as 'general' | 'technical') || 'general';

  return (
    <InterviewRoom 
      candidateId={candidateId} 
      jobId={jobId}
      candidateName={candidateName}
      roleType={roleType}
    />
  );
}

export default function InterviewRoomPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading interview...</p>
        </div>
      </div>
    }>
      <InterviewRoomContent />
    </Suspense>
  );
}

