import { NextRequest, NextResponse } from 'next/server';
import { checkUnrespondedTickets } from '@/cron/reminders';

// GET endpoint for Vercel Cron (Vercel uses GET by default)
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron (optional security check)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('⏰ Vercel Cron triggered - checking unresponded tickets...');
    await checkUnrespondedTickets();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Reminder check completed',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ Cron job error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// POST endpoint for manual triggers
export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication/authorization here
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Manual cron job triggered via API');
    await checkUnrespondedTickets();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Reminder check completed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ Cron job error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
