import React, { useMemo } from 'react';
import { marked } from 'marked';
import { AlertCircle, Bot, User } from 'lucide-react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAssistant = message.role === 'assistant';

  // Parse markdown safely
  const htmlContent = useMemo(() => {
    if (message.isError) return message.text;
    try {
      return marked.parse(message.text, { async: false }) as string;
    } catch (e) {
      return message.text;
    }
  }, [message.text, message.isError]);

  return (
    <div className={`flex w-full ${isAssistant ? 'justify-start' : 'justify-end'} mb-6`}>
      <div className={`flex max-w-[90%] md:max-w-[80%] gap-3 ${isAssistant ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Avatar */}
        <div className="shrink-0 mt-1">
          {isAssistant ? (
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white shadow-sm">
              <Bot size={18} />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 shadow-sm">
              <User size={18} />
            </div>
          )}
        </div>

        {/* Message Bubble */}
        <div 
          className={`
            relative px-5 py-4 rounded-2xl shadow-sm text-sm md:text-base overflow-x-auto
            ${message.isError 
              ? 'bg-red-50 border border-red-200 text-red-800' 
              : isAssistant 
                ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-none' 
                : 'bg-teal-600 text-white rounded-tr-none'
            }
          `}
        >
          {message.isError ? (
            <div className="flex items-center gap-2">
              <AlertCircle size={18} />
              <span>{message.text}</span>
            </div>
          ) : (
            <div 
              className={`
                prose prose-sm md:prose-base max-w-none
                ${isAssistant ? 'prose-slate' : 'prose-invert'}
                /* Custom styling for the Community Bulletin format */
                [&>h3]:text-teal-800 [&>h3]:font-bold [&>h3]:text-lg [&>h3]:mt-5 [&>h3:first-child]:mt-0 [&>h3]:mb-3 [&>h3]:border-b-2 [&>h3]:border-teal-100 [&>h3]:pb-2 [&>h3]:flex [&>h3]:items-center [&>h3]:gap-2
                [&>p]:mb-4 [&>p:last-child]:mb-0 [&>p]:leading-relaxed
                /* Bulleted Action Items Styling */
                [&>ul]:list-none [&>ul]:pl-0 [&>ul]:mb-4 [&>ul]:space-y-2
                [&>ul>li]:relative [&>ul>li]:pl-6 [&>ul>li]:leading-relaxed
                [&>ul>li::before]:content-['→'] [&>ul>li::before]:absolute [&>ul>li::before]:left-0 [&>ul>li::before]:text-teal-600 [&>ul>li::before]:font-bold
                [&>strong]:font-semibold [&>strong]:text-teal-900
                /* Table styling */
                [&>table]:w-full [&>table]:mb-5 [&>table]:border-collapse [&>table]:text-sm [&>table]:bg-slate-50 [&>table]:rounded-lg [&>table]:overflow-hidden
                [&_th]:bg-teal-50 [&_th]:border-b-2 [&_th]:border-teal-200 [&_th]:py-3 [&_th]:px-4 [&_th]:text-left [&_th]:font-semibold [&_th]:text-teal-900
                [&_td]:border-b [&_td]:border-slate-200 [&_td]:py-3 [&_td]:px-4
                [&_tr:last-child_td]:border-b-0
              `}
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          )}
          
          <div className={`text-[10px] mt-3 text-right ${isAssistant ? 'text-slate-400' : 'text-teal-200'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};