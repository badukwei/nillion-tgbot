# Nillionly fans Telegram Bot 🤖

## Project Description

A secure Telegram bot powered by Nillion's advanced encryption technology that enables private photo sharing with end-to-end encryption. Built with Node.js and the Telegraf framework.

## Short Description

Secure photo sharing Telegram bot with Nillion encryption for maximum privacy and security!

## How it's Made

We built this bot using a powerful combination of technologies:

* Node.js & TypeScript: For type-safe backend development
* Telegraf: For Telegram bot framework integration
* Nillion SDK: For advanced encryption capabilities
  * @nillion/client-react-hooks
  * @nillion/client-vms
  * @nillion/client-wasm

The bot leverages Nillion's encryption technology to provide secure photo storage and sharing. Photos are processed using Sharp for optimization before being encrypted and stored. The bot runs on Vercel's serverless infrastructure using their KV storage for data persistence.

Key features include:

* End-to-end encrypted photo storage
* Secure photo retrieval
* Image compression and thumbnail generation
* User account management
* Command-based interaction

## Getting Started

### Run locally

1. Run `yarn` to install dependencies
2. Run `yarn dev` to start the bot locally

### Simply use the bot

Use the bot [@nillion_private_storage_bot](https://t.me/nillion_private_storage_bot)

## Project Structure

```bash
nillion-telegram-bot/
├── src/
│   ├── callbacks/
│   ├── commands/
│   ├── core/
│   ├── text/
│   ├── utils/
│   └── index.ts
├── public/
└── package.json
```

## Attribution

1. This bot is built using the Nillion storage API and [Telegraf: For Telegram bot framework integration](https://github.com/sollidy/telegram-bot-vercel-boilerplate)
2. This project is supported by ETH Belgrade hackerhouse
