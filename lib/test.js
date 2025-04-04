import Fuse from 'fuse.js';
import compromise from 'compromise';

import { useContext, useEffect } from 'react';
import { DataContext } from '../app/layout';

// Global data variable that will be used throughout the file
let data = {}; // Initialize as empty object

// Function to update the global data
export const updateGlobalData = (apiData) => {
  data = apiData; // Update the main data variable
  // console.log("API data stored in global data variable:", data);
  
  // Re-initialize searchable data and Fuse index when data changes
  initializeSearchData();
};

// Keep the separate globalData1 for reference if needed
let globalData1 = null;

// Function to get external data from context
export const useExternalData = () => {
  const { data1, loading } = useContext(DataContext);
  console.log("data1 from hook:", data1);
  
  // Update global data when context changes
  useEffect(() => {
    if (data1) {
      globalData1 = data1;
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

function isCourse(item) {
  return item && typeof item.name === 'string' && typeof item.duration === 'string' && typeof item.description === 'string';
}

function isImportantDate(item) {
  return item && typeof item.event === 'string' && typeof item.date === 'string';
}

function isContact(item) {
  return item && typeof item.address === 'string' && typeof item.phone === 'string';
}

function isSuccessStats(item) {
  return item && typeof item.overview === 'string' && Array.isArray(item.stats);
}

/* =========================
   Synonym Preprocessing & NLP
========================= */
// Domain-specific synonyms mapping
const synonyms = {
  campus: 'contact',
  institute: 'contact',
  facility: 'contact'
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

// Initialize searchable data and fuse index
const initializeSearchData = () => {
  // Skip if data is not yet loaded or doesn't have required properties
  if (!data || !data.faqs || !data.courses) {
    console.log("Data not fully loaded yet, skipping search initialization");
    return;
  }

  // console.log("Initializing searchable data with updated API data");
  
  searchableData = [
    ...data.faqs.map((faq) => ({
      type: 'faq',
      searchText: `${faq.question} ${faq.answer}`,
      data: faq
    })),
    ...data.courses.competitive.map((course) => ({
      type: 'competitive-course',
      searchText: `${course.name} ${course.description}`,
      data: course
    })),
    ...data.courses.supplementary.map((course) => ({
      type: 'supplementary-course',
      searchText: `${course.name} ${course.description}`,
      data: course
    })),
    ...data.importantDates.map((date) => ({
      type: 'date',
      searchText: `${date.event} ${date.date} ${date.description}`,
      data: date
    })),
    {
      type: 'contact',
      searchText: `contact address phone email website hours ${JSON.stringify(data.contact)}`,
      data: data.contact
    },
    {
      type: 'success-stats',
      searchText: `success statistics results achievements ${JSON.stringify(data.successStats)}`,
      data: data.successStats
    }
  ];

  const fuseOptions = {
    includeScore: true,
    threshold: 0.3,
    keys: ['searchText']
  };

  fuse = new Fuse(searchableData, fuseOptions);
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
export const saveUnresolvedQuestion = async (question) => {
  if (typeof window === 'undefined') return; // Only save on client-side
  
  try {
    // Use fetch to call an API endpoint that will save the question server-side
    await fetch('/api/saveUnresolvedQuestion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        question,
        timestamp: new Date().toISOString() 
      }),
    });
  } catch (error) {
    console.error('Error saving unresolved question:', error);
  }
};

export const saveFeedback = async (question, answer, feedback, reason = null) => {
  if (typeof window === 'undefined') return; // Only save on client-side
  
  try {
    console.log('Saving feedback:', { question, answer, feedback, reason }); // Debug log
    
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
        reason: feedbackReason, // Always send the reason if available
        timestamp: new Date().toISOString()
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Feedback saved successfully:', result);
    return result;
  } catch (error) {
    console.error('Error saving feedback:', error);
  }
};

/* =========================
   Gemini API Integration
========================= */
// Function to check if a question is related to education/academy
const isEducationRelated = (query) => {
  const educationKeywords = [
    'academy', 'student', 'education', 'course', 'class', 'teach', 'learn', 'study',
    'exam', 'test', 'school', 'college', 'university', 'faculty', 'professor',
    'teacher', 'lecture', 'curriculum', 'syllabus', 'homework', 'assignment',
    'degree', 'certificate', 'diploma', 'academic', 'scholarship', 'tuition',
    'campus', 'admission', 'enroll', 'register', 'program', 'institute',
    'jee', 'neet', 'cet', 'entrance', 'competitive', 'coaching', 'tutoring',
    'abhinav', 'gadhinglaj', 'maharashtra', 'physics', 'chemistry', 'biology', 'mathematics'
  ];
  
  const lowerQuery = query.toLowerCase();
  return educationKeywords.some(keyword => lowerQuery.includes(keyword));
};

// Function to get response from Gemini API
export const getGeminiResponse = async (query) => {
  if (!isEducationRelated(query)) {
    return "I can only answer questions related to Abhinav Academy and education. Could you please ask something about our courses, admissions, or educational programs?";
  }
  
  try {
    // Make sure we have data before proceeding
    if (!data || Object.keys(data).length === 0) {
      return "I'm currently initializing. Please try again in a moment.";
    }
    
    // Format the dataset as a string, handling potential circular references
    let datasetString;
    try {
      datasetString = JSON.stringify(data);
    } catch (err) {
      console.error('Error stringifying data:', err);
      datasetString = JSON.stringify({
        faqs: data.faqs || [],
        courses: data.courses || { competitive: [], supplementary: [] },
        importantDates: data.importantDates || [],
        contact: data.contact || [],
        successStats: data.successStats || { overview: "", stats: [] },
        testimonials: data.testimonials || []
      });
    }

    // Direct call to Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCgDoEkZW03ejD43rKRkn9F3jvuh_KDUOc`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Give all short simple meaningful responses like a friend/teacher/guide and responses must be in human understandable format (like talking human with human, meaning plain text only; don't use bold/italic or any kind of stylish text etc.). Use the following dataset to generate the most accurate response if information is wrong/inaccurate in the sentence of user query then edit and make it accurate.

                  DATASET: ${datasetString}

                  USER QUERY: ${query}

                  If answer not available in dataset then give your best response and note this is abhinav academy gadhinglaj bot so here you only chat with student and give information about academy if user ask some other info except education then dont give him info give him response like anything and make sure to maintain privacy`
                }
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API responded with status: ${response.status}`);
    }

    const responseData = await response.json();
    
    // Properly access the response data
    const botReply = responseData?.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't find an answer.";

    return botReply;
  } catch (error) {
    console.error('Error getting Gemini response:', error);
    return "I'm currently having trouble processing that question. Could you try asking something about our courses or admission process?";
  }
};

/* =========================
   Deep Research Response Generation
========================= */
/**
 * Returns a detailed response based on the query.
 * It first checks for explicit keywords (internship, cet, jee, neet, testimonials, contact)
 * and returns specific data; if nothing explicit matches, it falls back to Fuse.js fuzzy search.
 * If no results are found, it tries using Gemini API as a fallback.
 */
export const getChatResponse = async (
  query,
  history,
  tone = 'enthusiastic'
) => {
  // Ensure data is loaded before proceeding
  if (!data || Object.keys(data).length === 0 || !fuse) {
    console.log("Data not fully loaded yet, initializing with empty data");
    data = data || {
      faqs: [],
      courses: { competitive: [], supplementary: [] },
      importantDates: [],
      contact: [],
      successStats: { overview: "", stats: [] },
      testimonials: []
    };
    
    // Try to initialize searchable data if not done already
    if (!fuse) {
      initializeSearchData();
    }
  }

  const processedQuery = preprocessQuery(query);
  const lowerQuery = processedQuery.toLowerCase();

  // Use regex with word boundaries to check for greetings only if query starts with them.
  if (/^(hi|hii|hiii|hiiii|hello|hey)\b/.test(query.trim().toLowerCase())) {
    return "Hey there! 👋 I'm here and ready to help you with everything about Abhinav Academy!";
  }
  if (/^(ok|done|got it|alright|cool|nice)\b/.test(query.trim().toLowerCase())) {
    return "Great! Let me know if there's anything else I can help you with.";
  }  
  if (/\bthank\b/.test(lowerQuery)) {
    return "You're very welcome! Let me know if there's anything else I can help with! 😊";
  }

  // --- Explicit Keyword Conditions ---

  // Internship opportunities
  if (lowerQuery.includes('internship') || lowerQuery.includes('intern')) {
    const internshipFAQ = data.faqs?.find((faq) =>
      faq.question.toLowerCase().includes('internship')
    );
    if (internshipFAQ) {
      return internshipFAQ.answer;
    }
  }

  // MHT-CET / CET: combine deadline info and course details
  if (lowerQuery.includes('mht-cet') || lowerQuery.includes('cet')) {
    const cetDate = data.importantDates?.find((d) =>
      d.event.toLowerCase().includes('mht-cet registration')
    );
    let response = "";
    if (cetDate) {
      response += `MHT-CET Registration is scheduled for ${cetDate.date}. ${cetDate.description}\n`;
    }
    const course = data.courses?.competitive?.find((c) =>
      c.name.toLowerCase().includes('mht-cet')
    );
    if (course) {
      response += `${course.name} (${course.duration}): ${course.description}`;
      if (course.highlights && course.highlights.length) {
        response += ` Highlights: ${course.highlights.join(", ")}.`;
      }
      return response;
    }
  }

  // JEE (but not NEET or Advanced)
  if (lowerQuery.includes('jee') && !lowerQuery.includes('neet') && !lowerQuery.includes('advanced')) {
    const jeeDate = data.importantDates?.find((d) =>
      d.event.toLowerCase().includes('jee mains')
    );
    let response = "";
    if (jeeDate) {
      response += `JEE Mains Session is scheduled for ${jeeDate.date}. ${jeeDate.description}\n`;
    }
    const course = data.courses?.competitive?.find((c) =>
      c.name.toLowerCase().includes('jee') && !c.name.toLowerCase().includes('advanced')
    );
    if (course) {
      response += `${course.name} (${course.duration}): ${course.description}`;
      if (course.highlights && course.highlights.length) {
        response += ` Highlights: ${course.highlights.join(", ")}.`;
      }
      return response;
    }
  }

  // NEET: deadline and course details
  if (lowerQuery.includes('neet')) {
    const neetDate = data.importantDates?.find((d) =>
      d.event.toLowerCase().includes('neet application deadline')
    );
    let response = "";
    if (neetDate) {
      response += `NEET Application Deadline is scheduled for ${neetDate.date}. ${neetDate.description}\n`;
    }
    const course = data.courses?.competitive?.find((c) =>
      c.name.toLowerCase().includes('neet')
    );
    if (course) {
      response += `${course.name} (${course.duration}): ${course.description}`;
      if (course.highlights && course.highlights.length) {
        response += ` Highlights: ${course.highlights.join(", ")}.`;
      }
      return response;
    }
  }

  // Testimonials & Feedback
  if (lowerQuery.includes('testimonial') || lowerQuery.includes('feedback')) {
    if (data.testimonials && Array.isArray(data.testimonials) && data.testimonials.length > 0) {
      let testimonialResponse = "Testimonials:\n\n";
      data.testimonials.forEach((t) => {
        testimonialResponse += `${t.name}: "${t.feedback}"\n\n`;
      });
      return testimonialResponse;
    }
  }
  if (lowerQuery.includes('rahul patil')) {
    const testimonial = data.testimonials?.find((t) =>
      t.name.toLowerCase() === "rahul patil"
    );
    if (testimonial) {
      return `${testimonial.name}: "${testimonial.feedback}"`;
    }
  }

  // Contact info
  if (
    lowerQuery.includes('contact') ||
    lowerQuery.includes('phone') ||
    lowerQuery.includes('email') ||
    lowerQuery.includes('address') ||
    lowerQuery.includes('website') ||
    lowerQuery.includes('hours')
  ) {
    const contacts = data.contact;
    if (contacts && contacts.length > 0) {
      let response = "Here are our contact details:\n\n";
      contacts.forEach((contact, index) => {
        response += `Contact ${index + 1}:\nAddress: ${contact.address}\nPhone: ${contact.phone}\nEmail: ${contact.email}\nWebsite: ${contact.website}\nWorking Hours: ${contact.hours}\n\n`;
      });
      return response;
    }
  }

  // --- Fallback: Fuse.js Fuzzy Search ---
  // Check if fuse is initialized
  if (fuse) {
    const results = fuse.search(processedQuery);
    if (results.length > 0) {
      const topResults = results.slice(0, 2);
      const responses = [];
      topResults.forEach(result => {
        const { type, data: itemData } = result.item;
        let res = "";
        if (type === 'faq' && isFAQ(itemData)) {
          res = itemData.answer;
        } else if ((type === 'competitive-course' || type === 'supplementary-course') && isCourse(itemData)) {
          res = `${itemData.name} (${itemData.duration}): ${itemData.description}`;
          if (itemData.highlights && itemData.highlights.length) {
            res += ` Highlights: ${itemData.highlights.join(", ")}.`;
          }
        } else if (type === 'date' && isImportantDate(itemData)) {
          res = `${itemData.event} is scheduled for ${itemData.date}. ${itemData.description}`;
        } else if (type === 'contact') {
          if (Array.isArray(itemData)) {
            const contacts = itemData;
            if (contacts.length > 0 && isContact(contacts[0])) {
              res = `Contact Abhinav Academy at ${contacts[0].phone} or visit us at ${contacts[0].address}.`;
            }
          } else if (isContact(itemData)) {
            res = `Contact Abhinav Academy at ${itemData.phone} or visit us at ${itemData.address}.`;
          }
        } else if (type === 'success-stats') {
          if (Array.isArray(itemData)) {
            const statsArray = itemData;
            res = statsArray
              .map(stats => `${stats.overview} Details: ${stats.stats.map(s => `${s.exam}: ${s.success} (${s.toppers} toppers)`).join("; ")}`)
              .join(" | ");
          } else if (isSuccessStats(itemData)) {
            res = `${itemData.overview} Details: ${itemData.stats.map(s => `${s.exam}: ${s.success} (${s.toppers} toppers)`).join("; ")}`;
          }
        }
        if (res) {
          responses.push(res);
        }
      });
      
      if (responses.length > 0) {
        let finalResponse = responses.join("\n\n");
        // Always add emoji to make responses friendlier
        if (!finalResponse.includes("😊") && !finalResponse.includes("👋") && 
            !finalResponse.includes("🙌") && !finalResponse.includes("📚")) {
          finalResponse += " 😊";
        }
        return finalResponse;
      }
    }
  }
  
  // If no results found with existing methods, try Gemini
  return await getGeminiResponse(query);
};

export const getSuggestedQuestions = (query) => {
  if (!query) {
    return [
      "What programs do you offer for IIT-JEE?",
      "Tell me about your NEET preparation courses",
      "How can I enroll in your academy?",
      "What's your success rate for competitive exams?",
      "Do you provide online coaching?",
      "Are there any scholarships available?"
    ];
  }
  
  // Check if fuse is initialized
  if (!fuse) {
    return [
      "What programs do you offer for IIT-JEE?",
      "Tell me about your NEET preparation courses",
      "How can I enroll in your academy?"
    ];
  }
  
  const results = fuse.search(query);
  const suggestions = [];
  results.slice(0, 3).forEach(result => {
    const { type, data } = result.item;
    if (type === 'faq' && isFAQ(data)) {
      suggestions.push(data.question);
    } else if ((type === 'competitive-course' || type === 'supplementary-course') && isCourse(data)) {
      suggestions.push(`Tell me more about ${data.name}`);
    } else if (type === 'date' && isImportantDate(data)) {
      suggestions.push(`When is ${data.event}?`);
    }
  });
  if (suggestions.length < 3) {
    const defaults = [
      "What programs do you offer for IIT-JEE?",
      "Tell me about your NEET preparation courses",
      "How can I enroll in your academy?",
      "What's your success rate for competitive exams?",
      "Do you provide online coaching?",
      "Are there any scholarships available?",
      "What are the eligibility criteria for your courses?",
      "Can I get a demo session?"
    ];
    for (const s of defaults) {
      if (suggestions.length < 3 && !suggestions.includes(s)) {
        suggestions.push(s);
      }
    }
  }
  return suggestions.slice(0, 3); // Limit to 3 suggestions
};

export const detectSentiment = (text) => {
  const positiveWords = ['thanks', 'great', 'good', 'helpful', 'clear', 'excellent', 'appreciated', 'understand'];
  const negativeWords = ['confused', 'unclear', "don't understand", 'wrong', 'bad', 'not helpful', 'useless', 'frustrated'];
  const lowerText = text.toLowerCase();
  const positiveMatches = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeMatches = negativeWords.filter(word => lowerText.includes(word)).length;
  if (positiveMatches > negativeMatches) return 'positive';
  if (negativeMatches > positiveMatches) return 'negative';
  return 'neutral';
};

export const getRelevantDateReminder = () => {
  // Check if data and importantDates exist
  if (!data || !data.importantDates || !Array.isArray(data.importantDates)) {
    return null;
  }
  
  const now = new Date();
  const upcoming = data.importantDates
    .filter((date) => {
      try {
        const eventDate = new Date(date.date);
        const diffDays = Math.floor((eventDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
        return diffDays > 0 && diffDays < 30;
      } catch (error) {
        console.error('Error processing date:', date, error);
        return false;
      }
    })
    .sort((a, b) => {
      try {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } catch (error) {
        console.error('Error sorting dates:', a, b, error);
        return 0;
      }
    });
    
  if (upcoming.length > 0) {
    const next = upcoming[0];
    return `Reminder: ${next.event} is on ${next.date}. ${next.description}`;
  }
  return null;
};