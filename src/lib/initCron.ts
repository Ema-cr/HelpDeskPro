// This file initializes cron jobs when the application starts
// Import this in your main layout or a server component

import { initCronJobs } from '@/cron/reminders';

// Initialize cron jobs only on server
if (typeof window === 'undefined') {
  initCronJobs();
}

export {};
