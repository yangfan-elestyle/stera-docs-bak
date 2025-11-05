'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { MessageCircle, X } from 'lucide-react';

export default function ChatbotLauncher() {
  const params = useParams() as { lang?: string };
  const lang = useMemo(() => params?.lang ?? 'ja', [params]);

  const chatRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);
  const errorRef = useRef<HTMLDivElement | null>(null);
  const [opening, setOpening] = useState(false);
  const [visible, setVisible] = useState(false);

  const handleToggle = useCallback(async () => {
    try {
      if (!chatRef.current) {
        setOpening(true);
        // @ts-expect-error package types not exported
        const mod: any = await import('@elepay-io/chatbot');
        const AIChatBot = mod?.default ?? mod;

        const instance = new AIChatBot({
          timeout: 20000,
          url: 'https://elekb.io/entrance',
          styles: { background: '#fff' },
          payload: {
            lang: lang === 'zh' ? 'zh-CN' : lang === 'en' ? 'en-US' : 'ja-JP',
            menu: {
              id: typeof window !== 'undefined' ? window.location.href : '',
              name: typeof document !== 'undefined' ? document.title : 'Docs',
            },
            token: 'mock',
            env: 'staging',
          },
          container: containerRef.current,
          loadingElement: loadingRef.current,
          errorElement: errorRef.current,
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
    } finally {
      setOpening(false);
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
        className="pointer-events-auto fixed bottom-[20px] z-[70] h-[600px] w-[400px] select-none overflow-hidden rounded-lg bg-white shadow-lg transition-all"
        style={{ right: visible ? '20px' : '-400px' }}
      />

      <div
        ref={loadingRef}
        style={{ display: 'none' }}
        className="pointer-events-auto fixed bottom-[20px] right-[20px] z-[69] flex h-[600px] w-[400px] items-center justify-center rounded-lg bg-gray-50 shadow-lg"
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="text-lg font-medium text-gray-700">Loading...</div>
          <div className="flex space-x-2">
            <span className="size-2 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.3s]"></span>
            <span className="size-2 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.15s]"></span>
            <span className="size-2 animate-bounce rounded-full bg-blue-500"></span>
          </div>
        </div>
      </div>

      <div
        ref={errorRef}
        style={{ display: 'none' }}
        className="pointer-events-auto fixed bottom-[20px] right-[20px] z-[69] flex h-[600px] w-[400px] items-center justify-center rounded-lg bg-red-50 p-4 shadow-lg"
      >
        <div className="flex flex-col items-center space-y-3">
          <div className="text-lg font-semibold text-red-600">Error</div>
          <div className="text-sm text-red-500">Failed to load chatbot</div>
          <button
            onClick={() => window.location.reload()}
            className="rounded bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-700"
          >
            Reload
          </button>
        </div>
      </div>

      <button
        type="button"
        aria-label={visible ? 'Close chat' : 'Open chat'}
        onClick={handleToggle}
        disabled={opening}
        className="pointer-events-auto fixed bottom-[80px] right-[80px] z-[60] inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {visible ? (
          <X className="h-5 w-5" />
        ) : (
          <MessageCircle className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}
