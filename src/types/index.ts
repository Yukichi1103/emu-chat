export type Role = 'user' | 'emu'

export interface Message {
  id: string
  role: Role
  lines: string[]
  timestamp: number
}

export interface Settings {
  bgImage: string | null
  iconImage: string | null
}
