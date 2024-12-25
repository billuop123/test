import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import axios from "axios";
import "./App.css";
const fromPubkey = new PublicKey("aRuAADZA7Euacydq4DoZykQ63Wdqt8YfsH1sFPbFfxN");
console.log(fromPubkey);
const connection = new Connection(
  "https://solana-devnet.g.alchemy.com/v2/YWHo0bEfccQgI26dhf9_hOWWxVYmJMc9"
);
async function sendSol() {
  const ix = SystemProgram.transfer({
    fromPubkey,
    toPubkey: new PublicKey("DD6KELuRekKYKG6QbwQDXLBEaJMZh5sqZ7u2154DDwHM"),
    lamports: 0.001 * LAMPORTS_PER_SOL,
  });
  const tx = new Transaction().add(ix);
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = fromPubkey;
  const serializeTx = tx.serialize({
    requireAllSignatures: false,
    verifySignatures: false,
  });

  await axios.post("http://localhost:3001/txn/sign", {
    message: serializeTx,
    retry: false,
  });
}
function App() {
  return (
    <>
      <input type="text" placeholder="address" />
      <input type="text" placeholder="amount" />
      <button onClick={sendSol}>Send SOl</button>
    </>
  );
}

export default App;
