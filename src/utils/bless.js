import blessed from "blessed";
import logger from "./logger.js";
import Core from "../core/core.js";
import { Helper } from "./helper.js";
import { accountLists } from "../../accounts/accounts.js";
import sqlite from "../core/db/sqlite.js";

export class Bless {
  constructor() {
    this.screen = blessed.screen({
      smartCSR: true,
    });

    this.screen.title = "NOFAN RAMBE";
    this.titleBox = blessed.box({
      top: 0,
      left: "center",
      width: "shrink",
      height: 2,
      tags: true,
      content: `{center}BASE RWA TESTNET BOT{/center} 
      WELCOME & ENJOY SIR!`,
      style: {
        fg: "white",
        bold: true,
      },
    });
    this.screen.append(this.titleBox);
    this.subTitle = blessed.box({
      top: 1,
      left: "center",
      width: "shrink",
      height: 2,
      tags: true,
      content: `AUTHOR : NOFAN RAMBE`,
      style: {
        fg: "white",
        bold: true,
      },
    });
    this.screen.append(this.subTitle);
    this.tabList = blessed.box({
      top: 5,
      left: "center",
      width: "100%",
      height: 3,
      tags: true,
      style: {
        fg: "white",
      },
    });
    this.screen.append(this.tabList);
    this.hintBox = blessed.box({
      bottom: 0,
      left: "center",
      width: "100%",
      height: 3,
      tags: true,
      content:
        "{center}Use '->'(arrow right) and '<-'(arrow left) to switch between tabs{/center}",
      style: {
        fg: "white",
      },
    });
    this.screen.append(this.hintBox);
    this.infoBox = blessed.box({
      bottom: 3,
      left: "center",
      width: "100%",
      height: 3,
      tags: true,
      content: "",
      style: {
        fg: "white",
        // bg: "black",
      },
    });
    this.screen.append(this.infoBox);
    this.tabs = [];
    this.currentTabIndex = 0;

    accountLists.forEach((account, idx) => {
      const tab = this.createAccountTab(`Account ${idx + 1}`);
      this.tabs.push(tab);
      this.screen.append(tab);
      tab.hide();
    });

    if (this.tabs.length > 0) {
      this.tabs[0].show();
    }

    this.renderTabList();

    this.screen.key(["q", "C-c"], () => {
      return process.exit(0);
    });

    this.screen.key(["left", "right"], (ch, key) => {
      if (key.name === "right") {
        this.switchTab((this.currentTabIndex + 1) % this.tabs.length);
      } else if (key.name === "left") {
        this.switchTab(
          (this.currentTabIndex - 1 + this.tabs.length) % this.tabs.length
        );
      }
    });

    this.screen.render();
  }

  createAccountTab(title) {
    return blessed.box({
      label: title,
      top: 6,
      left: 0,
      width: "100%",
      height: "shrink",
      border: {
        type: "line",
      },
      style: {
        fg: "white",
        border: {
          fg: "#f0f0f0",
        },
      },
      tags: true,
    });
  }

  renderTabList() {
    let tabContent = "";
    accountLists.forEach((account, idx) => {
      if (idx === this.currentTabIndex) {
        tabContent += `{blue-fg}{bold} Account ${idx + 1} {/bold}{/blue-fg} `;
      } else {
        tabContent += ` Account ${idx + 1} `;
      }
    });
    this.tabList.setContent(`{center}${tabContent}{/center}`);
    this.screen.render();
  }

  switchTab(index) {
    this.tabs[this.currentTabIndex].hide();
    this.currentTabIndex = index;
    this.tabs[this.currentTabIndex].show();
    this.renderTabList();
    this.screen.render();
  }

  async log(msg = "", acc = "", core = new Core(), delay) {
    const account = accountLists.find((item) => item == acc);
    const accIdx = accountLists.indexOf(account);

    if (delay === undefined) {
      logger.info(`Account ${accIdx + 1} - ${msg}`);
      delay = "-";
    }
    let logContent;

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

    logContent = `${Helper.spinnerContent(spinnerData)}`;

    this.tabs[accIdx].setContent(logContent);
    this.screen.render();
  }

  info(msg = "") {
    const formattedInfo = `
{center}Info: ${msg}{/center}
`;
    this.infoBox.setContent(formattedInfo);
    this.screen.render();
  }

  clearInfo() {
    this.infoBox.setContent("");
    this.screen.render();
  }
}
