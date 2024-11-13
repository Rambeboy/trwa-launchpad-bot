import { ethers } from "ethers";
import { Helper } from "../utils/helper.js";
import { API } from "./api/api.js";
import { RPC } from "./network/rpc.js";
import logger from "../utils/logger.js";
import { Config } from "../../config/config.js";
import { TRWAFAUCET } from "./contract/trwa_faucet.js";
import { TRWA } from "./contract/trwa.js";
import sqlite from "./db/sqlite.js";
import { USDC } from "./contract/usdc.js";
import { POOLPROXY } from "./contract/pool_proxy.js";
import { STAKINGPOOL } from "./contract/staking_pool.js";

export default class Core extends API {
  constructor(acc, proxy) {
    super("https://api.launch.rwa.inc", proxy);
    this.acc = acc;
    this.provider = new ethers.JsonRpcProvider(RPC.RPCURL, RPC.CHAINID);

    this.trwaFaucet = new ethers.Contract(
      TRWAFAUCET.CA,
      TRWAFAUCET.ABI,
      this.wallet
    );
    this.usdc = new ethers.Contract(USDC.CA, USDC.ABI, this.provider);
    this.trwa = new ethers.Contract(TRWA.CA, TRWA.ABI, this.provider);

    this.targetPool = ["0xB4D0040133EB541e80DE9564C9392cb43dBFce13"];
    this.proxyPool1 = new ethers.Contract(
      POOLPROXY.CA,
      POOLPROXY.ABI,
      this.provider
    );
    this.pool1 = new ethers.Contract(
      STAKINGPOOL.CA,
      STAKINGPOOL.ABI,
      this.provider
    );
  }

  async connectWallet() {
    try {
      if (!this.acc) {
        throw new Error("Please Set Up your wallet Private Key");
      }
      const data = this.acc;
      await Helper.delay(500, this.acc, `Connecting to Account Wallet`, this);
      const type = Helper.determineType(data);
      logger.info(`Account Type : ${type}`);
      if (type == "Secret Phrase") {
        /**
         * @type {Wallet}
         */
        this.wallet = ethers.Wallet.fromPhrase(data, this.provider);
      } else if (type == "Private Key") {
        /**
         * @type {Wallet}
         */
        this.wallet = new ethers.Wallet(data.trim(), this.provider);
      } else {
        throw Error("Invalid account Secret Phrase or Private Key");
      }
      this.address = this.wallet.address;
      await Helper.delay(500, this.acc, `Wallet connected..`, this);
    } catch (error) {
      await this.handleError(error);
    }
  }

  async getBalance(update = false) {
    try {
      if (!update) {
        await Helper.delay(500, this.acc, `Getting Wallet Balance`, this);
      }

      const ethBalance = ethers.formatEther(
        await this.provider.getBalance(this.wallet.address)
      );
      const trwaBalance = ethers.formatEther(
        await this.trwa.balanceOf(this.address)
      );
      const usdcBalance = ethers.formatUnits(
        await this.usdc.balanceOf(this.address),
        6
      );
      this.balance = {
        ETH: ethBalance,
        TRWA: trwaBalance,
        USDC: usdcBalance,
      };
      if (update) await Helper.delay(500, this.acc, `Balance updated`, this);
    } catch (error) {
      await this.handleError(error);
    }
  }

  async claimTrwa() {
    try {
      await Helper.delay(2000, this.acc, `Try Claim TRWA Token`, this);

      const data = await this.trwaFaucet.claimTokens.populateTransaction();
      const tx = await this.buildTxBody(data);
      await this.executeTx(tx);
      await sqlite.insertData(
        this.address,
        new Date().toISOString(),
        "claim TRWA"
      );
      await Helper.delay(
        2000,
        this.acc,
        `Successfully Claim TRWA Faucet`,
        this
      );
    } catch (error) {
      await Helper.delay(3000, this.acc, error.message, this);
    }
  }
  async mintUsdc() {
    try {
      await Helper.delay(2000, this.acc, `Try Mint USDC Token`, this);

      const data = await this.usdc.mint.populateTransaction(
        this.address,
        1000000000
      );
      const tx = await this.buildTxBody(data);
      await this.executeTx(tx);
      await sqlite.insertData(
        this.address,
        new Date().toISOString(),
        "mint USDC"
      );
      await Helper.delay(2000, this.acc, `Successfully Mint USDC`, this);
    } catch (error) {
      throw error;
    }
  }
  async stake(pool) {
    try {
      const approval = (await sqlite.getTxLog(this.address, "approve")).length;
      if (approval == 0) {
        const spender = pool.pool_address;
        await this.approveTokenSpend(TRWA.CA, TRWA.ABI, spender);
      }

      await Helper.delay(
        2000,
        this.acc,
        `Try To Stake TRWA Token to Pools ${pool.pool_id} ${pool.title}`,
        this
      );
      const poolAddress = pool.pool_address;
      if (poolAddress == (await this.proxyPool1.getAddress())) {
        let data = await this.pool1.linearDeposit.populateTransaction(
          pool.pool_id,
          ethers.parseUnits(Config.TRWASTAKINGAMOUNT.toString(), 18)
        );
        data.to = await this.proxyPool1.getAddress();
        const tx = await this.buildTxBody(data);
        await this.executeTx(tx);

        await Helper.delay(
          3000,
          this.acc,
          `Successfully Stake ${Config.TRWASTAKINGAMOUNT} TRWA to Pool ${pool.pool_id} ${pool.title}`,
          this
        );
      } else {
        await Helper.delay(
          3000,
          this.acc,
          `This bot haven't provide Staking for this Pool`,
          this
        );
      }
      await sqlite.insertData(this.address, new Date().toISOString(), "stake");
    } catch (error) {
      await Helper.delay(3000, this.acc, error.message, this);
    }
  }

  async conectRwaDapps() {
    await Helper.delay(1000, this.acc, `Connecting to RWA Dapps`, this);
    const timestamp = Date.now();
    const msg = `Launchpad User Signature`;
    logger.info(`Message to sign: ${msg}`);
    const signedMessage = await this.wallet.signMessage(msg);
    logger.info(`Signed Message: ${signedMessage}`);
    this.signatureMessage = signedMessage;
    await Helper.delay(1000, this.acc, `Connected To RWA Dapps`, this);
  }

  async getStakingPoolList() {
    try {
      await Helper.delay(1000, this.acc, `Getting Staking Pools`, this);
      const res = await this.fetch(`/staking-pool`, "GET");
      if (res.status == 200) {
        this.stakingPool = res.data;
        await Helper.delay(
          1000,
          this.acc,
          `Successfully Get Staking Pool`,
          this
        );
      } else {
        throw res;
      }
    } catch (error) {
      await this.handleError(error);
    }
  }

  async buildTxBody(data) {
    const amountInWei = ethers.parseEther("0");
    const nonce = await this.getOptimalNonce();
    const gasLimit = await this.estimateGasWithRetry(
      data.to,
      amountInWei,
      data.data,
      true
    );
    const tx = {
      to: data.to,
      gasLimit,
      gasPrice: ethers.parseUnits(Config.GWEIPRICE.toString(), "gwei"),
      nonce: nonce,
      data: data.data,
    };
    return tx;
  }

  async approveTokenSpend(ca, abi, spender) {
    await Helper.delay(
      2000,
      this.acc,
      `Approving Token to be spend on Staking Pool`,
      this
    );
    const contractToApprove = new ethers.Contract(ca, abi, this.wallet);
    const tx = await contractToApprove.approve(spender, ethers.MaxUint256);
    await Helper.delay(2000, this.acc, `Token Approved`, this);
    const txRev = await tx.wait();
    logger.info(`Tx Confirmed and Finalizing: ${JSON.stringify(txRev)}`);
    this.hash = txRev.hash;
    await Helper.delay(
      5000,
      this.acc,
      `Approval Tx Executed \n${RPC.EXPLORER}tx/${txRev.hash}`,
      this
    );
  }

  async executeTx(tx) {
    try {
      logger.info(`TX DATA ${JSON.stringify(Helper.serializeBigInt(tx))}`);
      await Helper.delay(500, this.acc, `Executing TX...`, this);
      const txRes = await this.wallet.sendTransaction(tx);
      if (Config.WAITFORBLOCKCONFIRMATION) {
        await Helper.delay(
          500,
          this.acc,
          `Tx Executed Waiting For Block Confirmation...`,
          this
        );
        const txRev = await txRes.wait();
        logger.info(`Tx Confirmed and Finalizing: ${JSON.stringify(txRev)}`);
        this.hash = txRev.hash;
        await Helper.delay(
          5000,
          this.acc,
          `Tx Executed \n${RPC.EXPLORER}tx/${txRev.hash}`,
          this
        );
      } else {
        await Helper.delay(
          5000,
          this.acc,
          `Tx Executed \n${RPC.EXPLORER}tx/${txRes.hash}`,
          this
        );
      }
      await this.getBalance(true);
    } catch (error) {
      await this.handleError(error);
    }
  }

  async getOptimalNonce() {
    try {
      const latestNonce = await this.provider.getTransactionCount(
        this.wallet.address,
        "latest"
      );
      const pendingNonce = await this.provider.getTransactionCount(
        this.wallet.address,
        "pending"
      );
      const optimalNonce =
        pendingNonce > latestNonce ? pendingNonce : latestNonce;
      return optimalNonce;
    } catch (error) {
      await this.handleError(error);
    }
  }

  async estimateGasWithRetry(
    address,
    amount,
    rawdata,
    directThrow = false,
    retries = 3,
    delay = 3000
  ) {
    let error;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        logger.info(`Estimating Gas for ${rawdata} TX`);
        const gasLimit = await this.provider.estimateGas({
          from: this.wallet.address,
          to: address,
          value: amount,
          data: rawdata,
        });
        return gasLimit;
      } catch (err) {
        if (directThrow) throw Error(err.shortMessage);
        await Helper.delay(
          delay,
          this.acc,
          `${err.shortMessage}... Attempt ${attempt + 1} of ${retries}`,
          this
        );
        if (attempt === retries - 1) {
          throw Error(`Failed to estimate gas after ${retries} attempts.`);
        }
      }
    }
  }

  async handleError(error) {
    if (error.code) {
      if (error.code == 401) {
        throw Error(`Error ${error.msg}`);
      } else {
        await Helper.delay(3000, this.acc, `Error : ${error.msg}`, this);
      }
    } else {
      throw error;
    }
  }
}
