"use client"
import React, { createContext, useEffect, useState } from 'react';
import './globals.css';
import { updateGlobalData } from '../lib/chatUtils';

// Create the data context (store)
export const DataContext = createContext(null);


export default function RootLayout({ children }) {
  const [data1, setData1] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_DATA_URL}/chatbot`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        console.log('Fetched data:', result.data);
        setData1(result.data);
        // Also update the global data in chatUtils
        updateGlobalData(result.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen transition-colors duration-300">
        <DataContext.Provider value={{ data1, loading }}>
          {children}
        </DataContext.Provider>
      </body>
    </html>
  );
} 