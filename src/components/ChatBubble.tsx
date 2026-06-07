'use client'

import { Message } from '@/types'

interface Props {
  message: Message
  iconImage: string | null
}

export default function ChatBubble({ message, iconImage }: Props) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex mb-1 ${isUser ? 'justify-end' : 'justify-start'} items-end gap-2`}>
      {!isUser && (
        <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 self-end mb-1">
          {iconImage ? (
            <img src={iconImage} alt="えむ" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-pink-300 flex items-center justify-center text-white text-sm font-bold">
              え
            </div>
          )}
        </div>
      )}

      <div className={`flex flex-col gap-1 max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
        {message.lines.map((line, i) => (
          <div
            key={i}
            className={`px-3 py-2 rounded-2xl text-sm leading-relaxed break-words ${
              isUser
                ? 'bg-[#4cd964] text-white rounded-br-sm'
                : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
            }`}
          >
            {line}
          </div>
        ))}
      </div>

      {isUser && <div className="w-9 flex-shrink-0" />}
    </div>
  )
}
