# hd-multidag

MultiDAG support for Coti HDWallet

## Getting Started

First, install the dependencies with:

```apache
npm install 
```

Next, copy the example.env file:

```apache
cp example.env .env
```

Insert your data to the .env file:

* FULL_NODE: Coti FullNode where the transaction will be submitted.
* TRUST_SCORE_NODE: Coti TrustScore Node where the user trustscore is stored.
* CURRENCY_SYMBOL: Symbol of the token that the user send.
* MNEMONIC: Mnemonic of the user wallet. (12 or 24 words seperated by space, e.g. MNEMONIC='some word list...')
* SOURCE_INDEX: Index of the address from which the user sends the tokens.
* AMOUNT: Token amount that the user send.
* DESTINATION_ADDRESS: Destination address to which the user send the tokens.

Run the application with the command:

```apache
npm run start
```



Finally, check the logs and confirm that the transaction details are set right.
