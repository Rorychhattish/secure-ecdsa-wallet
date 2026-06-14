import { useState } from "react";
import server from "./server";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { sha256 } from "ethereum-cryptography/sha256";
import { hexToBytes, toHex, utf8ToBytes } from "ethereum-cryptography/utils";

function Transfer({ address, privateKey, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  function normalizeAddress(a) {
    if (!a) return "";
    const trimmed = a.trim();
    return (trimmed.startsWith("0x") ? trimmed.slice(2) : trimmed).toLowerCase();
  }

  function isPublicKey(address) {
    return /^[0-9a-f]{66}$/.test(address);
  }

  function hashTransaction(sender, recipient, amount, nonce) {
    return sha256(utf8ToBytes(JSON.stringify({ sender, recipient, amount, nonce })));
  }

  async function transfer(evt) {
    evt.preventDefault();

    if (!address) {
      alert("No sender address set. Enter a private key in the wallet first.");
      return;
    }

    if (!privateKey) {
      alert("Enter a private key in the wallet first.");
      return;
    }

    const amount = Number(sendAmount);
    if (!Number.isInteger(amount) || amount <= 0) {
      alert("Enter a valid amount");
      return;
    }

    const normalizedRecipient = normalizeAddress(recipient);
    if (!normalizedRecipient) {
      alert("Enter a recipient address");
      return;
    }

    if (!isPublicKey(normalizedRecipient)) {
      alert("Recipient must be a public key/address. Use the generated Public Key, not the Private Key.");
      return;
    }

    try {
      const {
        data: { nonce },
      } = await server.get(`nonce/${address}`);

      const normalizedPrivateKey = normalizeAddress(privateKey);
      const msgHash = hashTransaction(address, normalizedRecipient, amount, nonce);
      const signature = secp256k1.sign(msgHash, hexToBytes(normalizedPrivateKey));

      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        amount,
        recipient: normalizedRecipient,
        nonce,
        signature: toHex(signature.toCompactRawBytes()),
        recovery: signature.recovery,
      });
      setBalance(balance);
    } catch (ex) {
      if (ex.response && ex.response.status === 404) {
        alert("Server route not found. Restart the server so it loads the latest code.");
        return;
      }

      const message =
        ex.response?.data?.message ||
        (typeof ex.response?.data === "string" ? ex.response.data : "") ||
        ex.message ||
        "Transfer failed";
      alert(message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
