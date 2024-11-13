### TRWA LAUNCHPAD BOT

![TRWA](assets/img1.png)

TRWA Bot is a powerful tool designed for you to automate TRWA Testnet airdrop.

## Prerequisite

- Git
- Node JS (v22)
- Base Sepolia ETH balance

---

## BOT FEATURE
- Multi Account 
- Support PK & SEED
- Auto Claim TRWA Faucet
- Auto Claim USDC Faucet
- Auto Stake


---

## TRWA TESTNET INCENTIVE

New Incentivized Testnet : RWA Launchpad
Network : Base Sepolia

Mint TRWA 
➡️ [Go to here](https://sepolia.basescan.org/address/0x219BA210Ef31613390df886763099D0eD35aa6B8#writeContract)
- Connect New Metamask 
- Click Claim Token


Mint USDC 
➡️ [Go to here](https://base-sepolia.blockscout.com/address/0x6Ac3aB54Dc5019A2e57eCcb214337FF5bbD52897?tab=write_contract)
- Connect New Metamask 
- Click Mint
- Enter Your Address 
- Input 1000000000 to mint USDC 
- Done


➡️ Go to : [Here](https://launch.rwa.inc/)

➖ Connect

➖ Click Account Setup

➖ Click Stake RWA

➖ Input 50% - 70% RWA

➖ Back to Account Setup

➖ Complete KYC Just 5 Minutes

➖ Done

📌 You can claim daily RWA token & stake for get Higher Tier
📌 The RWA world's first ecosystem utilizing the latest web3 technology to launch fractional assets on the blockchain : https://x.com/RWA_Inc_/status/1846189771795710099
📌 How to get ETH Base Sepolia ?
- Bridge ETH Testnet here : 
- https://rinkeby.orbiter.finance/?source=Sepolia&dest=Base%20Sepolia&token=ETH
- https://superbridge.app/base-sepolia
- Done


---

## Setup & Configure BOT

### Linux
1. Clone project repo
   ```
   git clone https://github.com/Rambeboy/trwa-launchpad-bot.git && cd trwa-launchpad-bot
   ```
2. Run
   ```
   npm install && npm run setup
   ```
3. Configure your accounts
   ```
   nano accounts/accounts.js
   ```
4. Configure the bot config
   ```
   nano config/config.js
   ```
5. Configure the proxy
   ```
   nano config/proxy_list.js
   ```
6. Run Bot
   ```
   npm run start
   ```
   
### Windows

1. Open your `Command Prompt` or `Power Shell`.
2. Clone project repository
   ```
   git clone https://github.com/Rambeboy/trwa-launchpad-bot.git && cd trwa-launchpad-bot
   ```
3. Run 
   ```
   npm install && npm run setup
   ```
5. Navigate to `trwa-launchpad-bot` directory. 
6. Navigate to `accounts` folder and rename `accounts_tmp.js` to `accounts.js`.
7. Now open `acccounts.js` and setup your accounts.
8. Navigate to `config` and adjust the `config.js` as needed.
9. Also Configure proxy if you want to use proxy, by open `proxy_list.js`. (if you have 5 accounts, proxy is required)
10. Back to `trwa-launchpad-bot` directory.
11. To start the app open your `Command Prompt` or `Power Shell`
12. Run Bot
    ```
    npm run start
    ```

## Update Bot

To update bot follow this step :
1. run
   ```
   git pull
   ```
   or
   ```
   git pull --rebase
   ```
   if error run
   ```
   git stash && git pull
   ```
2. run
   ```
   npm update
   ```
2. start the bot


## IMPORTANT NOTE (READ IT THIS IS NOT DECORATION)
DWYOR & Always use a new wallet when running the bot, I am not responsible for any loss of assets.

This bot is unencrypted , use it to learn about how to interact with evm smart contract, so when there is any new testnet or airdrop in the future , you can just develop based on this bot template, but please give me a credit. star and fork it.

## CONTRIBUTE

Feel free to fork and contribute adding more feature thanks.

---

## LICENSE

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
