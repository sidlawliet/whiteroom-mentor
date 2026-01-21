import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthGuard from './components/AuthGuard';
import { LandingPage } from './components/LandingPage';
import { ChatInterface } from './components/ChatInterface';
import { ViewState, Difficulty, ChatSession, Message } from './types';



const InnerApp: React.FC = () => {
  const { user } = useAuth();
  const [view, setView] = useState<ViewState>(ViewState.LANDING);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setSessions([]);
      setCurrentSessionId(null);
      setView(ViewState.LANDING);
      return;
    }

    const key = `wr_sessions_${user.uid}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSessions(parsed);
      } catch (e) {
        console.error("Failed to load sessions", e);
        setSessions([]);
      }
    } else {
      setSessions([]);
    }
  }, [user]);

  useEffect(() => {
    if (user && sessions.length > 0) {
      const key = `wr_sessions_${user.uid}`;
      localStorage.setItem(key, JSON.stringify(sessions));
    }
  }, [sessions, user]);

  const finalizeSession = (sessionId: string) => {
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          messages: s.messages.map(m => ({ ...m, hasAnimated: true }))
        };
      }
      return s;
    }));
  };

  const handleStart = (selectedDifficulty: Difficulty) => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      lastActive: Date.now(),
      difficulty: selectedDifficulty,
      preview: "New Session",
      messages: [
        {
          id: 'welcome',
          role: 'model',
          content: "I am ready. Present your subject. Do not expect me to just give you answers; I will force you to understand the logic yourself.",
          timestamp: Date.now(),
          hasAnimated: false
        }
      ]
    };

    if (currentSessionId) {
      finalizeSession(currentSessionId);
    }

    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setView(ViewState.CHAT);
  };

  const handleUpdateSession = (updatedMessages: Message[]) => {
    if (!currentSessionId) return;

    setSessions(prev => prev.map(session => {
      if (session.id === currentSessionId) {
        const lastUserMsg = [...updatedMessages].reverse().find(m => m.role === 'user');
        const preview = lastUserMsg ? lastUserMsg.content.slice(0, 40) + (lastUserMsg.content.length > 40 ? '...' : '') : session.preview;

        return {
          ...session,
          messages: updatedMessages,
          lastActive: Date.now(),
          preview
        };
      }
      return session;
    }).sort((a, b) => b.lastActive - a.lastActive));
  };

  const handleSwitchSession = (sessionId: string) => {
    if (currentSessionId) {
      finalizeSession(currentSessionId);
    }
    setCurrentSessionId(sessionId);
    setView(ViewState.CHAT);
  };

  const handleNewChat = () => {
    if (currentSessionId) {
      finalizeSession(currentSessionId);
    }
    setCurrentSessionId(null);
    setView(ViewState.LANDING);
  };

  const currentSession = sessions.find(s => s.id === currentSessionId);

  return (
    <AuthGuard>
      <main className="min-h-screen bg-wr-white text-wr-text selection:bg-wr-text selection:text-wr-white font-light">
        {view === ViewState.LANDING ? (
          <LandingPage onStart={handleStart} />
        ) : (
          currentSession && (
            <ChatInterface
              session={currentSession}
              onUpdateSession={handleUpdateSession}
              allSessions={sessions}
              onSwitchSession={handleSwitchSession}
              onNewChat={handleNewChat}
            />
          )
        )}
      </main>
    </AuthGuard>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  );
};

export default App;