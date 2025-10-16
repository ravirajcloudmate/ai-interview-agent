'use client';

import { useAuth } from '@/contexts/AuthContext';
import { JobPostings } from '@/app/components/JobPostings';

export default function TestJobPostingsPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p>Please log in to test the JobPostings component.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="p-4 bg-blue-50 border-l-4 border-blue-400 mb-6">
        <h2 className="text-lg font-semibold text-blue-800">Test Page - JobPostings Component</h2>
        <p className="text-blue-700">User ID: {user.id}</p>
        <p className="text-blue-700">User Email: {user.email}</p>
      </div>
      <JobPostings user={user} />
    </div>
  );
}
