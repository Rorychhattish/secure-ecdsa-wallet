import server from "./server";

import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { toHex, hexToBytes } from "ethereum-cryptography/utils";

function Wallet({ address, setAddress, balance, setBalance, privateKey, setPrivateKey }) {
  async function onChange(evt) {
    const input = evt.target.value.trim();
    setPrivateKey(input);

    if (!input) {
      setAddress("");
      setBalance(0);
      return;
    }

    const normalized = (input.startsWith("0x") ? input.slice(2) : input).toLowerCase();

    try {
      const privBytes = hexToBytes(normalized);
      const pubBytes = secp256k1.getPublicKey(privBytes);
      const addr = toHex(pubBytes);
      setAddress(addr);

      const {
        data: { balance },
      } = await server.get(`balance/${addr}`);
      setBalance(balance);
    } catch (err) {
      setAddress("");
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Private Key
        <input placeholder="Type in private key" value={privateKey} onChange={onChange}></input>
      </label>

      <div>
        Address: {address ? `${address.slice(0, 10)}...` : "-"}
      </div>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
