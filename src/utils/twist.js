import { Twisters } from "twisters";
import logger from "./logger.js";
import Core from "../core/core.js";
import { Config } from "../../config/config.js";
import { accountLists } from "../../accounts/accounts.js";
import sqlite from "../core/db/sqlite.js";
import { Helper } from "./helper.js";

export class Twist {
  constructor() {
    /** @type  {Twisters}*/
    this.twisters = new Twisters();
  }

  /**
   * @param {string} acc
   * @param {Core} core
   * @param {string} msg
   * @param {string} delay
   */
  async log(msg = "", acc = "", core = new Core(), delay) {
    const account = accountLists.find((item) => item == acc);
    const accIdx = accountLists.indexOf(account);
    if (delay == undefined) {
      logger.info(`Account ${accIdx + 1} - ${msg}`);
      delay = "-";
    }

    const address = core.address ?? "-";

    const balance = core.balance ?? {};
    const eth = balance.ETH ?? "-";
    const trwa = balance.TRWA ?? "-";
    const usdc = balance.USDC ?? "-";

    const todayTrwa = (await sqlite.getTodayTxLog(address, "claim TRWA"))
      .length;
    const todayUsdc = (await sqlite.getTodayTxLog(address, "mint USDC")).length;
    const todayStake = (await sqlite.getTodayTxLog(address, "stake")).length;

    let spinnerData = {
      msg,
      delay,
      address,
      eth,
      trwa,
      usdc,
      todayTrwa,
      todayUsdc,
      todayStake,
    };

    let content;

    content = `
================== Account ${accIdx + 1} =================
${Helper.spinnerContent(spinnerData)}
==============================================
`;

    this.twisters.put(account, {
      text: content,
    });
  }
  /**
   * @param {string} msg
   */
  info(msg = "") {
    this.twisters.put(2, {
      text: `
==============================================
Info : ${msg}
==============================================`,
    });
    return;
  }

  clearInfo() {
    this.twisters.remove(2);
  }

  clear(acc) {
    this.twisters.remove(acc);
  }
}
