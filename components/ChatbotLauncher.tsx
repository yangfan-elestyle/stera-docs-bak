'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { MessageCircle } from 'lucide-react';

function getOrCreateGuestUser() {
  const key = 'elepay_chatbot_guest_user';
  const stored = localStorage.getItem(key);

  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Invalid data, regenerate
    }
  }

  const id = `guest_${Math.random().toString(36).slice(2, 11)}`;
  const name = `Guest User ${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const user = { id, name };

  localStorage.setItem(key, JSON.stringify(user));
  return user;
}

export default function ChatbotLauncher() {
  const params = useParams() as { lang?: string };
  const lang = useMemo(() => params?.lang ?? 'ja', [params]);

  const chatRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const handleToggle = useCallback(async () => {
    if (!chatRef.current) {
      // @ts-expect-error package types not exported
      const mod: any = await import('@elepay-io/chatbot');
      const AIChatBot = mod?.default ?? mod;

      const instance = new AIChatBot({
        timeout: 5000,
        url: 'https://elekb.io/entrance',
        styles: { background: '#fff' },
        payload: {
          lang: lang === 'zh' ? 'zh-CN' : lang === 'en' ? 'en-US' : 'ja-JP',
          user: getOrCreateGuestUser(),
        },
        container: containerRef.current,
        onOpen: () => setVisible(true),
        onClose: () => setVisible(false),
        onError: (error: unknown) => {
          console.debug('ChatBot Error:', error);
        },
      });

      chatRef.current = instance;
      if (typeof instance.toggle === 'function') instance.toggle(true);
      setVisible(true);
    } else {
      const current = chatRef.current;
      const nextVisible = !current?.visible;
      if (typeof current.toggle === 'function') current.toggle(nextVisible);
      setVisible(nextVisible);
    }
  }, [lang]);

  useEffect(() => {
    return () => {
      const instance = chatRef.current;
      if (instance && typeof instance.destroy === 'function') {
        try {
          instance.destroy();
        } catch {}
      }
      chatRef.current = null;
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[60]">
      <div
        ref={containerRef}
        className="pointer-events-auto fixed bottom-5 z-[70] h-[600px] w-[400px] overflow-hidden rounded-lg bg-white shadow-lg transition-all"
        style={{ right: visible ? '20px' : '-400px' }}
      />
      {!visible && (
        <button
          type="button"
          aria-label="Open chat"
          onClick={handleToggle}
          className="pointer-events-auto fixed bottom-20 right-20 z-[60] flex size-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <MessageCircle className="size-5" />
        </button>
      )}
    </div>
  );
}
