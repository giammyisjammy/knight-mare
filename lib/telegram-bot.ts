// Examples here: https://gitlab.com/Athamaxy/telegram-bot-tutorial/-/blob/main/Nodejs/TutorialBot.ts
import { Bot } from 'grammy'

// import dotenv from 'dotenv' // TODO verify correct loading

import * as config from '@/lib/config'

// dotenv.config() // TODO verify correct loading

// Create a new bot instance
export const bot = new Bot(config.telegram.token)

bot.catch((ctx) => {
  console.error(ctx.message)
})

// Start the Bot
bot.start()
