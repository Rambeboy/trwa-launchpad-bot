import { accountLists } from "./accounts/accounts.js";
import { Config } from "./config/config.js";
import { proxyList } from "./config/proxy_list.js";
import Core from "./src/core/core.js";
import sqlite from "./src/core/db/sqlite.js";
import { Helper } from "./src/utils/helper.js";
import logger from "./src/utils/logger.js";

async function operation(acc, proxy) {
  const core = new Core(acc, proxy);
  try {
    await core.connectWallet();
    await core.getBalance();
    await core.conectRwaDapps();

    await core.claimTrwa();
    await core.mintUsdc();

    await core.getStakingPoolList();
    const targetPool = core.targetPool;
    for (const item of core.stakingPool.filter(
      (item) =>
        targetPool.includes(item.pool_address) && item.staking_type == "linear"
    )) {
      if (core.balance.TRWA < Config.TRWASTAKINGAMOUNT) {
        await Helper.delay(
          3000,
          acc,
          `Current TRWA amount is ${core.balance.TRWA} TRWA less than configuration staking amount ${Config.TRWASTAKINGAMOUNT} TRWA`,
          core
        );
        break;
      }
      await core.stake(item);
    }

    const delay = 60000 * 60;
    const account = accountLists.find((item) => item == acc);
    const accIdx = accountLists.indexOf(account);
    await Helper.delay(
      delay,
      acc,
      `Account ${accIdx + 1} Processing Done, Delaying for ${Helper.msToTime(
        delay
      )}`,
      core
    );
    await operation(acc, proxy);
  } catch (error) {
    let account = acc;
    if (error.message) {
      await Helper.delay(
        10000,
        acc,
        `Error : ${error.message}, Retry again after 10 Second`,
        core
      );
    } else {
      await Helper.delay(
        10000,
        acc,
        `Error :${JSON.stringify(error)}, Retry again after 10 Second`,
        core
      );
    }

    await operation(account, proxy);
  }
}

async function startBot() {
  return new Promise(async (resolve, reject) => {
    try {
      logger.info(`BOT STARTED`);
      if (accountLists.length == 0)
        throw Error("Please input your account first on accounts.js file");

      if (proxyList.length != accountLists.length && proxyList.length != 0)
        throw Error(
          `You Have ${accountLists.length} Accounts But Provide ${proxyList.length}`
        );

      const promiseList = [];

      for (const acc of accountLists) {
        const accIdx = accountLists.indexOf(acc);
        const proxy = proxyList[accIdx];

        promiseList.push(operation(acc, proxy));
      }

      await sqlite.createTable();
      await Promise.all(promiseList);
      resolve();
    } catch (error) {
      logger.info(`BOT STOPPED`);
      logger.error(JSON.stringify(error));
      reject(error);
    }
  });
}

(async () => {
  try {
    logger.clear();
    logger.info("");
    logger.info("Application Started");
    console.log("BASE RWA LAUNCHPAD BOT");
    console.log();
    console.log("Welcome & Enjoy Sir!");
    console.log("Author : Nofan Rambe");
    console.log("Dont forget to run git pull to keep up to date");
    console.log();
    console.log();
    await startBot();
  } catch (error) {
    console.log("Error During executing bot", error);
    await startBot();
  }
})();
