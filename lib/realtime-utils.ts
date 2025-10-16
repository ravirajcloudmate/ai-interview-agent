// Realtime utilities for triggering refreshes across components

/**
 * Triggers a refresh of the JobPostings component
 */
export function triggerJobPostingsRefresh() {
  console.log('Triggering JobPostings refresh via custom event');
  window.dispatchEvent(new CustomEvent('jobPostingsRefresh'));
}

/**
 * Triggers a refresh of all dashboard components
 */
export function triggerDashboardRefresh() {
  console.log('Triggering dashboard refresh via custom event');
  window.dispatchEvent(new CustomEvent('dashboardRefresh'));
}

/**
 * Triggers a refresh of analytics components
 */
export function triggerAnalyticsRefresh() {
  console.log('Triggering analytics refresh via custom event');
  window.dispatchEvent(new CustomEvent('analyticsRefresh'));
}

/**
 * Generic refresh trigger for any component
 */
export function triggerComponentRefresh(componentName: string) {
  console.log(`Triggering ${componentName} refresh via custom event`);
  window.dispatchEvent(new CustomEvent(`${componentName}Refresh`));
}

/**
 * Check if realtime is available and working
 */
export async function checkRealtimeStatus() {
  try {
    // This is a simple check - in a real app you might ping your realtime endpoint
    return {
      available: typeof window !== 'undefined' && 'WebSocket' in window,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error checking realtime status:', error);
    return {
      available: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}
