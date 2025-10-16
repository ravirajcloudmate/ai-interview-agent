'use client';

import { AlertCircle, Building, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function CompanySetupBanner() {
  const router = useRouter();

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-6 w-6 text-yellow-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Company Profile Setup Required
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p className="mb-3">
              Please complete your company profile setup before creating job postings. This will link your account to a company and enable all features.
            </p>
            <Button 
              size="sm" 
              onClick={() => router.push('/profile')}
              className="gap-2 bg-yellow-600 hover:bg-yellow-700"
            >
              <Building className="h-4 w-4" />
              Setup Company Profile
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

