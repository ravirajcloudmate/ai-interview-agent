'use client';

import InterviewRoom from '../components/InterviewRoom';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function InterviewRoomContent() {
  const searchParams = useSearchParams();
  const candidateId = searchParams.get('candidateId') || 'candidate-123';
  const jobId = searchParams.get('jobId') || 'job-456';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <InterviewRoom 
        candidateId={candidateId} 
        jobId={jobId} 
      />
    </div>
  );
}

export default function InterviewRoomPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <InterviewRoomContent />
    </Suspense>
  );
}

