'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { triggerJobPostingsRefresh } from '@/lib/realtime-utils';
import { supabase } from '@/lib/supabase';

export default function TestRealtimePage() {
  const { user } = useAuth();
  const [realtimeStatus, setRealtimeStatus] = useState<string>('Unknown');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const testRealtimeConnection = async () => {
    try {
      setRealtimeStatus('Testing...');
      
      // Create a test channel
      const channel = supabase.channel('test-realtime');
      
      channel.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'job_postings'
      }, (payload) => {
        console.log('Test realtime received:', payload);
        setLastUpdate(new Date());
      });

      const status = await channel.subscribe((status) => {
        console.log('Test channel status:', status);
        setRealtimeStatus(status);
      });

      // Clean up after 10 seconds
      setTimeout(() => {
        supabase.removeChannel(channel);
        setRealtimeStatus('Test completed');
      }, 10000);

    } catch (error) {
      console.error('Realtime test error:', error);
      setRealtimeStatus('Error');
    }
  };

  const triggerManualRefresh = () => {
    triggerJobPostingsRefresh();
    setLastUpdate(new Date());
  };

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p>Please log in to test realtime functionality.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Realtime Test Page</h1>
        <p className="text-muted-foreground">Test realtime functionality and manual refresh triggers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Realtime Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant={realtimeStatus === 'SUBSCRIBED' ? 'default' : 'secondary'}>
                {realtimeStatus}
              </Badge>
            </div>
            
            {lastUpdate && (
              <div className="text-sm text-muted-foreground">
                Last update: {lastUpdate.toLocaleTimeString()}
              </div>
            )}

            <Button onClick={testRealtimeConnection} className="w-full">
              Test Realtime Connection
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manual Refresh Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Click the button below to trigger a manual refresh of JobPostings component.
              This should update the data without a page reload.
            </p>
            
            <Button onClick={triggerManualRefresh} className="w-full">
              Trigger Manual Refresh
            </Button>

            {lastUpdate && (
              <div className="text-sm text-muted-foreground">
                Last manual refresh: {lastUpdate.toLocaleTimeString()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>1. <strong>Test Realtime:</strong> Click "Test Realtime Connection" to verify Supabase realtime is working</p>
            <p>2. <strong>Manual Refresh:</strong> Click "Trigger Manual Refresh" to test the refresh mechanism</p>
            <p>3. <strong>Create/Edit Jobs:</strong> Go to the JobPostings page and create/edit/delete jobs to test automatic updates</p>
            <p>4. <strong>Multiple Tabs:</strong> Open multiple tabs and make changes in one to see if others update automatically</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
