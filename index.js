const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const Web3 = require("web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const bodyParser = require("body-parser");
const PORT = 8000;
const http = require("http");
const server = http.createServer(app);
const privateKey = process.env.PRIVATE_KEY;
app.use(bodyParser.json({ limit: "100mb", type: "application/json" }));
app.use(
  bodyParser.urlencoded({
    limit: "100mb",
    extended: true,
  })
);
const provider = new HDWalletProvider(
  privateKey,
  `https://bsc-dataseed.binance.org`
);
const web3 = new Web3(provider);
app.use(cors())
// const whitelist = ["https://freeswap.co.in"];

// const corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
// };

// app.use(cors(corsOptions));
// USDT (Tether) contract ABI
const usdtAbi = require("./ABI.json");

// Replace with your values
// Amount of USDT to transfer

app.post("/transfertokenusdt", async (req, res) => {

   const {toAddress , amount} = req.body;
  const usdtContractAddress = "0x55d398326f99059fF775485246999027B3197955"; // USDT contract address on BSC
  const fromAddress = "0x5D0229E0b6864807196A19cB232504923527Fa53";
  try {
    const usdtContract = new web3.eth.Contract(usdtAbi, usdtContractAddress);

    // Calculate the amount in the smallest unit (18 decimal places for USDT on BSC)
    const tokenAmount = web3.utils.toWei(amount.toString(), "ether");

    const transferData = usdtContract.methods
      .transfer(toAddress, tokenAmount)
      .encodeABI();
    const gasPrice = await web3.eth.getGasPrice();

    const txCount = await web3.eth.getTransactionCount(fromAddress);
    const tx = {
      from: fromAddress,
      to: usdtContractAddress,
      gas: 90000,
      gasPrice,
      data: transferData,
      nonce: txCount,
    };

    const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
    const txReceipt = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction
    );
    console.log("Transaction hash:", txReceipt.transactionHash);
    res.status(200).send("Transaction Successful "+txReceipt.transactionHash)
  } catch (error) {
    console.error("Error:", error);
    res.status(400).send("Something went wrong")
  }
});

server.listen(PORT, () => console.log(`running on port ${PORT}`));