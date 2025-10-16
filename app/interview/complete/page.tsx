'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Clock, MessageSquare } from 'lucide-react';

export default function InterviewCompletePage() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Get session ID from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const session = urlParams.get('session');
    setSessionId(session);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Interview Completed!
          </h1>
          <p className="text-gray-600">
            Thank you for participating in the interview. Your responses have been recorded and will be reviewed.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Session ID: {sessionId || 'N/A'}</span>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <MessageSquare className="w-4 h-4" />
            <span>Your responses are being analyzed</span>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
          <ul className="text-sm text-blue-800 space-y-1 text-left">
            <li>• Your interview responses are being analyzed</li>
            <li>• You'll receive feedback via email</li>
            <li>• The hiring team will review your performance</li>
            <li>• You'll be contacted with next steps</li>
          </ul>
        </div>

        <button
          onClick={() => window.close()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Close Window
        </button>
      </div>
    </div>
  );
}
