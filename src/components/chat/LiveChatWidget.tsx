import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Minimize2 } from "lucide-react";
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
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random()}`);
  const { language } = useLanguage();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && user) {
      loadMessages();
      // Subscribe to new messages
      const channel = supabase
        .channel('chat-messages')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${sessionId}`
        }, (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isOpen, user, sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user) return;

    const userMessage = {
      user_id: user.id,
      session_id: sessionId,
      message: inputMessage.trim(),
      sender: 'user' as const,
    };

    // Insert user message
    const { error } = await supabase
      .from('chat_messages')
      .insert(userMessage);

    if (error) {
      toast.error(language === 'pl' ? 'Błąd wysyłania wiadomości' : 'Error sending message');
      return;
    }

    setInputMessage("");
    setIsTyping(true);

    // Reload messages immediately
    await loadMessages();

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

      // Reload messages again after bot response
      await loadMessages();
      setIsTyping(false);
    }, 1500);
  };

  const getBotResponse = (message: string): string => {
    const keywords = {
      wysyłka: language === 'pl' 
        ? 'Wysyłamy za pomocą Furgonetka. Darmowa dostawa przy zamówieniach powyżej 200 PLN. Standardowa dostawa trwa 2-4 dni robocze.'
        : 'We ship via Furgonetka. Free shipping on orders over 200 PLN. Standard delivery takes 2-4 business days.',
      shipping: language === 'pl' 
        ? 'Wysyłamy za pomocą Furgonetka. Darmowa dostawa przy zamówieniach powyżej 200 PLN. Standardowa dostawa trwa 2-4 dni robocze.'
        : 'We ship via Furgonetka. Free shipping on orders over 200 PLN. Standard delivery takes 2-4 business days.',
      zwrot: language === 'pl'
        ? 'Oferujemy 30-dniowy okres zwrotu. Produkty muszą być nieużywane i w oryginalnym opakowaniu.'
        : 'We offer a 30-day return period. Products must be unused and in original packaging.',
      returns: language === 'pl'
        ? 'Oferujemy 30-dniowy okres zwrotu. Produkty muszą być nieużywane i w oryginalnym opakowaniu.'
        : 'We offer a 30-day return period. Products must be unused and in original packaging.',
      zamówienie: language === 'pl'
        ? 'Możesz sprawdzić status swojego zamówienia w panelu użytkownika. Potrzebujesz pomocy z konkretnym zamówieniem?'
        : 'You can check your order status in your user dashboard. Need help with a specific order?',
      order: language === 'pl'
        ? 'Możesz sprawdzić status swojego zamówienia w panelu użytkownika. Potrzebujesz pomocy z konkretnym zamówieniem?'
        : 'You can check your order status in your user dashboard. Need help with a specific order?',
      produkt: language === 'pl'
        ? 'Mamy szeroki wybór świec sojowych ręcznie robionych. Sprawdź naszą kolekcję w sklepie!'
        : 'We have a wide selection of handmade soy candles. Check our collection in the shop!',
      products: language === 'pl'
        ? 'Mamy szeroki wybór świec sojowych ręcznie robionych. Sprawdź naszą kolekcję w sklepie!'
        : 'We have a wide selection of handmade soy candles. Check our collection in the shop!',
    };

    for (const [key, response] of Object.entries(keywords)) {
      if (message.toLowerCase().includes(key.toLowerCase())) {
        return response;
      }
    }

    return language === 'pl'
      ? 'Dziękuję za wiadomość! Jak mogę Ci pomóc? Mogę odpowiedzieć na pytania o wysyłkę, zwroty, zamówienia lub produkty.'
      : 'Thank you for your message! How can I help you? I can answer questions about shipping, returns, orders, or products.';
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
            {/* Notification dot */}
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
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
            className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-card border border-border rounded-lg shadow-2xl overflow-hidden"
            style={{ height: isMinimized ? 'auto' : '600px', maxHeight: isMinimized ? 'auto' : 'calc(100vh - 3rem)' }}
          >
            {/* Header */}
            <div className="bg-slate-900 p-4 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    {language === 'pl' ? 'Czat Na Żywo' : 'Live Chat'}
                  </h3>
                  <p className="text-xs text-white/70">
                    {language === 'pl' ? 'Odpowiadamy szybko' : 'We reply quickly'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-white/10 rounded transition-colors text-white"
                >
                  <Minimize2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/10 rounded transition-colors text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages area */}
                <div className="h-[calc(100%-8rem)] overflow-y-auto p-4 bg-background/50">
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
                            <p className="text-sm">{msg.message}</p>
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

                {/* Input area */}
                {user && (
                  <div className="p-4 border-t border-border bg-background">
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
