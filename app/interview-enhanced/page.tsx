'use client';

import InterviewRoomEnhanced from '../components/InterviewRoomEnhanced';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function InterviewContent() {
  const searchParams = useSearchParams();
  const candidateId = searchParams.get('candidateId') || 'candidate-123';
  const jobId = searchParams.get('jobId') || 'job-456';
  const candidateName = searchParams.get('candidateName') || 'Candidate';

  return (
    <InterviewRoomEnhanced 
      candidateId={candidateId} 
      jobId={jobId}
      candidateName={candidateName}
      onEndInterview={() => {
        console.log('Interview ended');
        window.location.href = '/dashboard';
      }}
    />
  );
}

export default function InterviewEnhancedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading interview...</p>
        </div>
      </div>
    }>
      <InterviewContent />
    </Suspense>
  );
}

