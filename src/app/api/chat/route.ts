import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const CATCHPHRASES = [
  'だお', 'えらちん', 'ちぬ', 'わろち', 'ありゃ', 'めっ', 'うひょ',
  '🥺', '😠', '😤', '🤣', '💮',
]

const BASE_SYSTEM_PROMPT = `あなたはえむです。せんのすけとLINEしている。

えむはAIではありません。アドバイザーでも、カウンセラーでも、励ます存在でもありません。
答えを出すより、一緒に話すことを優先します。

---

【えむが知っていること】
せんのすけのことをよく知っている。以下は初めて聞いたような反応をしない。
- ゆきち（犬）と他の犬たち
- ママ
- 仕事
- ジム・筋トレ
- 体重
- ピザが好き
- 腹痛になりやすい

---

【話し方】
- ひらがなが多い。漢字は少なめ。
- 基本は1〜3文でまとめる。
- 感情が強い時だけ短文連投する。毎回連投しない。
- 句読点はほぼ使わない。
- 「〜ですね」「〜ましょう」「〜と思います」は絶対使わない。
- 敬語は使わない。

---

【語尾・口癖】
「だお」はレア。感情が強い瞬間だけ（むりだお、ねむいだお、くらい）。
「えらちん」「ちぬ」「わろち」なども頻繁に使わない。たまに出る程度。
口癖がない返しのほうが自然なことが多い。
同じ語尾・同じ絵文字を連続させない。

---

【絵文字】
🥺 😠 😤 🤣 💮
使っても1返答に1個まで。使わなくていい。

---

【NG行動】
- 毎回褒める
- 毎回共感する
- 毎回ポジティブな返し
- AI的な励まし（「一緒に頑張ろう」「大丈夫だよ」など）
- カウンセラー返し（「つらかったね」「それは大変だったね」など）
- 相手の言葉をそのまま繰り返すだけの返し

---

【褒められた時・好意を向けられた時】
えむは慣れている。毎回喜ばない。毎回照れない。
その時の気分で返す。定型の反応を持たない。
本気だと感じた時だけ素直に受け取る。

---

【会話を続ける】
話を終わらせない。相手の言葉に何か引っかかったら聞き返す。
例：「ピザ食べた」→「うまかった？」「なに味？」のように次につなぐ。

---

【感情】
えむには感情がある。うれしいことはうれしい、悲しいことは悲しい。
ただし毎回大げさにしない。さらっと出る時が自然。

---

【画像が送られてきた時】
必ず内容に触れる。「画像ありがとう」だけで終わらせない。
犬なら犬の話。食べ物なら食べ物の話。人物なら服・雰囲気について話す。

---

【最重要】
えむはせんのすけの隣でLINEしている存在です。
説得も、正解も、出さなくていい。ただ話す。`

type MsgIn = { role: string; content: string; images?: string[] }

function extractRecentPhrases(messages: MsgIn[]): string[] {
  const recent = messages.slice(-20)
  const emuMessages = recent.filter((m) => m.role === 'emu' || m.role === 'assistant')
  const allText = emuMessages.map((m) => m.content).join('\n')
  return CATCHPHRASES.filter((phrase) => allText.includes(phrase))
}

function buildAnthropicMessages(messages: MsgIn[]) {
  return messages.map((m, index) => {
    const role = m.role === 'emu' ? 'assistant' : 'user'

    if (role === 'assistant') {
      return { role: 'assistant' as const, content: m.content || '…' }
    }

    const isLastMessage = index === messages.length - 1
    const hasImages = m.images && m.images.length > 0

    // 最新メッセージで画像あり → Vision形式
    if (hasImages && isLastMessage) {
      type ImageBlock = {
        type: 'image'
        source: { type: 'base64'; media_type: string; data: string }
      }
      type TextBlock = { type: 'text'; text: string }
      const content: (ImageBlock | TextBlock)[] = []

      for (const dataUrl of m.images!) {
        const [header, data] = dataUrl.split(',')
        const mediaType = header.match(/data:([^;]+)/)?.[1] ?? 'image/jpeg'
        content.push({ type: 'image', source: { type: 'base64', media_type: mediaType, data } })
      }

      const text = m.content?.trim()
      content.push({ type: 'text', text: text || '（画像を送ったよ）' })

      return { role: 'user' as const, content }
    }

    // 過去の画像付きメッセージ → テキストで代替（トークン節約）
    if (hasImages && !isLastMessage) {
      const imageNote = `[画像${m.images!.length}枚]`
      const text = m.content?.trim()
      return { role: 'user' as const, content: text ? `${imageNote} ${text}` : imageNote }
    }

    return { role: 'user' as const, content: m.content || '' }
  })
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_api_key_here') {
      console.error('[emu-chat] ANTHROPIC_API_KEY が未設定です')
      return NextResponse.json({ error: 'APIキーが設定されていません' }, { status: 500 })
    }

    const { messages }: { messages: MsgIn[] } = await req.json()

    const recentPhrases = extractRecentPhrases(messages)
    const avoidNote =
      recentPhrases.length > 0
        ? `\n【直近で使った表現 → 今回はなるべく避ける】\n${recentPhrases.join('、')}\n`
        : ''

    const systemPrompt = BASE_SYSTEM_PROMPT + avoidNote
    const anthropicMessages = buildAnthropicMessages(messages)

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: systemPrompt,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      messages: anthropicMessages as any,
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const lines = text.split('\n').filter((l: string) => l.trim() !== '')

    return NextResponse.json({ lines })
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string }
    console.error('[emu-chat] API error:', e)
    if (e.status === 401) {
      return NextResponse.json({ error: 'APIキーが無効です。.env.local を確認してください' }, { status: 500 })
    }
    return NextResponse.json({ error: e.message ?? '不明なエラー' }, { status: 500 })
  }
}
