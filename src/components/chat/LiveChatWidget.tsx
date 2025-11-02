import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Minimize2, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Message {
  id: string;
  message: string;
  sender: 'user' | 'bot' | 'admin';
  created_at: string;
}

const LiveChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(() => `session-${Date.now()}-${Math.random()}`);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const { language, t } = useLanguage();
  const { user, initialLoadComplete } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && user && initialLoadComplete) {
      loadMessages();
      
      // Send automatic welcome message if chat is empty
      if (messages.length === 0) {
        const welcomeMsg = language === 'pl'
          ? 'Witaj w Spirit Candles! 🕯️ Jak mogę Ci pomóc? Mogę odpowiedzieć na pytania o nasze świece, wysyłkę, zwroty, zamówienia i kupony.'
          : 'Welcome to Spirit Candles! 🕯️ How can I help you? I can answer questions about our candles, shipping, returns, orders, and coupons.';
        
        supabase.from('chat_messages').insert({
          user_id: user.id,
          session_id: sessionId,
          message: welcomeMsg,
          sender: 'bot',
        }).then(() => loadMessages());
      }
      
      // Subscribe to new messages with unique channel
      const channel = supabase
        .channel(`chat-${user.id}-${sessionId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${sessionId}`
        }, (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
          scrollToBottom();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isOpen, user, sessionId, initialLoadComplete]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Show notification badge when chat is closed
  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender !== 'user') {
        setHasNewMessages(true);
      }
    } else {
      setHasNewMessages(false);
    }
  }, [isOpen, messages]);

  const loadMessages = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data as Message[]);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user) return;

    const userMessage = {
      user_id: user.id,
      session_id: sessionId,
      message: inputMessage.trim(),
      sender: 'user' as const,
    };

    setInputMessage("");

    // Insert user message
    const { error } = await supabase
      .from('chat_messages')
      .insert(userMessage);

    if (error) {
      toast.error(language === 'pl' ? 'Błąd wysyłania wiadomości' : 'Error sending message');
      return;
    }

    // Reload to show user message immediately
    await loadMessages();
    setIsTyping(true);

    // Auto-response bot
    setTimeout(async () => {
      const botResponse = getBotResponse(inputMessage.toLowerCase());
      
      await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          session_id: sessionId,
          message: botResponse,
          sender: 'bot',
        });

      // Reload after bot response
      await loadMessages();
      setIsTyping(false);
    }, 1500);
  };

  const [chatResponses, setChatResponses] = useState<any[]>([]);

  useEffect(() => {
    loadChatResponses();
  }, []);

  const loadChatResponses = async () => {
    const { data } = await supabase
      .from('chat_responses' as any)
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    if (data) {
      setChatResponses(data as any);
    }
  };

  const getBotResponse = (message: string): string => {
    const lowerMsg = message.toLowerCase();
    
    // Search through database responses
    for (const response of chatResponses) {
      const keywords = language === 'pl' 
        ? response.trigger_keywords_pl 
        : response.trigger_keywords_en;
      
      // Check if any keyword matches
      const hasMatch = keywords.some((keyword: string) => 
        lowerMsg.includes(keyword.toLowerCase())
      );
      
      if (hasMatch) {
        return language === 'pl' ? response.response_pl : response.response_en;
      }
    }
    
    // Return default response
    const defaultResponse = chatResponses.find(r => r.is_default);
    if (defaultResponse) {
      return language === 'pl' ? defaultResponse.response_pl : defaultResponse.response_en;
    }
    
    // Fallback if no database responses
    return language === 'pl'
      ? '💬 **Jak mogę Ci pomóc?**\n\nMogę odpowiedzieć na pytania o:\n• 🕯️ Nasze świece Spirit\n• 📦 Wysyłkę i dostawę\n• ↩️ Zwroty\n• 📋 Zamówienia\n• 🎁 Kupony promocyjne\n• ✨ Rekomendacje produktów'
      : '💬 **How can I help you?**\n\nI can answer questions about:\n• 🕯️ Our Spirit candles\n• 📦 Shipping & delivery\n• ↩️ Returns\n• 📋 Orders\n• 🎁 Promo coupons\n• ✨ Product recommendations';
  };

  const handleEndChat = async () => {
    if (!user) return;

    // Insert goodbye message
    const goodbyeMsg = language === 'pl'
      ? '👋 Dziękujemy za rozmowę! Mamy nadzieję, że pomogliśmy.\n\nZapraszamy ponownie! ✨\n\n- Spirit Candles Team'
      : '👋 Thank you for chatting with us! We hope we helped.\n\nCome back anytime! ✨\n\n- Spirit Candles Team';
    
    await supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        session_id: sessionId,
        message: goodbyeMsg,
        sender: 'bot',
      });

    // Wait to show goodbye, then close
    setTimeout(() => {
      setSessionId(`session-${Date.now()}-${Math.random()}`);
      setMessages([]);
      setIsOpen(false);
      
      toast.success(
        language === 'pl' ? 'Czat został zakończony' : 'Chat session ended'
      );
    }, 2500);
  };

  return (
    <>
      {/* Chat button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-primary to-accent text-white shadow-xl hover:shadow-2xl transition-shadow flex items-center justify-center"
          >
            <MessageCircle className="w-6 h-6" />
            {/* Notification dot - only show when new messages */}
            {hasNewMessages && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-card border border-border rounded-lg shadow-2xl flex flex-col"
            style={{ height: isMinimized ? 'auto' : '600px', maxHeight: 'calc(100vh - 3rem)' }}
          >
            {/* Header - fixed height with dark gradient */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 flex items-center justify-between rounded-t-lg flex-shrink-0" style={{ minHeight: '72px' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm leading-tight tracking-wide">
                    {language === 'pl' ? 'SPIRIT CZAT' : 'SPIRIT CHAT'}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <svg className="w-3 h-3 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <p className="text-xs text-white/80 leading-tight">
                      {language === 'pl' ? 'Asystenta & Info' : 'Support & Info'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {user && (
                  <button
                    onClick={handleEndChat}
                    className="p-2 hover:bg-white/10 rounded transition-colors text-white"
                    title={language === 'pl' ? 'Zakończ czat' : 'End chat'}
                  >
                    <PhoneOff className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-white/10 rounded transition-colors text-white"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded transition-colors text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages area - flex-1 to fill space */}
                <div className="flex-1 overflow-y-auto p-4 bg-background/50 min-h-0">
                  {!user ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        {language === 'pl'
                          ? 'Zaloguj się, aby rozpocząć czat'
                          : 'Please log in to start chatting'}
                      </p>
                      <Button onClick={() => window.location.href = '/auth'}>
                        {language === 'pl' ? 'Zaloguj Się' : 'Log In'}
                      </Button>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>{language === 'pl' ? 'Rozpocznij rozmowę!' : 'Start a conversation!'}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              msg.sender === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : msg.sender === 'bot'
                                ? 'bg-muted text-foreground'
                                : 'bg-accent text-accent-foreground'
                            }`}
                          >
                            <p className="text-sm break-words">{msg.message}</p>
                            <span className="text-xs opacity-70 mt-1 block">
                              {new Date(msg.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                      
                      {/* Typing indicator */}
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex justify-start"
                        >
                          <div className="bg-muted p-3 rounded-lg">
                            <div className="flex gap-1">
                              <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                        </motion.div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Input area - fixed at bottom */}
                {user && (
                  <div className="p-4 border-t border-border bg-background rounded-b-lg flex-shrink-0 space-y-2">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                      }}
                      className="flex items-center gap-2"
                    >
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder={language === 'pl' ? 'Wpisz wiadomość...' : 'Type a message...'}
                        className="flex-1"
                        disabled={isTyping}
                      />
                      <Button
                        type="submit"
                        size="icon"
                        disabled={!inputMessage.trim() || isTyping}
                        className="flex-shrink-0"
                      >
                        {isTyping ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </form>
                    {/* End chat link */}
                    <div className="text-center">
                      <button
                        onClick={handleEndChat}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
                      >
                        {t('endConversation')}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LiveChatWidget;
