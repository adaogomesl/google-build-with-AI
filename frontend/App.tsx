import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { Dashboard } from './components/Dashboard';
import { chatService } from './services/gemini';
import { getGeorgiaWaterData } from './services/waterData';
import { Message, WaterDataResponse } from './types';

const INITIAL_MESSAGE: Message = {
  id: 'init-1',
  role: 'assistant',
  text: "Hello. I am the Coastal Georgia Water Resilience Assistant. I monitor live chemical data from the Savannah River coastal station to help our community understand water safety and infrastructure risks, particularly concerning saltwater intrusion.\n\nHow can I assist you with local water concerns today?",
  timestamp: new Date()
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<WaterDataResponse[]>([]);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsDashboardLoading(true);
      try {
        const data = await getGeorgiaWaterData();
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsDashboardLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleSendMessage = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const responseText = await chatService.sendMessage(text);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: responseText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Failed to get response:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: "I encountered an error while analyzing the water matrix data. Please try asking your question again.",
        isError: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 font-sans">
      <Header />
      
      <main className="flex-1 overflow-y-auto scroll-smooth flex flex-col">
        <Dashboard data={dashboardData} isLoading={isDashboardLoading} />
        
        <div className="p-4 md:p-6 flex-1">
          <div className="max-w-4xl mx-auto flex flex-col">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            
            {isLoading && (
              <div className="flex w-full justify-start mb-6">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div className="bg-white border border-slate-100 px-5 py-4 rounded-2xl rounded-tl-none shadow-sm text-slate-500 text-sm flex items-center gap-2">
                    <span className="animate-pulse">Analyzing coastal matrix data</span>
                    <span className="flex gap-1">
                      <span className="animate-bounce delay-75">.</span>
                      <span className="animate-bounce delay-150">.</span>
                      <span className="animate-bounce delay-300">.</span>
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
}