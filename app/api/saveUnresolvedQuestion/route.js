// import fs from 'node:fs';
// import path from 'node:path';
// import { NextResponse } from 'next/server';

// export async function POST(request) {
//   try {
//     const { question, timestamp } = await request.json();
    
//     if (!question) {
//       return NextResponse.json(
//         { error: 'Question is required' },
//         { status: 400 }
//       );
//     }

//     const questionsFilePath = path.join(process.cwd(), 'lib/questions.json');
    
//     // Ensure the file exists with default structure
//     if (!fs.existsSync(questionsFilePath)) {
//       fs.writeFileSync(questionsFilePath, JSON.stringify({ questions: [] }, null, 2), 'utf8');
//     }
    
//     // Read current questions
//     const questionsData = JSON.parse(fs.readFileSync(questionsFilePath, 'utf8'));
    
//     // Add new question
//     questionsData.questions.push({
//       question,
//       timestamp,
//       id: Date.now().toString(36) + Math.random().toString(36).substring(2)
//     });
    
//     // Write updated data
//     fs.writeFileSync(questionsFilePath, JSON.stringify(questionsData, null, 2), 'utf8');
    
//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error('Error saving unresolved question:', error);
//     return NextResponse.json(
//       { error: 'Failed to save question' },
//       { status: 500 }
//     );
//   }
// } 



import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { question, timestamp } = await request.json();

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Create a new question object with a unique id
    const questionEntry = {
      question,
      timestamp,
      id: Date.now().toString(36) + Math.random().toString(36).substring(2)
    };

    // Send the question data to the external API
    const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questionEntry)
    });

    if (!apiResponse.ok) {
      console.error('Error sending question to API:', apiResponse.statusText);
      return NextResponse.json(
        { error: 'Failed to save question' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving unresolved question:', error);
    return NextResponse.json(
      { error: 'Failed to save question' },
      { status: 500 }
    );
  }
}
