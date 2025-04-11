import Fuse from 'fuse.js';
import compromise from 'compromise';

import { useContext, useEffect } from 'react';
import { DataContext } from '../app/layout';

let data = [];

// Function to update the global data
export const updateGlobalData = (apiData) => {
  data = apiData;
  // Re-initialize searchable data and Fuse index when data changes
  initializeSearchData();
};

// Function to get external data from context
export const useExternalData = () => {
  const { data1, loading } = useContext(DataContext);
  // console.log("data1 from hook:", data1);
  // Update global data when context changes
  useEffect(() => {
    if (data1) {
      updateGlobalData(data1);
    }
  }, [data1]);
  
  return { data1, loading };
};

/* =========================
   Type Guard Functions
========================= */
function isFAQ(item) {
  return item && typeof item.question === 'string' && typeof item.answer === 'string';
}

/* =========================
   Synonym Preprocessing & NLP
========================= */
// Domain-specific synonyms mapping
const synonyms = {
  campus: 'location',
  institute: 'academy',
  facility: 'campus'
};

const preprocessQuery = (query) => {
  let processed = query.toLowerCase();
  Object.keys(synonyms).forEach(key => {
    processed = processed.replace(new RegExp(`\\b${key}\\b`, 'g'), synonyms[key]);
  });
  return processed;
};

/* =========================
   Build Searchable Data
========================= */
let searchableData = [];
let fuse;
let suggestFuse; // Separate Fuse instance for suggestions

// Initialize searchable data and fuse index
const initializeSearchData = () => {
  // Skip if data is not yet loaded
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.log("Data not fully loaded yet, skipping search initialization");
    return;
  }

  // console.log("Initializing searchable data with updated API data");
  
  searchableData = data.map((faq) => ({
    type: 'faq',
    searchText: `${faq.question} ${faq.answer}`,
    data: faq
  }));

  // Main search with stricter threshold
  const fuseOptions = {
    includeScore: true,       // You can keep this for debugging or remove it if not needed
    threshold: 0.0,            // Only exact or near-exact matches will be returned
    keys: ['searchText'],
    useExtendedSearch: true    // Exact match with quotes, optional
  };

  // Suggestions search with more lenient threshold
  const suggestFuseOptions = {
    includeScore: true,
    threshold: 0.5,
    keys: ['searchText']
  };

  fuse = new Fuse(searchableData, fuseOptions);
  suggestFuse = new Fuse(searchableData, suggestFuseOptions);
};

/* =========================
   Local Storage Functions
========================= */
const CHAT_HISTORY_KEY = 'abhinav-academy-chat-history';
const CHAT_PREFERENCES_KEY = 'abhinav-academy-chat-preferences';

export const getChatHistory = () => {
  if (typeof window === 'undefined') return { messages: [], feedback: {} };
  const saved = localStorage.getItem(CHAT_HISTORY_KEY);
  return saved ? JSON.parse(saved) : { messages: [], feedback: {} };
};

export const saveChatHistory = (history) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
};

export const getChatPreferences = () => {
  if (typeof window === 'undefined') return { theme: 'light' };
  const saved = localStorage.getItem(CHAT_PREFERENCES_KEY);
  return saved ? JSON.parse(saved) : { theme: 'light' };
};

export const saveChatPreferences = (preferences) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CHAT_PREFERENCES_KEY, JSON.stringify(preferences));
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

/* =========================
   Unresolved Questions and Feedback
========================= */
// export const saveUnresolvedQuestion = async (question) => {
//   if (typeof window === 'undefined') return; // Only save on client-side
  
//   try {
//     // Use fetch to call an API endpoint that will save the question server-side
//     await fetch('/api/saveUnresolvedQuestion', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ 
//         question,
//         timestamp: new Date().toISOString() 
//       }),
//     });
//   } catch (error) {
//     console.error('Error saving unresolved question:', error);
//   }
// };

export const saveFeedback = async (question, answer, feedback, reason = null) => {
  if (typeof window === 'undefined') return; // Only save on client-side
  
  try {
    // console.log('Saving feedback:', { question, answer, feedback, reason }); // Debug log
    
    // Ensure reason is never null if negative feedback is provided
    const feedbackReason = feedback === 'negative' && !reason ? 'No specific reason provided' : reason;
    
    // Use fetch to call an API endpoint that will save the feedback server-side
    const response = await fetch('/api/saveFeedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        answer,
        feedback,
        reason: feedbackReason // Always send the reason if available
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }
    
    const result = await response.json();
    // console.log('Feedback saved successfully:', result);
    return result;
  } catch (error) {
    console.error('Error saving feedback:', error);
  }
};

/* =========================
   Response Generation
========================= */
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const getGeminiResponse = async (query, localData) => {
  try {
    // Filter relevant data based on query keywords
    const queryWords = query.toLowerCase().split(' ').filter(word => word.length > 3);
    const relevantItems = localData.filter(item => {
      const itemText = (item.question + ' ' + item.answer).toLowerCase();
      return queryWords.some(word => itemText.includes(word));
    });

    const dataToSend = relevantItems.length > 0
      ? relevantItems.map(item => `${item.answer}`).join(', ')
      : "Abhinav Academy is an educational institution in Gadhinglaj focusing on competitive exam preparation.";

    // console.log("Relevant context : ", dataToSend);


    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a friendly teacher chatbot at Abhinav Academy in Gadhinglaj.
CONTEXT: ${JSON.stringify(dataToSend)}
QUESTION: ${query}

RULES:
- For simple arithmetic, reply with just the final number.
- For complex math, provide the answer plus a brief (up to 3-step) explanation.
- For academy-related queries, answer in 1-3 concise sentences.
- If unclear or off-topic, ask for clarification.
- Use CONTEXT first; add external knowledge only if needed.
- Keep language plain, accurate, friendly and short as you can.`
          }]
          
        }],
      }),
    });

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return null;
  }
};

/**
 * Returns a response based on the query by searching through the FAQ data.
 */
export const getChatResponse = async (
  query,
  history,
  tone = 'enthusiastic'
) => {
  const processedQuery = preprocessQuery(query);
  const lowerQuery = processedQuery.toLowerCase();

  // Handle greetings
  if (/^(hi|hii|hiii|hiiii|hello|hey)\b/.test(query.trim().toLowerCase())) {
    return {
      text: "Hey there! 👋 I'm here and ready to help you with everything about Abhinav Academy!",
      type: 'greeting'
    };
  }
  if (/^(ok|done|got it|alright|cool|nice)\b/.test(query.trim().toLowerCase())) {
    return {
      text: "Great! Let me know if there's anything else I can help you with.",
      type: 'acknowledgment'
    };
  }  
  if (/\bthank\b/.test(lowerQuery)) {
    return {
      text: "You're very welcome! Let me know if there's anything else I can help with! 😊",
      type: 'thanks'
    };
  }

  // Direct keyword matching for common questions
  // if (lowerQuery.includes('location') || lowerQuery.includes('where') || lowerQuery.includes('address')) {
  //   const locationFAQ = data.find(faq => 
  //     faq.question.toLowerCase().includes('located') || 
  //     faq.question.toLowerCase().includes('where')
  //   );
  //   if (locationFAQ) return { text: String(locationFAQ.answer), type: 'faq' };
  // }
  
  // if (lowerQuery.includes('program') || lowerQuery.includes('course') || lowerQuery.includes('offer')) {
  //   const programsFAQ = data.find(faq => 
  //     faq.question.toLowerCase().includes('program') || 
  //     faq.question.toLowerCase().includes('offer')
  //   );
  //   if (programsFAQ) return { text: String(programsFAQ.answer), type: 'faq' };
  // }
  
  // if (lowerQuery.includes('admission') || lowerQuery.includes('apply') || lowerQuery.includes('enroll')) {
  //   const admissionFAQ = data.find(faq => 
  //     faq.question.toLowerCase().includes('admission') || 
  //     faq.question.toLowerCase().includes('apply')
  //   );
  //   if (admissionFAQ) return { text: String(admissionFAQ.answer), type: 'faq' };
  // }
  
  // if (lowerQuery.includes('scholarship') || lowerQuery.includes('financial')) {
  //   const scholarshipFAQ = data.find(faq => 
  //     faq.question.toLowerCase().includes('scholarship')
  //   );
  //   if (scholarshipFAQ) return { text: String(scholarshipFAQ.answer), type: 'faq' };
  // }
  
  // if (lowerQuery.includes('success') || lowerQuery.includes('rate') || lowerQuery.includes('result')) {
  //   const successFAQ = data.find(faq => 
  //     faq.question.toLowerCase().includes('success rate')
  //   );
  //   if (successFAQ) return { text: String(successFAQ.answer), type: 'faq' };
  // }
  
  // if (lowerQuery.includes('contact') || lowerQuery.includes('reach')) {
  //   const contactFAQ = data.find(faq => 
  //     faq.question.toLowerCase().includes('contact')
  //   );
  //   if (contactFAQ) return { text: String(contactFAQ.answer), type: 'faq' };
  // }

  // Fuzzy search for more general matching
  const results = fuse.search(processedQuery);
  if (results.length === 0) {
    // If no local results found, try Gemini API
    const geminiResponse = await getGeminiResponse(query, data);
    if (geminiResponse) {
      return { text: String(geminiResponse), type: 'ai' };
    }
    return { 
      text: "I'm sorry, I couldn't find any specific information about that. Could you please rephrase your question?",
      type: 'error'
    };
  }
  
  // Return the top match from local data
  const answer = String(results[0].item.data.answer);
  
  // Add emoji to make responses friendlier
  if (!answer.includes("😊") && !answer.includes("👋") && 
      !answer.includes("🙌") && !answer.includes("📚")) {
    return { text: answer + " 😊", type: 'faq' };
  }
  
  return { text: answer, type: 'faq' };
};

export const getSuggestedQuestions = (query) => {
  if (!query) {
    return [
      "What programs do you offer?",
      "Where is Abhinav Academy located?",
      "What is your success rate for competitive exams?"
    ];
  }
  
  const results = suggestFuse.search(query);
  const suggestions = [];
  
  // Get up to 3 related questions based on search results
  results.slice(0, 3).forEach(result => {
    if (isFAQ(result.item.data)) {
      suggestions.push(result.item.data.question);
    }
  });
  
  // If we don't have enough suggestions, add some default ones
  if (suggestions.length < 3) {
    const defaultQuestions = [
      "What programs do you offer?",
      "Where is Abhinav Academy located?",
      "What is your success rate for competitive exams?",
      "Do you offer scholarships?",
      "What are the admission requirements?",
      "How can I apply for admission?",
      "Do you provide online classes?",
      "What is the fee structure?"
    ];
    
    for (const q of defaultQuestions) {
      if (suggestions.length < 3 && !suggestions.includes(q)) {
        suggestions.push(q);
      }
    }
  }
  
  return suggestions.slice(0, 3); // Limit to 3 suggestions
};

// export const detectSentiment = (text) => {
//   const positiveWords = ['thanks', 'great', 'good', 'helpful', 'clear', 'excellent', 'appreciated', 'understand'];
//   const negativeWords = ['confused', 'unclear', "don't understand", 'wrong', 'bad', 'not helpful', 'useless', 'frustrated'];
//   const lowerText = text.toLowerCase();
//   const positiveMatches = positiveWords.filter(word => lowerText.includes(word)).length;
//   const negativeMatches = negativeWords.filter(word => lowerText.includes(word)).length;
//   if (positiveMatches > negativeMatches) return 'positive';
//   if (negativeMatches > positiveMatches) return 'negative';
//   return 'neutral';
// };