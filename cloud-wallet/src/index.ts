import { PrismaClient } from "@prisma/client";
import express from "express";
import { Connection, Keypair, Transaction } from "@solana/web3.js";
import jwt from "jsonwebtoken";
import nacl from "tweetnacl";
import cors from "cors";
const app = express();
app.use(cors());
app.use(express.json());
const prisma = new PrismaClient();
const connection = new Connection(
  "https://solana-devnet.g.alchemy.com/v2/YWHo0bEfccQgI26dhf9_hOWWxVYmJMc9"
);
app.post("/signup", async (req: any, res: any) => {
  const { username, password } = req.body;
  const existingUser = await prisma.user.findFirst({
    where: {
      username,
    },
  });

  if (existingUser) {
    return res.json({
      message: "user already exists",
    });
  }
  const keypair = Keypair.generate();
  const publicKey = keypair.publicKey.toString();
  const secretKey = keypair.secretKey.toString();
  console.log(publicKey, secretKey);
  const user = await prisma.user.create({
    data: {
      username,
      password,
      publicKey,
      privateKey: secretKey,
    },
  });
  return res.json({
    publicKey,
  });
});
app.post("/signin", async (req: any, res: any) => {
  const { username, password } = req.body;
  const user = await prisma.user.findFirst({
    where: {
      username,
      password,
    },
  });
  if (!user) {
    return res.json({
      message: "User doesnot exists",
    });
  }
  const token = jwt.sign({ id: user }, "JWT_SECRET", {
    expiresIn: 5 * 24 * 60 * 60 * 1000,
  });
  return res.json({
    jwt: token,
  });
});
app.post("/txn/sign", async (req, res) => {
  console.log(req.body);

  const { message: serializedTx } = req.body;
  console.log(serializedTx);
  const tx: Transaction = Transaction.from(Buffer.from(serializedTx));
  const response = await prisma.user.findFirst({
    where: {
      id: 4,
    },
  });
  const privateKeyArray = [response?.privateKey];
  const numericArray = privateKeyArray[0]!.split(",").map(Number);

  const privateKeyBuffer = Buffer.from(numericArray); // Node.js Buffer
  // Or use Uint8Array if the library requires it
  const privateKeyUint8Array = new Uint8Array(numericArray);

  // Logging to verify
  console.log("Private Key as Buffer:", privateKeyBuffer);
  console.log("Private Key as Uint8Array:", privateKeyUint8Array);
  const keypair = Keypair.fromSecretKey(privateKeyUint8Array);
  try {
    tx.sign(keypair);
    console.log("Transaction signed successfully!");
    const signature = await connection.sendTransaction(tx, [keypair]);
    console.log(signature);
  } catch (error) {
    console.error("Error signing transaction" + error);
  }
});
app.listen(3001, () => {
  console.log("Listening on port 3001");
});
