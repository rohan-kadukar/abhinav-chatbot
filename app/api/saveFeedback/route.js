import fs from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { question, answer, feedback, reason, timestamp } = await request.json();
    
    if (!question || !answer || !feedback) {
      return NextResponse.json(
        { error: 'Question, answer, and feedback are required' },
        { status: 400 }
      );
    }

    const feedbackFilePath = path.join(process.cwd(), 'lib/feedback.json');
    
    // Ensure the file exists with default structure
    if (!fs.existsSync(feedbackFilePath)) {
      fs.writeFileSync(feedbackFilePath, JSON.stringify({ feedback: [] }, null, 2), 'utf8');
    }
    
    // Read current feedback
    const feedbackData = JSON.parse(fs.readFileSync(feedbackFilePath, 'utf8'));
    
    // Add new feedback entry
    feedbackData.feedback.push({
      question,
      answer,
      feedback,
      reason,
      timestamp,
      id: Date.now().toString(36) + Math.random().toString(36).substring(2)
    });
    
    // Write updated data
    fs.writeFileSync(feedbackFilePath, JSON.stringify(feedbackData, null, 2), 'utf8');
    
    console.log('Feedback saved to file:', { question, answer, feedback, reason, timestamp });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving feedback:', error);
    return NextResponse.json(
      { error: 'Failed to save feedback' },
      { status: 500 }
    );
  }
} 