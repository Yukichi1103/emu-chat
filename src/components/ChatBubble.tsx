'use client'

import { useState } from 'react'
import { Message } from '@/types'

interface Props {
  message: Message
  iconImage: string | null
}

export default function ChatBubble({ message, iconImage }: Props) {
  const isUser = message.role === 'user'
  const [enlargedImg, setEnlargedImg] = useState<string | null>(null)
  const hasImages = message.images && message.images.length > 0
  const hasLines = message.lines.some((l) => l.trim() !== '')

  return (
    <>
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

        <div className={`flex flex-col gap-1 max-w-[72%] ${isUser ? 'items-end' : 'items-start'}`}>
          {/* 画像グリッド */}
          {hasImages && (
            <div
              className={`grid gap-1 ${
                message.images!.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
              }`}
            >
              {message.images!.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  onClick={() => setEnlargedImg(img)}
                  className="rounded-2xl object-cover cursor-pointer"
                  style={{
                    width: message.images!.length === 1 ? '180px' : '108px',
                    height: message.images!.length === 1 ? '180px' : '108px',
                  }}
                />
              ))}
            </div>
          )}

          {/* テキスト吹き出し */}
          {hasLines &&
            message.lines.map((line, i) => (
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

      {/* 拡大モーダル */}
      {enlargedImg && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setEnlargedImg(null)}
        >
          <img
            src={enlargedImg}
            alt=""
            className="max-w-full max-h-full rounded-xl object-contain"
          />
          <button
            className="absolute top-5 right-5 text-white text-3xl leading-none"
            onClick={() => setEnlargedImg(null)}
          >
            ×
          </button>
        </div>
      )}
    </>
  )
}
