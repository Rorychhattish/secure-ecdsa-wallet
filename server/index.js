const express = require("express");
const app = express();
const cors = require("cors");
const { secp256k1 } = require("ethereum-cryptography/secp256k1");
const { sha256 } = require("ethereum-cryptography/sha256");
const { hexToBytes, toHex, utf8ToBytes } = require("ethereum-cryptography/utils");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "40e92a06b07743322500dbeb5cca79b5e5a3ce0c7f92b1171d00fc8a1a780ae7": 100, //alice
  "028eda4fee3a7352fef5c4fc6f22370c7bfb4101f0e0ff8faee0c1fc60c5a8860f": 50,  //carol
  "0343bd1a1c9076d1e1ae52ee2afcd09b7e64b98486985769c855eb18e5ea328948": 75,  //sarah
};

const nonces = {};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.get("/nonce/:address", (req, res) => {
  const { address } = req.params;
  res.send({ nonce: nonces[address] || 0 });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, nonce, signature, recovery } = req.body;

  if (!sender || !recipient) {
    res.status(400).send({ message: "Missing sender or recipient address" });
    return;
  }

  if (!isPublicKey(sender) || !isPublicKey(recipient)) {
    res.status(400).send({ message: "Sender and recipient must be public keys" });
    return;
  }

  if (!Number.isInteger(amount) || amount <= 0) {
    res.status(400).send({ message: "Invalid amount" });
    return;
  }

  if (nonce !== (nonces[sender] || 0)) {
    res.status(400).send({ message: "Invalid transaction nonce" });
    return;
  }

  if (!signature || typeof recovery !== "number") {
    res.status(400).send({ message: "Missing signature" });
    return;
  }

  const verifiedSender = recoverSender({ sender, recipient, amount, nonce, signature, recovery });
  if (verifiedSender !== sender) {
    res.status(401).send({ message: "Invalid signature" });
    return;
  }

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    nonces[sender] = nonce + 1;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

function recoverSender({ sender, recipient, amount, nonce, signature, recovery }) {
  try {
    const msgHash = hashTransaction(sender, recipient, amount, nonce);
    return toHex(
      secp256k1.Signature.fromCompact(hexToBytes(signature))
        .addRecoveryBit(recovery)
        .recoverPublicKey(msgHash)
        .toRawBytes()
    );
  } catch (err) {
    return "";
  }
}

function hashTransaction(sender, recipient, amount, nonce) {
  return sha256(utf8ToBytes(JSON.stringify({ sender, recipient, amount, nonce })));
}

function isPublicKey(address) {
  return /^[0-9a-f]{66}$/.test(address);
}
