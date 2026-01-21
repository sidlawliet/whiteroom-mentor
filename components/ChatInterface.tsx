import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message, ChatSession } from '../types';
import { generateResponse } from '../services/geminiService';
import { MentorAvatar } from './MentorAvatar';
import { Button } from './Button';
import { Typewriter } from './Typewriter';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';

interface ChatInterfaceProps {
  session: ChatSession;
  onUpdateSession: (messages: Message[]) => void;
  allSessions: ChatSession[];
  onSwitchSession: (sessionId: string) => void;
  onNewChat: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  session,
  onUpdateSession,
  allSessions,
  onSwitchSession,
  onNewChat
}) => {
  const { user, signOut } = useAuth();

  const [messages, setMessages] = useState<Message[]>(session.messages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [currentFocus, setCurrentFocus] = useState<string>('INITIALIZATION');


  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    setMessages(session.messages);
    setCurrentFocus('RESUMED');
  }, [session.id, session.messages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnimationComplete = (messageId: string) => {
    const updatedMessages = messages.map(msg =>
      msg.id === messageId ? { ...msg, hasAnimated: true } : msg
    );
    setMessages(updatedMessages);
    onUpdateSession(updatedMessages);
    scrollToBottom();
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !attachedImage) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      image: attachedImage || undefined,
      timestamp: Date.now(),
      hasAnimated: true,
    };


    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    onUpdateSession(updatedMessages);

    setInput('');
    setAttachedImage(null);
    setIsLoading(true);

    try {

      const { text, focus } = await generateResponse(
        userMessage.content,
        messages,
        session.difficulty,
        userMessage.image
      );

      if (focus) {
        setCurrentFocus(focus.toUpperCase().replace(/ /g, '_'));
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: text,
        timestamp: Date.now(),
        hasAnimated: false,
      };

      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);
      onUpdateSession(finalMessages);

    } catch (error: any) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: `An external error occurred: ${error.message || 'Unknown error'}. My processing was interrupted.`,
        timestamp: Date.now(),
        hasAnimated: false,
      };
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      onUpdateSession(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(timestamp));
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-wr-wall overflow-hidden relative">


      <div className={`absolute inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}>
      </div>


      <div className={`absolute top-0 left-0 h-full w-80 bg-white border-r border-wr-border z-50 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-wr-border flex items-center justify-between bg-gray-50">
          <span className="font-mono text-xs tracking-widest uppercase font-bold">Session History</span>
          <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-black">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="p-4">
          <Button variant="secondary" className="w-full text-xs" onClick={() => { setIsSidebarOpen(false); onNewChat(); }}>
            + Initialize New Session
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {allSessions.map((s) => (
            <button
              key={s.id}
              onClick={() => { onSwitchSession(s.id); setIsSidebarOpen(false); }}
              className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors group relative ${session.id === s.id ? 'bg-gray-50' : ''}`}
            >
              {session.id === s.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />}

              <div className="flex justify-between items-start mb-1">
                <span className={`text-[10px] font-mono border px-1 rounded ${s.difficulty === 'WHITE_ROOM' ? 'border-red-200 text-red-700 bg-red-50' :
                  s.difficulty === 'STANDARD' ? 'border-gray-300 text-gray-600' : 'border-green-200 text-green-700'
                  }`}>
                  {s.difficulty === 'WHITE_ROOM' ? 'WR' : s.difficulty.substring(0, 3)}
                </span>
                <span className="text-[10px] text-gray-400 font-mono">{formatDate(s.lastActive)}</span>
              </div>
              <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">
                {s.preview || "Empty Session"}
              </p>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-wr-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
              <UserIcon size={14} className="text-gray-500" />
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-xs font-medium text-gray-900 truncate">{user?.displayName || 'Student'}</div>
              <div className="text-[10px] text-gray-500 font-mono truncate">{user?.email}</div>
            </div>
          </div>

          <button
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 py-2 border border-transparent hover:border-red-100 transition-all rounded"
          >
            <LogOut size={12} />
            <span>TERMINATE SESSION</span>
          </button>

          <div className="text-[9px] text-gray-300 font-mono text-center mt-4">
            SYSTEM ID: WR-738A7
          </div>
        </div>
      </div>



      <div className="w-full md:w-1/2 h-[40vh] md:h-full">
        <MentorAvatar isThinking={isLoading} />
      </div>


      <div className="w-full md:w-1/2 h-[60vh] md:h-full flex flex-col relative bg-wr-white">


        <div className="h-12 border-b border-wr-border flex items-center justify-between px-6 bg-white z-10 shadow-sm">
          <div className="flex items-center gap-4 md:gap-6">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-gray-400 hover:text-black transition-colors"
              title="History"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>

            <div className="flex items-center gap-2 overflow-hidden">
              <div className={`w-1 h-1 rounded-full flex-shrink-0 ${currentFocus !== 'INITIALIZATION' && currentFocus !== 'RESUMED' ? 'bg-red-500' : 'bg-gray-300'}`} />
              <span className="font-mono text-[10px] text-gray-400 uppercase tracking-wider truncate">
                Focus: <span className="text-black font-semibold ml-1">{currentFocus}</span>
              </span>
            </div>
          </div>
          <span className="font-mono text-[10px] text-gray-400 uppercase tracking-wider hidden md:inline-block">Mode: {session.difficulty}</span>
        </div>


        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-wr-wall/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in group`}
            >
              <div className="flex items-center gap-2 mb-1 opacity-50 text-[10px] font-mono uppercase tracking-widest text-gray-500">
                {msg.role === 'user' ? 'STUDENT' : 'MENTOR'}
              </div>
              <div
                className={`max-w-[85%] p-6 text-sm md:text-base leading-relaxed relative shadow-sm border ${msg.role === 'user'
                  ? 'bg-wr-text text-white border-black rounded-tr-none rounded-bl-lg rounded-tl-lg rounded-br-lg'
                  : 'bg-white text-wr-text border-wr-border rounded-tl-none rounded-tr-lg rounded-bl-lg rounded-br-lg'
                  }`}
              >

                {msg.role === 'model' && <div className="absolute top-0 left-0 w-1 h-full bg-red-600/80" />}

                {msg.image && (
                  <img src={msg.image} alt="Uploaded" className="max-w-full h-auto mb-4 border border-gray-200" />
                )}
                <div className="whitespace-pre-wrap font-light">
                  {msg.role === 'model' && msg.hasAnimated === false ? (
                    <Typewriter
                      text={msg.content}
                      onComplete={() => handleAnimationComplete(msg.id)}
                    />
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>


        <div className="p-6 bg-white border-t border-wr-border shadow-[0_-5px_20px_rgba(0,0,0,0.02)] z-20">
          {attachedImage && (
            <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 border border-gray-200 w-fit">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-mono text-gray-500 uppercase">Data Attached</span>
              <button onClick={() => setAttachedImage(null)} className="ml-2 text-gray-400 hover:text-black">×</button>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex gap-4 items-end">
            <div className="relative flex-1 group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Input query..."
                className="w-full bg-gray-50 border border-gray-200 focus:border-black focus:bg-white text-black p-4 outline-none transition-all font-light placeholder-gray-400 font-mono text-sm"
                disabled={isLoading}
              />

              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-transparent group-focus-within:border-red-500 transition-colors" />
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-400 hover:text-black transition-colors p-3 border border-transparent hover:border-gray-200 bg-gray-50"
              title="Upload Data"
              disabled={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </button>

            <Button type="submit" isLoading={isLoading} disabled={!input && !attachedImage}>
              EXECUTE
            </Button>
          </form>
        </div>

      </div>
    </div>
  );
};