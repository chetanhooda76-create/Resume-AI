import { useState, useRef, useEffect } from 'react';
import API from '../services/api';
import { Send, Sparkles, X, MessageSquare, Bot, User } from 'lucide-react';

const AIAssistant = ({ isOpen, onClose, onApplyImprovedText }) => {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! I am your AI Resume Assistant. Ask me anything about resume writing, formatting, templates, or request tips. You can also write 'Suggest skills for Software Engineer' or ask how to make descriptions sound more impactful!",
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = inputText;
    setInputText('');
    setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const history = messages.map((m) => ({
        sender: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await API.post('/ai/chat', {
        message: userMessage,
        chatHistory: history,
      });

      if (res.data.success) {
        setMessages((prev) => [...prev, { sender: 'bot', text: res.data.reply }]);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Sorry, I encountered an issue. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-slate-800 bg-slate-900 shadow-2xl transition-all sm:max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4 bg-slate-950">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-bold text-white text-sm">Resume AI Assistant</span>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'bot' && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-950 border border-indigo-500/20 text-indigo-400">
                <Bot className="h-4 w-4" />
              </div>
            )}
            <div
              className={`rounded-xl px-3.5 py-2 text-xs leading-relaxed max-w-[80%] ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 border border-slate-700/50'
              }`}
              style={{ whiteSpace: 'pre-line' }}
            >
              {msg.text}
            </div>
            {msg.sender === 'user' && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-2.5 justify-start">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-950 border border-indigo-500/20 text-indigo-400">
              <Bot className="h-4 w-4 animate-pulse" />
            </div>
            <div className="rounded-xl px-3.5 py-2.5 text-xs bg-slate-800 text-slate-400 border border-slate-700/50 flex items-center gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]"></span>
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]"></span>
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Footer input */}
      <form onSubmit={handleSendMessage} className="border-t border-slate-800 p-4 bg-slate-950">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
            placeholder="Ask AI for advice or formatting tips..."
            className="w-full rounded-lg border border-slate-800 bg-slate-900 py-2.5 pl-3 pr-10 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="absolute right-1.5 rounded-md bg-indigo-600 p-1.5 text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AIAssistant;
