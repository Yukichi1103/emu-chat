'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import ChatBubble from '@/components/ChatBubble'
import SettingsModal from '@/components/SettingsModal'
import { Message, Settings } from '@/types'

const STORAGE_KEY = 'emu-chat-messages'
const SETTINGS_KEY = 'emu-chat-settings'

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<Settings>({ bgImage: null, iconImage: null })
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setMessages(JSON.parse(saved))
    const savedSettings = localStorage.getItem(SETTINGS_KEY)
    if (savedSettings) setSettings(JSON.parse(savedSettings))
  }, [])

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    }
  }, [messages])

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      lines: [text],
      timestamp: Date.now(),
    }

    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    try {
      const history = newMessages.map((m) => ({
        role: m.role,
        content: m.lines.join('\n'),
      }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })

      const data = await res.json()
      const emuMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'emu',
        lines: data.lines,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, emuMsg])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'emu',
          lines: ['ありゃ🥺', 'ちょっとまってね'],
          timestamp: Date.now(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }, [input, loading, messages])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
  }

  const updateSettings = (s: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...s }))
  }

  const clearHistory = () => {
    setMessages([])
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center">
      {/* Phone frame wrapper (PC view) */}
      <div
        className="relative flex flex-col bg-gray-100 shadow-2xl overflow-hidden"
        style={{
          width: '100%',
          maxWidth: '430px',
          height: '100dvh',
          maxHeight: '100dvh',
        }}
      >
        {/* Background */}
        <div
          className="absolute inset-0 z-0"
          style={
            settings.bgImage
              ? {
                  backgroundImage: `url(${settings.bgImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : { backgroundColor: '#b2dfdb' }
          }
        />

        {/* Header */}
        <div className="relative z-10 flex items-center px-3 py-3 bg-[#00b900] shadow">
          <button
            onClick={() => setShowSettings(true)}
            className="w-9 h-9 rounded-full overflow-hidden mr-3 flex-shrink-0 border-2 border-white/50"
          >
            {settings.iconImage ? (
              <img src={settings.iconImage} alt="えむ" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-pink-300 flex items-center justify-center text-white text-sm font-bold">
                え
              </div>
            )}
          </button>
          <span className="text-white font-bold text-base flex-1">えむ</span>
          <button
            onClick={() => setShowSettings(true)}
            className="text-white/80 text-sm px-2 py-1 rounded-lg hover:bg-white/20 transition"
          >
            ⚙️
          </button>
        </div>

        {/* Messages */}
        <div className="relative z-10 flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {messages.length === 0 && (
            <div className="flex justify-center mt-8">
              <span className="text-xs text-white/70 bg-black/20 px-3 py-1 rounded-full">
                えむとのチャットがはじまるよ🥺
              </span>
            </div>
          )}
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} iconImage={settings.iconImage} />
          ))}
          {loading && (
            <div className="flex items-end gap-2 mb-1">
              <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                {settings.iconImage ? (
                  <img src={settings.iconImage} alt="えむ" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-pink-300 flex items-center justify-center text-white text-sm font-bold">
                    え
                  </div>
                )}
              </div>
              <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="relative z-10 bg-white/90 backdrop-blur border-t border-gray-200 px-3 py-2">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="メッセージを入力"
              rows={1}
              className="flex-1 resize-none bg-gray-100 rounded-2xl px-4 py-2 text-sm text-gray-800 outline-none focus:bg-white focus:ring-2 focus:ring-green-400 transition max-h-24"
              style={{ height: 'auto', minHeight: '40px' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-full bg-[#4cd964] flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:bg-green-500 active:scale-95 transition"
            >
              <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 rotate-90">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
          <p className="text-center text-[10px] text-gray-400 mt-1">思い出を支えるチャット</p>
        </div>
      </div>

      {showSettings && (
        <SettingsModal
          settings={settings}
          onUpdate={updateSettings}
          onClose={() => setShowSettings(false)}
          onClearHistory={clearHistory}
        />
      )}
    </div>
  )
}
