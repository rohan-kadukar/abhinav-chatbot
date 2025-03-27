import { readFileSync } from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'scripts', 'widget.js');
    const widgetScript = readFileSync(filePath, 'utf8');
    
    return new NextResponse(widgetScript, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error('Error serving widget script:', error);
    return new NextResponse('Error loading widget script', { status: 500 });
  }
} 