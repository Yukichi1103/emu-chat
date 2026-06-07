'use client'

import { useRef } from 'react'
import { Settings } from '@/types'

interface Props {
  settings: Settings
  onUpdate: (s: Partial<Settings>) => void
  onClose: () => void
  onClearHistory: () => void
}

export default function SettingsModal({ settings, onUpdate, onClose, onClearHistory }: Props) {
  const bgRef = useRef<HTMLInputElement>(null)
  const iconRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File, key: 'bgImage' | 'iconImage') => {
    const reader = new FileReader()
    reader.onload = (e) => {
      onUpdate({ [key]: e.target?.result as string })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-800 text-center">設定</h2>

        <div>
          <p className="text-sm text-gray-500 mb-2">背景画像</p>
          <div className="flex gap-2">
            <button
              onClick={() => bgRef.current?.click()}
              className="flex-1 py-2 bg-gray-100 rounded-xl text-sm text-gray-700 hover:bg-gray-200 transition"
            >
              画像を選ぶ
            </button>
            {settings.bgImage && (
              <button
                onClick={() => onUpdate({ bgImage: null })}
                className="px-3 py-2 bg-red-100 rounded-xl text-sm text-red-600 hover:bg-red-200 transition"
              >
                削除
              </button>
            )}
          </div>
          <input
            ref={bgRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0], 'bgImage')}
          />
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-2">えむのアイコン画像</p>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => iconRef.current?.click()}
              className="flex-1 py-2 bg-gray-100 rounded-xl text-sm text-gray-700 hover:bg-gray-200 transition"
            >
              画像を選ぶ
            </button>
            {settings.iconImage && (
              <>
                <img
                  src={settings.iconImage}
                  alt="icon"
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                />
                <button
                  onClick={() => onUpdate({ iconImage: null })}
                  className="px-3 py-2 bg-red-100 rounded-xl text-sm text-red-600 hover:bg-red-200 transition"
                >
                  削除
                </button>
              </>
            )}
          </div>
          <input
            ref={iconRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0], 'iconImage')}
          />
        </div>

        <button
          onClick={() => {
            if (confirm('会話履歴を削除しますか？')) {
              onClearHistory()
              onClose()
            }
          }}
          className="w-full py-2 bg-red-50 rounded-xl text-sm text-red-500 hover:bg-red-100 transition"
        >
          会話履歴を削除
        </button>

        <button
          onClick={onClose}
          className="w-full py-3 bg-[#4cd964] rounded-xl text-white font-bold hover:bg-green-500 transition"
        >
          閉じる
        </button>
      </div>
    </div>
  )
}
