// Examples here: https://gitlab.com/Athamaxy/telegram-bot-tutorial/-/blob/main/Nodejs/TutorialBot.ts
import { Bot } from 'grammy'

import dotenv from 'dotenv'

import { getEnv } from './get-config-value'

dotenv.config()

// Create a new bot instance
export const bot = new Bot(getEnv('NEXT_TELEGRAM_TOKEN'))

export const CHAT_ID = Number(getEnv('NEXT_TELEGRAM_CHAT_ID'))
export const MESSAGE_THREAD_ID = Number(
  getEnv('NEXT_TELEGRAM_MESSAGE_THREAD_ID')
)

bot.catch((ctx) => {
  console.error(ctx.message)
})

// Start the Bot
bot.start()
