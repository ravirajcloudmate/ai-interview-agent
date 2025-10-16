'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function IndexRedirect() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Only redirect from root path, not from other paths
    if (!loading && typeof window !== 'undefined' && window.location.pathname === '/') {
      if (user) {
        console.log('✅ Root path: redirecting to dashboard');
        router.replace('/dashboard');
      } else {
        console.log('⚠️ Root path: redirecting to login');
        router.replace('/auth/login');
      }
    }
  }, [loading, user, router]);

  // Don't show this if we're not on root path
  if (typeof window !== 'undefined' && window.location.pathname !== '/') {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">
          {loading ? 'Loading...' : user ? 'Redirecting to dashboard...' : 'Redirecting to login...'}
        </p>
      </div>
    </div>
  );
}
