import { NextResponse } from 'next/server';
import { initCronJobs } from '@/cron/reminders';

// Initialize cron jobs on first API call
let initialized = false;

export async function GET() {
  if (!initialized) {
    console.log('🔧 Initializing cron jobs...');
    initCronJobs();
    initialized = true;
  }
  
  return NextResponse.json({ 
    success: true, 
    message: 'Cron jobs initialized',
    timestamp: new Date().toISOString()
  });
}
