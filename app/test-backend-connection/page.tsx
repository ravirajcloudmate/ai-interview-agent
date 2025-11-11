'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';

export default function TestBackendConnectionPage() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const testBackendConnection = async () => {
    setTesting(true);
    setResults([]);
    
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';
    const tests = [
      {
        name: 'Backend Server Reachability',
        test: async () => {
          try {
            const response = await fetch(`${BACKEND_URL}/health`, { 
              method: 'GET',
              signal: AbortSignal.timeout(5000)
            });
            return { success: response.ok, status: response.status, message: 'Server is reachable' };
          } catch (error: any) {
            return { success: false, error: error.message, message: 'Server not reachable' };
          }
        }
      },
      {
        name: 'Agent Join Endpoint',
        test: async () => {
          try {
            const response = await fetch(`${BACKEND_URL}/agent/join`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                roomName: 'test-room',
                sessionId: 'test-session',
                candidateId: 'test@example.com',
                candidateName: 'Test Candidate',
                jobId: 'test-job',
                agentId: 'test-agent',
                agentPrompt: 'Test prompt'
              }),
              signal: AbortSignal.timeout(5000)
            });
            const data = await response.text().catch(() => '');
            return { 
              success: response.ok, 
              status: response.status, 
              message: response.ok ? 'Endpoint exists' : `Status: ${response.status}`,
              data: data.substring(0, 200)
            };
          } catch (error: any) {
            return { 
              success: false, 
              error: error.message, 
              message: error.name === 'AbortError' ? 'Timeout - endpoint may not exist' : error.message 
            };
          }
        }
      },
      {
        name: 'Start Interview Endpoint',
        test: async () => {
          try {
            const response = await fetch(`${BACKEND_URL}/start-interview`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                roomName: 'test-room',
                candidateId: 'test@example.com',
                jobId: 'test-job',
                candidateName: 'Test Candidate'
              }),
              signal: AbortSignal.timeout(5000)
            });
            const data = await response.text().catch(() => '');
            return { 
              success: response.ok, 
              status: response.status, 
              message: response.ok ? 'Endpoint exists' : `Status: ${response.status}`,
              data: data.substring(0, 200)
            };
          } catch (error: any) {
            return { 
              success: false, 
              error: error.message, 
              message: error.name === 'AbortError' ? 'Timeout - endpoint may not exist' : error.message 
            };
          }
        }
      },
      {
        name: 'Candidate Joined Endpoint',
        test: async () => {
          try {
            const response = await fetch(`${BACKEND_URL}/api/candidate-joined`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sessionId: 'test-session',
                roomId: 'test-room',
                candidateName: 'Test Candidate',
                candidateEmail: 'test@example.com'
              }),
              signal: AbortSignal.timeout(5000)
            });
            return { 
              success: response.ok, 
              status: response.status, 
              message: response.ok ? 'Endpoint exists' : `Status: ${response.status}` 
            };
          } catch (error: any) {
            return { 
              success: false, 
              error: error.message, 
              message: error.name === 'AbortError' ? 'Timeout - endpoint may not exist' : error.message 
            };
          }
        }
      }
    ];

    const testResults = [];
    for (const testCase of tests) {
      const result = await testCase.test();
      testResults.push({
        name: testCase.name,
        ...result
      });
    }

    setResults(testResults);
    setTesting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Backend Connection Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Backend URL:</strong> {process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001'}
              </p>
              <p className="text-sm text-gray-600">
                This will test if your Python backend is accessible and if the required endpoints exist.
              </p>
            </div>
            
            <Button 
              onClick={testBackendConnection} 
              disabled={testing}
              className="w-full"
            >
              {testing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Backend Connection'
              )}
            </Button>

            {results.length > 0 && (
              <div className="space-y-3 mt-6">
                <h3 className="font-semibold">Test Results:</h3>
                {results.map((result, index) => (
                  <Alert key={index} variant={result.success ? "default" : "destructive"}>
                    <div className="flex items-start gap-3">
                      {result.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="font-semibold mb-1">{result.name}</div>
                        <AlertDescription>
                          <div className="text-sm">{result.message}</div>
                          {result.status && (
                            <div className="text-xs mt-1">HTTP Status: {result.status}</div>
                          )}
                          {result.error && (
                            <div className="text-xs mt-1 text-red-600">Error: {result.error}</div>
                          )}
                          {result.data && (
                            <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-x-auto">
                              {result.data}
                            </pre>
                          )}
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            )}

            {results.length > 0 && results.some(r => !r.success) && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-2">Troubleshooting:</div>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Make sure your Python backend is running on port 8001</li>
                    <li>Check if the backend has the required endpoints: <code>/agent/join</code>, <code>/start-interview</code></li>
                    <li>Verify CORS is enabled for your frontend URL</li>
                    <li>Check backend logs for errors</li>
                    <li>The interview will still work - agent can connect later when backend is ready</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

