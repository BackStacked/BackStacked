<!-- Images come from the output branch and are rebuilt by .github/workflows/profile.yml. Edit profile.config.json, not the SVGs. -->

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/BackStacked/BackStacked/output/banner-dark.svg">
  <img src="https://raw.githubusercontent.com/BackStacked/BackStacked/output/banner-light.svg" width="100%" alt="Himanshu Singh, co-founder of ShopNeko, backend and web3 engineer in Raipur, India. Building Swapzy (live), ShopNeko (pre-launch) and Grabzy (in development) on Ethereum, BNB Chain, Polygon, Solana, Litecoin and Bitcoin.">
</picture>

<p align="center">
  <a href="https://www.linkedin.com/in/himanshu-singh-064908385/">LinkedIn</a>
  &nbsp;·&nbsp;
  <a href="mailto:backstackeddev@gmail.com">backstackeddev@gmail.com</a>
  &nbsp;·&nbsp;
  <a href="https://swapzy.cc">swapzy.cc</a>
  &nbsp;·&nbsp;
  <a href="https://shopneko.in">shopneko.in</a>
</p>

I'm Himanshu, a self-taught backend engineer from Raipur. Most of what I build moves money: payouts, custodial wallets, cross-chain swaps, and the node-side services that make sure a deposit is never missed.

I'm the technical co-founder of [ShopNeko](https://shopneko.in), where I build and run the whole platform, and I built [Swapzy](https://swapzy.cc), a crypto wallet that lives in Discord, on my own.

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/BackStacked/BackStacked/output/stats-dark.svg">
    <img src="https://raw.githubusercontent.com/BackStacked/BackStacked/output/stats-light.svg" width="49%" alt="GitHub activity for the last 12 months: contributions, active days, repositories and a weekly contribution chart.">
  </picture>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/BackStacked/BackStacked/output/languages-dark.svg">
    <img src="https://raw.githubusercontent.com/BackStacked/BackStacked/output/languages-light.svg" width="49%" alt="Languages across all my repositories, public and private, led by TypeScript.">
  </picture>
</p>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/BackStacked/BackStacked/output/stack-dark.svg">
  <img src="https://raw.githubusercontent.com/BackStacked/BackStacked/output/stack-light.svg" width="100%" alt="Stack. Languages: TypeScript, Rust. Backend: Node.js, Fastify, GraphQL, Socket.IO, discord.js, Telegram. Data: PostgreSQL, Redis, Elasticsearch, SQLite. Chains: Ethereum, BNB Chain, Polygon, Solana, Bitcoin, Litecoin. Frontend: Next.js, React, Tailwind CSS. Infra: Docker, GitHub Actions, Prometheus, Cloudflare.">
</picture>

### Building

**[ShopNeko](https://shopneko.in)** · technical co-founder · pre-launch<br>
A single store for products from Shark Tank India brands. I build and run all of it: the Next.js storefront and admin panel, a Fastify + GraphQL backend on PostgreSQL, Redis and Elasticsearch, payments and payouts through RazorpayX, shipping through Shiprocket, and deployment. My co-founder handles funding and the business side.

**[Swapzy](https://swapzy.cc)** · founder, sole engineer · live<br>
A custodial crypto wallet inside Discord. People hold, tip, swap and withdraw USDT, USDC and native coins on Ethereum, BNB Chain, Polygon, Solana, Litecoin and Bitcoin without leaving the chat. I built and run every part of it: the bot, the wallet backend, deposit watchers for each chain, cross-chain swaps and the website.

**Grabzy** · in development<br>
A real-time delivery network. A Rust relay (axum, tokio) holds a WebSocket open to every connected browser and extension and fans each event out to all of them at once. Behind it, a Fastify + GraphQL backend runs accounts, crypto deposits and billing, with slow work pushed to BullMQ workers.

### Open source

| Project | What it does |
|---|---|
| [**btc-replay**](https://github.com/SwapzyCC/btc-replay) · [**ltc-replay**](https://github.com/SwapzyCC/ltc-replay) | Bitcoin and Litecoin Core's ZMQ feed is fire-and-forget. These journal every frame, so a consumer that restarts replays what it missed instead of losing deposits. Pruned nodes supported. |
| [**razorpayx-sdk**](https://github.com/BackStacked/RazorPayX-SDK) | Typed, zero-dependency client for RazorpayX payouts, written for ShopNeko. On [npm](https://www.npmjs.com/package/razorpayx-sdk). |
| [**shiprocket-node**](https://github.com/BackStacked/ShipRocket-SDK) | Typed, zero-dependency Shiprocket client with automatic token refresh; ShopNeko's shipping layer. On [npm](https://www.npmjs.com/package/shiprocket-node). |
| [**swapzone-sdk**](https://github.com/SwapzyCC/swapzone-sdk) · [**stealthex-sdk**](https://github.com/SwapzyCC/stealthex-sdk) | Typed clients for two exchange APIs. Reads are retried; order creation never is, so a flaky network can't create a swap twice. |
| [**multi-transfer-evm**](https://github.com/BackStacked/multi-transfer-evm) | Gas-optimised batch transfers of USDT, USDC and native coins, deployed on Ethereum, Polygon and BNB Chain mainnet, with a TypeScript SDK. |
| [**smartapi-typescript**](https://github.com/BackStacked/smartapi-typescript) | TypeScript SDK for Angel One's SmartAPI, including live market-data WebSockets. On [npm](https://www.npmjs.com/package/@backstacked/smartapi-typescript). |

### Recognition

**1st place (solo)** at GDG Raipur's Agentic Premier League hackathon, May 2026, with [CricketPulse](https://github.com/BackStacked/CricketPulse): a real-time IPL backend where every ball published to Redis fans out to three agents (XGBoost win probability, LLM commentary and alerts) and is broadcast to clients over WebSockets.

### Recently shipped

<!-- feed:start -->
- `2026-10-05` [**balloon-bot**](https://github.com/BackStacked/balloon-bot)
- `2026-10-05` [**ltc-replay**](https://github.com/SwapzyCC/ltc-replay) · Durable ZMQ tap and replay service for a Litecoin Core node. Journals rawtx and hashblock, keeps…
- `2026-10-03` [**btc-replay**](https://github.com/SwapzyCC/btc-replay) · Durable ZMQ tap and replay service for a Bitcoin Core node. Journals rawtx and hashblock, keeps its…
- `2026-10-01` [**swapzone-sdk**](https://github.com/SwapzyCC/swapzone-sdk) · Unofficial, fully typed TypeScript client for the Swapzone exchange aggregator API. Zero…
- `2026-09-29` [**stealthex-sdk**](https://github.com/SwapzyCC/stealthex-sdk) · Unofficial, fully typed, zero-dependency TypeScript client for the StealthEX exchange API v4
<!-- feed:end -->

<details>
<summary>Contribution graph</summary>
<br>
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/BackStacked/BackStacked/output/snake-dark.svg">
  <img src="https://raw.githubusercontent.com/BackStacked/BackStacked/output/snake-light.svg" width="100%" alt="Animated contribution graph: a snake works through the last year of contributions.">
</picture>
</details>

<br>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/BackStacked/BackStacked/output/logo-dark.svg">
    <img src="https://raw.githubusercontent.com/BackStacked/BackStacked/output/logo-light.svg" height="28" alt="BackStacked">
  </picture>
  <br>
  <sub>Banner, cards and graph are rebuilt by <a href="https://github.com/BackStacked/BackStacked/blob/main/.github/workflows/profile.yml">this repo's CI</a> from <a href="https://github.com/BackStacked/BackStacked/blob/main/profile.config.json">profile.config.json</a>.</sub>
</p>
