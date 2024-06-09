import { mnemonicToSeed } from 'bip39';
import { hdkey } from 'ethereumjs-wallet';
import { cryptoUtils, nodeUtils, transactionUtils } from '@coti-io/crypto';
import { HardForks } from '@coti-io/crypto/dist/utils/transactionUtils';
import * as readline from 'readline';
import * as process from 'process';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { config_schema } from './config';

async function main() {
  dotenv.config();
  await config_schema.validateAsync(process.env).catch(error => {
    console.log('Env validation error:');
    error.details.forEach((detail: { message: string }) => console.log(detail.message));
    process.exit(1);
  });
  const fullnode = process.env.FULL_NODE!;
  const trustScoreNode = process.env.TRUST_SCORE_NODE!;
  const currencySymbol = process.env.CURRENCY_SYMBOL!;
  const currency = await getCurrencyDetails(currencySymbol, fullnode);

  const mnemonic = process.env.MNEMONIC!;
  const seed = await mnemonicToSeed(mnemonic);
  const hdwallet = hdkey.fromMasterSeed(seed);

  const accountPath = "m/44'/6779'/0'/0";
  const accountWallet = hdwallet.derivePath(accountPath).getWallet();
  const userPrivateKey = accountWallet.getPrivateKey().toString('hex');

  const sourcePath = accountPath + '/0';
  const sourceWallet = hdwallet.derivePath(sourcePath).getWallet();
  const sourcePrivateKey = sourceWallet.getPrivateKey().toString('hex');
  const sourceKeyPair = cryptoUtils.getKeyPairFromPublicHash(sourceWallet.getPublicKey().toString('hex'));
  const sourceAddress = cryptoUtils.getAddressHexByKeyPair(sourceKeyPair);

  const amount = process.env.AMOUNT;
  const currencyHash = currency.currencyHash;
  const destinationAddress = process.env.DESTINATION_ADDRESS!;
  const inputMap = new Map();
  inputMap.set(sourceAddress, amount);
  const feeAddress = sourceAddress;

  const transaction = await transactionUtils.createTransaction({
    userPrivateKey,
    inputMap,
    currencyHash,
    feeAddress,
    destinationAddress,
    fullnode,
    trustScoreNode,
    hardFork: HardForks.MULTI_CURRENCY,
  });
  transaction.signWithPrivateKeys(userPrivateKey, [sourcePrivateKey, sourcePrivateKey]);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question(`Source address: ${sourceAddress},\nDestination address: ${destinationAddress},\nAmount: ${amount} ${currencySymbol},\nConfirm to send? (yes) `, async answer => {
    if (answer != 'yes') {
      console.log('Transaction is cancelled');
      process.exit(1);
    }
    const transactionResponse = await nodeUtils.sendTransaction(transaction, undefined, fullnode);

    console.log(`Transaction hash: ${transaction.getHash()}`);
    console.log(transactionResponse);
    rl.close();
  });
}

async function getCurrencyDetails(currencySymbol: string, fullnode: string) {
  const payload = {
    symbol: currencySymbol,
  };
  const headers = {
    'Content-Type': 'application/json',
  };

  const { data } = await axios.post(`${fullnode}/currencies/token/symbol/details`, payload, { headers });

  return data.token;
}

main().then(() => {});
