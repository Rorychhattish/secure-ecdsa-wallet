# 🔐 Secure ECDSA Wallet Transfer System

A secure client-server application that demonstrates how ECDSA (Elliptic Curve Digital Signature Algorithm) can be used to authorize cryptocurrency-style transactions.

The project uses public/private key cryptography and digital signatures to ensure that only the owner of a wallet can initiate transfers.

---

## 🚀 Features

- Wallet balance lookup
- Secure fund transfer system
- ECDSA digital signatures
- Public key verification
- Transaction authentication
- React frontend
- Node.js & Express backend
- Ethereum Cryptography Library

---

## 🛠 Tech Stack

### Frontend
- React
- Vite
- Axios

### Backend
- Node.js
- Express

### Cryptography
- ethereum-cryptography
- secp256k1
- SHA256

---

## 📦 Installation

### Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/ecdsa-wallet-transfer.git
cd ecdsa-wallet-transfer
```

### Client Setup

```bash
cd client
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

### Server Setup

Open a new terminal:

```bash
cd server
npm install
node index
```

Server:

```text
http://localhost:3042
```

---

## 🔑 Generate Wallet Keys

Create a file named `generate.js`:

```javascript
const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");

const privateKey = secp.utils.randomPrivateKey();

console.log("Private Key:", toHex(privateKey));

const publicKey = secp.getPublicKey(privateKey);

console.log("Public Key:", toHex(publicKey));
```

Run:

```bash
node generate.js
```

Example Output:

```text
Private Key:
a6b77efba99bac8012fbd36360f1aaf6e6274dc39ca69327c3d6957e7ac2064e

Public Key:
04e3f0d4c7f0e76f...
```

Use the generated public keys inside the server balance object.

---

## 🖥️ Usage

1. Start the backend server.
2. Start the React frontend.
3. Enter a wallet address.
4. View account balance.
5. Create a transaction.
6. Sign the transaction.
7. Submit the transaction.
8. Server verifies the signature and updates balances.

---

## 👨‍💻 Author

**RoryChhattish**

- B.Tech CSE Student
- Blockchain Enthusiast
- Cybersecurity Learner

YouTube: **Hack With 36**(https://www.youtube.com/@Hackwith36)

---

## 📜 License

MIT License
