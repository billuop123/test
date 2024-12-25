"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const web3_js_1 = require("@solana/web3.js");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const prisma = new client_1.PrismaClient();
const connection = new web3_js_1.Connection("https://solana-devnet.g.alchemy.com/v2/YWHo0bEfccQgI26dhf9_hOWWxVYmJMc9");
app.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const existingUser = yield prisma.user.findFirst({
        where: {
            username,
        },
    });
    if (existingUser) {
        return res.json({
            message: "user already exists",
        });
    }
    const keypair = web3_js_1.Keypair.generate();
    const publicKey = keypair.publicKey.toString();
    const secretKey = keypair.secretKey.toString();
    console.log(publicKey, secretKey);
    const user = yield prisma.user.create({
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
}));
app.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const user = yield prisma.user.findFirst({
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
    const token = jsonwebtoken_1.default.sign({ id: user }, "JWT_SECRET", {
        expiresIn: 5 * 24 * 60 * 60 * 1000,
    });
    return res.json({
        jwt: token,
    });
}));
app.post("/txn/sign", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    const { message: serializedTx } = req.body;
    console.log(serializedTx);
    const tx = web3_js_1.Transaction.from(Buffer.from(serializedTx));
    const response = yield prisma.user.findFirst({
        where: {
            id: 4,
        },
    });
    const privateKeyArray = [response === null || response === void 0 ? void 0 : response.privateKey];
    const numericArray = privateKeyArray[0].split(",").map(Number);
    const privateKeyBuffer = Buffer.from(numericArray); // Node.js Buffer
    // Or use Uint8Array if the library requires it
    const privateKeyUint8Array = new Uint8Array(numericArray);
    // Logging to verify
    console.log("Private Key as Buffer:", privateKeyBuffer);
    console.log("Private Key as Uint8Array:", privateKeyUint8Array);
    const keypair = web3_js_1.Keypair.fromSecretKey(privateKeyUint8Array);
    try {
        tx.sign(keypair);
        console.log("Transaction signed successfully!");
        const signature = yield connection.sendTransaction(tx, [keypair]);
        console.log(signature);
    }
    catch (error) {
        console.error("Error signing transaction" + error);
    }
}));
app.listen(3001, () => {
    console.log("Listening on port 3001");
});
