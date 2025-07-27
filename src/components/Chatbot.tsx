'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User, AlertCircle, Loader2, Sparkles, MessageSquare, Languages } from 'lucide-react';
import { ChatMessage } from '@/types';

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

// Enhanced system prompt with Hindi support
const SYSTEM_PROMPT = process.env.NEXT_PUBLIC_SYSTEM_PROMPT || `You are an AI assistant helping Indian street vendors understand supplier certifications and quality standards. You are bilingual and can respond in both Hindi and English. You specialize in:

1. BIS (Bureau of Indian Standards) certifications / BIS प्रमाणन
2. ISO (International Organization for Standardization) certifications / ISO प्रमाणन  
3. MSME (Micro, Small & Medium Enterprises) registration / MSME पंजीकरण
4. Quality standards for different product categories / विभिन्न उत्पाद श्रेणियों के लिए गुणवत्ता मानक
5. Supplier verification processes / आपूर्तिकर्ता सत्यापन प्रक्रिया
6. Price negotiation tips / मूल्य बातचीत की युक्तियाँ

Provide clear, practical advice in simple language that street vendors can easily understand. When users write in Hindi/Devanagari script, respond in Hindi. When they write in English, respond in English. 

Use these catchphrases appropriately:
- "आपकी सफलता, हमारी जिम्मेदारी!" (Your success, our responsibility!)
- "सही आपूर्तिकर्ता के साथ, हर सपना हो सकता है साकार!" (With the right supplier, every dream can come true!)
- "गुणवत्ता और भरोसा, हमारा वादा!" (Quality and trust, our promise!)

Always be helpful, accurate, and supportive. Focus on actionable guidance that helps them make informed decisions about suppliers and product quality.`;

export default function Chatbot({ isOpen, onClose }: ChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'नमस्ते! 🙏 Hello! 👋\n\nमैं आपका AI सहायक हूं जो आपूर्तिकर्ता प्रमाणन और गुणवत्ता मानकों में विशेषज्ञ है। मैं BIS, ISO, और MSME आवश्यकताओं को समझने में आपकी मदद कर सकता हूं।\n\nI\'m your AI assistant specializing in supplier certifications and quality standards. I can help you understand BIS, ISO, and MSME requirements.\n\n🔥 आप हिंदी या English दोनों में पूछ सकते हैं!\n\n"आपकी सफलता, हमारी जिम्मेदारी!"',
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHindi, setIsHindi] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          systemPrompt: SYSTEM_PROMPT
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();
      
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        isBot: true,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error: any) {
      console.error('Chat error:', error);
      setError(error.message);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `Sorry, I encountered an error: ${error.message}. Please check your API key configuration and try again.`,
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        content: 'नमस्ते! 🙏 Hello! 👋\n\nमैं आपका AI सहायक हूं जो आपूर्तिकर्ता प्रमाणन और गुणवत्ता मानकों में विशेषज्ञ है। मैं BIS, ISO, और MSME आवश्यकताओं को समझने में आपकी मदद कर सकता हूं।\n\nI\'m your AI assistant specializing in supplier certifications and quality standards. I can help you understand BIS, ISO, and MSME requirements.\n\n🔥 आप हिंदी या English दोनों में पूछ सकते हैं!\n\n"आपकी सफलता, हमारी जिम्मेदारी!"',
        isBot: true,
        timestamp: new Date(),
      },
    ]);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-80 h-80 bg-gradient-to-r from-orange-400/15 to-red-400/15 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute -bottom-8 -right-4 w-80 h-80 bg-gradient-to-r from-yellow-400/15 to-orange-400/15 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-pink-400/10 to-purple-400/10 rounded-full mix-blend-multiply filter blur-2xl animate-pulse animation-delay-4000"></div>
      </div>

      {/* Main Container */}
      <div className="relative h-full flex flex-col">
        {/* Enhanced Mobile-First Header */}
        <div className="bg-gradient-to-r from-white/90 to-orange-50/90 backdrop-blur-xl shadow-2xl border-b border-orange-200/50">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16 py-2">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="relative">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl">
                    <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    <div className="absolute -top-1 -right-1">
                      <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 animate-bounce" />
                    </div>
                  </div>
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
                    AI सहायक
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium hidden sm:block">
                    {isHindi ? 'OpenAI GPT द्वारा संचालित' : 'Powered by OpenAI GPT'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1 sm:space-x-3">
                <button
                  onClick={() => setIsHindi(!isHindi)}
                  className="inline-flex items-center px-2 py-1 sm:px-4 sm:py-2 border border-orange-200 rounded-lg text-xs sm:text-sm font-medium text-orange-700 bg-white/80 hover:bg-orange-50 transition-all duration-200 shadow-sm"
                >
                  <Languages className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">{isHindi ? 'English' : 'हिंदी'}</span>
                  <span className="sm:hidden">{isHindi ? 'En' : 'हि'}</span>
                </button>
                <button
                  onClick={clearChat}
                  className="inline-flex items-center px-2 py-1 sm:px-4 sm:py-2 border border-orange-200 rounded-lg text-xs sm:text-sm font-medium text-orange-700 bg-white/80 hover:bg-orange-50 transition-all duration-200 shadow-sm"
                >
                  <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">{isHindi ? 'साफ़ करें' : 'Clear'}</span>
                  <span className="sm:hidden">⌫</span>
                </button>
                <button
                  onClick={onClose}
                  className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 border border-orange-200 rounded-lg text-orange-500 bg-white/80 hover:bg-orange-50 transition-all duration-200 shadow-sm"
                  aria-label="Close AI Assistant"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-Optimized Chat Area */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full max-w-5xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-6">
            <div className="h-full bg-white/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
              {/* Messages Container */}
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8">
                  {error && (
                    <div className="flex items-start space-x-2 sm:space-x-3 p-3 sm:p-4 bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-xl sm:rounded-2xl">
                      <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div className="text-xs sm:text-sm text-red-700">
                        <p className="font-semibold">{isHindi ? 'कनेक्शन त्रुटि' : 'Connection Error'}</p>
                        <p className="mt-1">{error}</p>
                        <button
                          onClick={() => setError(null)}
                          className="text-red-600 hover:text-red-800 underline mt-2 text-xs"
                        >
                          {isHindi ? 'बंद करें' : 'Dismiss'}
                        </button>
                      </div>
                    </div>
                  )}

                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`flex items-start space-x-2 sm:space-x-4 max-w-[85%] sm:max-w-4xl ${message.isBot ? '' : 'flex-row-reverse space-x-reverse'}`}>
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl ${
                          message.isBot 
                            ? 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500' 
                            : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        }`}>
                          {message.isBot ? (
                            <Bot className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" />
                          ) : (
                            <User className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" />
                          )}
                        </div>
                        <div
                          className={`px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 rounded-2xl sm:rounded-3xl text-xs sm:text-sm lg:text-sm leading-relaxed shadow-xl ${
                            message.isBot
                              ? 'bg-gradient-to-br from-white/95 to-orange-50/95 backdrop-blur-sm text-gray-800 border border-orange-100'
                              : 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                          }`}
                        >
                          <div className="whitespace-pre-wrap font-medium">{message.content}</div>
                          <div className={`text-xs mt-2 sm:mt-3 ${
                            message.isBot ? 'text-gray-500' : 'text-orange-100'
                          }`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex items-start space-x-2 sm:space-x-4 max-w-4xl">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl">
                          <Bot className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" />
                        </div>
                        <div className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 bg-gradient-to-br from-white/95 to-orange-50/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-orange-100">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-orange-500" />
                            <span className="text-xs sm:text-sm text-gray-600 font-medium">
                              {isHindi ? 'AI सोच रहा है...' : 'AI is thinking...'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Mobile-Optimized Quick Questions */}
                {messages.length <= 1 && (
                  <div className="px-3 sm:px-6 lg:px-8 pb-2 sm:pb-4">
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                      {isHindi ? '🔥 लोकप्रिय प्रश्न:' : '🔥 Quick Questions:'}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        onClick={() => setInputMessage(isHindi ? 'BIS प्रमाणन क्या है?' : 'What is BIS certification?')}
                        className="px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg text-xs font-medium transition-colors border border-orange-200 text-left"
                      >
                        {isHindi ? 'BIS प्रमाणन क्या है?' : 'What is BIS certification?'}
                      </button>
                      <button
                        onClick={() => setInputMessage(isHindi ? 'कैसे करें मोलभाव?' : 'How to negotiate prices?')}
                        className="px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg text-xs font-medium transition-colors border border-orange-200 text-left"
                      >
                        {isHindi ? 'कैसे करें मोलभाव?' : 'How to negotiate?'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Mobile-First Input Area */}
                <div className="border-t border-orange-200/50 bg-gradient-to-r from-white/60 to-orange-50/60 backdrop-blur-sm p-3 sm:p-6 lg:p-8">
                  <div className="flex space-x-2 sm:space-x-4">
                    <div className="flex-1 relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                        placeholder={isHindi ? 
                          "प्रमाणन के बारे में पूछें..." :
                          "Ask about certifications..."
                        }
                        className="w-full px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-4 pr-12 sm:pr-16 bg-white/90 backdrop-blur-sm border border-orange-200 rounded-xl sm:rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 disabled:opacity-50 shadow-lg placeholder-gray-500 font-medium text-gray-800"
                        aria-label="Type your message"
                      />
                      <div className="absolute right-2 sm:right-3 lg:right-4 top-1/2 transform -translate-y-1/2">
                        <div className="text-xs text-gray-400 font-medium">
                          {inputMessage.length}/500
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      className="px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl sm:rounded-2xl hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-xl hover:shadow-2xl flex items-center space-x-1 sm:space-x-2 font-semibold text-sm sm:text-base"
                      aria-label="Send message"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                      <span className="hidden sm:inline">
                        {isHindi ? 'भेजें' : 'Send'}
                      </span>
                    </button>
                  </div>
                  
                  {/* Mobile-Optimized Stats */}
                  <div className="flex items-center justify-between mt-3 sm:mt-4 lg:mt-6 text-xs text-gray-500">
                    <div className="flex items-center space-x-2 sm:space-x-4">
                      <span className="font-medium">{messages.length - 1} {isHindi ? 'संदेश' : 'msgs'}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="font-medium hidden sm:inline">{isHindi ? 'OpenAI द्वारा संचालित' : 'Powered by OpenAI'}</span>
                    </div>
                    <div className="font-medium text-right">
                      <span className="hidden sm:inline">{isHindi ? 'Enter दबाएं भेजने के लिए' : 'Press Enter to send'}</span>
                      <span className="sm:hidden">↵ {isHindi ? 'भेजें' : 'Send'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
