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

// // Store bot screaming status
// let screaming = false

// // This function handles the /scream command
// bot.command('scream', () => {
//   screaming = true
// })

// // This function handles /whisper command
// bot.command('whisper', () => {
//   screaming = false
// })

// // Pre-assign menu text
// const firstMenu =
//   '<b>Menu 1</b>\n\nA beautiful menu with a shiny inline button.'
// const secondMenu =
//   '<b>Menu 2</b>\n\nA better menu with even more shiny inline buttons.'

// // Pre-assign button text
// const nextButton = 'Next'
// const backButton = 'Back'
// const tutorialButton = 'Tutorial'

// // Build keyboards
// const firstMenuMarkup = new InlineKeyboard().text(nextButton, nextButton)

// const secondMenuMarkup = new InlineKeyboard()
//   .text(backButton, backButton)
//   .text(tutorialButton, 'https://core.telegram.org/bots/tutorial')

// // This handler sends a menu with the inline buttons we pre-assigned above
// bot.command('menu', async (ctx) => {
//   await ctx.reply(firstMenu, {
//     parse_mode: 'HTML',
//     reply_markup: firstMenuMarkup
//   })
// })

// // This handler processes back button on the menu
// bot.callbackQuery(backButton, async (ctx) => {
//   //Update message content with corresponding menu section
//   await ctx.editMessageText(firstMenu, {
//     reply_markup: firstMenuMarkup,
//     parse_mode: 'HTML'
//   })
// })

// // This handler processes next button on the menu
// bot.callbackQuery(nextButton, async (ctx) => {
//   // Update message content with corresponding menu section
//   await ctx.editMessageText(secondMenu, {
//     reply_markup: secondMenuMarkup,
//     parse_mode: 'HTML'
//   })
// })

// // This function would be added to the dispatcher as a handler for messages coming from the Bot API
// bot.on('message', async (ctx) => {
//   // Print to console
//   console.log(
//     `${ctx.from.first_name} wrote ${
//       'text' in ctx.message ? ctx.message.text : ''
//     }`
//   )

//   if (screaming && ctx.message.text) {
//     // Scream the message
//     await ctx.reply(ctx.message.text.toUpperCase(), {
//       entities: ctx.message.entities
//     })
//   } else {
//     // This is equivalent to forwarding, without the sender's name
//     await ctx.copyMessage(ctx.message.chat.id)
//   }
// })

bot.catch((ctx) => {
  console.error(ctx.message)
})

// Start the Bot
bot.start()
