/* eslint-disable react-hooks/exhaustive-deps */

// Dependencies / modules yang digunakan
import { useState } from "react";
import Image from "next/image";
import { CardanoWallet, useWallet } from "@meshsdk/react";
import {
  BlockfrostProvider,
  deserializeAddress,
  serializePlutusScript,
  mConStr0,
  MeshTxBuilder,
  Asset,
} from "@meshsdk/core";
import { applyParamsToScript } from "@meshsdk/core-csl";

// Integrasi smart-contract
import contractBlueprint from "../../../aiken-workspace/plutus.json";

// Mendapatkan validator script dalam format CBOR
const scriptCbor = applyParamsToScript(
  contractBlueprint.validators[0].compiledCode,
  []
);

// Mendapatkan contract address
const contractAddress = serializePlutusScript(
  { code: scriptCbor, version: "V3" },
  undefined,
  0
).address;

// Loading environment variable blockfrost API key
const blockfrostApiKey = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY || "";
const merchantAddress = process.env.NEXT_PUBLIC_SELLER_ADDRESS || "";

// Inisialisasi node provider Blockfrost
const nodeProvider = new BlockfrostProvider(blockfrostApiKey);

// Mendapatkan pubKeyHash dari wallet address merchant
const signerHash = deserializeAddress(merchantAddress).pubKeyHash;

// Menentukan harga produk dan fee
const price = 10;
const platformFee = 1;
const deliveryFee = 3;

export default function Marketplace() {
  // Initial states
  const { connected, wallet } = useWallet();
  const [view, setView] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);

  // Fungsi mengembalikan parameter-parameter ke nilai semula
  function clearStates() {
    setView(1);
    setQuantity(1);
    setTotalPrice(0);
  }

  // Fungsi membaca informasi wallet
  async function getWalletInfo() {
    const walletAddress = await wallet.getChangeAddress();
    const utxos = await wallet.getUtxos();
    return { walletAddress, utxos };
  }

  async function txHandler() {
    try {
      // Menghitung total harga
      const totalPrice = price * quantity + platformFee + deliveryFee;

      // Menentukan jumlah aset yang akan di kunci
      const lovelaceAmount = (totalPrice * 1000000).toString();
      const assets: Asset[] = [{ unit: "lovelace", quantity: lovelaceAmount }];

      // Mendapatkan wallet address dan index utxo
      const { walletAddress, utxos } = await getWalletInfo();

      // Membuat draft transaksi
      const txBuild = new MeshTxBuilder({
        fetcher: nodeProvider,
        evaluator: nodeProvider,
        verbose: true,
      });
      const txDraft = await txBuild
        .setNetwork("preprod")
        .txOut(contractAddress, assets)
        .txOutDatumHashValue(mConStr0([signerHash]))
        .changeAddress(walletAddress)
        .selectUtxosFrom(utxos)
        .complete();

      // Menandatangani transaksi
      let signedTx;
      try {
        signedTx = await wallet.signTx(txDraft);
      } catch (error) {
        return;
      }

      // Submit transaksi dan mendapatkan transaksi hash
      const txHash_ = await wallet.submitTx(signedTx);
      alert(`Transaction successful : ${txHash_}`);
      clearStates();
      return;
    } catch (error) {
      // Error handling jika transaksi gagal
      alert(`Transaction failed ${error}`);
      clearStates();
      return;
    }
  }

  // Fungsi untuk menghitung harga total
  function checkoutHandler() {
    const total = price * quantity + platformFee + deliveryFee;
    setTotalPrice(total);
    setView(2);
  }

  return (
    <div className="flex-col justify-center items-center text-white">
      {/* NAVBAR */}
      <div className="bg-gray-900 flex justify-between items-center p-6 border-b border-white mb-20">
        <h1 className="text-4xl font-bold">MARKETPLACE</h1>
        <CardanoWallet />
      </div>

      {connected && view === 1 && (
        <div className="flex justify-center items-center">
          <div className="p-6 bg-indigo-800 rounded-3xl flex justify-start gap-6">
            <Image
              src="/merchandise.jpg"
              alt="merchandise"
              width={200}
              height={200}
              className="rounded-xl"
            />
            <div>
              <h1 className="text-yellow-500 text-2xl font-bold">
                Cardano Workshop Special Mug
              </h1>
              <p className="text-xl font-bold mb-2">Price 10₳</p>
              <p>Product Description :</p>
              <p className="w-96">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Corporis recusandae quod voluptate non enim ducimus commodi
                praesentium, veniam quos
              </p>
              <div className="flex justify-between items-center gap-6 mt-4">
                <div className="w-28 h-8 flex justify-center items-center">
                  <button
                    onClick={() =>
                      quantity > 1 ? setQuantity(quantity - 1) : setQuantity(1)
                    }
                    className="w-8 bg-yellow-500 text-indigo-900 font-bold rounded-l-md hover:bg-yellow-400"
                  >
                    -
                  </button>
                  <span className="w-8 text-center bg-gray-200 text-black flex justify-center items-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 bg-yellow-500 text-indigo-900 font-bold rounded-r-md hover:bg-yellow-400"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={checkoutHandler}
                  className="bg-yellow-500 py-1 rounded-xl w-full text-indigo-900 font-semibold hover:font-bold hover:bg-yellow-400"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {connected && view === 2 && (
        <div className="flex justify-center items-center">
          <div className="p-6 bg-indigo-800 rounded-3xl">
            <h1 className="text-center text-2xl font-bold mb-4">INVOICE</h1>
            <div className="flex gap-4 mb-4">
              <Image
                src="/merchandise.jpg"
                alt="merchandise"
                width={100}
                height={100}
                className="rounded-xl"
              />
              <h1 className="w-32 text-yellow-500 text-xl font-bold">
                Cardano Workshop Special Mug
              </h1>
            </div>
            <div className="grid grid-cols-2 mb-1">
              <div className="mr-6">Quantity {quantity}x</div>
              <div className="text-right">{price}₳</div>
              <div className="mr-6">Platform Fee</div>
              <div className="text-right">{platformFee}₳</div>
              <div className="mr-6">Delivery Fee</div>
              <div className="text-right">{deliveryFee}₳</div>
            </div>
            <hr className="mb-1" />
            <div className="grid grid-cols-2 mb-4">
              <div className="mr-6">Total Price</div>
              <div className="text-right">{totalPrice}₳</div>
            </div>
            <button
              onClick={txHandler}
              className="bg-yellow-500 py-1 rounded-xl w-full text-indigo-900 font-semibold hover:font-bold hover:bg-yellow-400 mb-4"
            >
              Pay Now
            </button>
            <button
              onClick={() => setView(1)}
              className="bg-gray-200 py-1 rounded-xl w-full text-indigo-900 font-semibold hover:font-bold hover:bg-gray-300"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
