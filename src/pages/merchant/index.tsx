/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useWallet } from "@meshsdk/react";
import {
  BlockfrostProvider,
  UTxO,
  deserializeAddress,
  deserializeDatum,
  serializePlutusScript,
  mConStr0,
  ConStr0,
  stringToHex,
  MeshTxBuilder,
  Asset,
  PubKeyHash,
  Integer,
} from "@meshsdk/core";
import { applyParamsToScript } from "@meshsdk/core-csl";
import { useRouter } from "next/router";
import { checkSession } from "../api/authService";

// Integrasi smart-contract
import contractBlueprint from "../../../aiken-workspace/plutus.json";
import { notifyError } from "@/utils/notifications";

export type MarketDatum = ConStr0<
  [PubKeyHash, PubKeyHash, Integer]
>;

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

// Loading environment variable blockfrost API key dan seedphrares wallet
const blockfrostApiKey = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY || "";

// Inisiasi node provider Blockfrost
const nodeProvider = new BlockfrostProvider(blockfrostApiKey);

// Reference number sebagai Redeemer
const refNumber = "17925";

// Jeda 10 detik setelah berhasil transaksi
const timeout = 30000;

const merchantAddress = process.env.NEXT_PUBLIC_SELLER_ADDRESS || "";
const signerHash = deserializeAddress(merchantAddress).pubKeyHash;

export default function Merchant() {
  const router = useRouter();
  const { connected, wallet } = useWallet();
  const [loading, setLoading] = useState(true);
  const [utxoList, setUtxoList] = useState<UTxO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUtxoList([]);
    sessionHandler();
    if (connected) {
      getUtxosListContractAddr();
    }
  }, [connected]);

  async function sessionHandler(){
    try{      
      const walletAddress = await wallet.getChangeAddress()
      const checkResult = await checkSession(walletAddress, 3);
      if (checkResult) {
        setIsLoading(false)
      } else {
        notifyError("You don't permission to be here. Maybe upgrade your membership ?")
        router.push("/")
      }
    } catch {
      notifyError("You don't permission to be here. Sign in first !")
      router.push("/")
    }
  }

  async function getUtxosListContractAddr() {
    const utxos: UTxO[] = await nodeProvider.fetchAddressUTxOs(contractAddress);
    
    const newUtxos: UTxO[] = [];
    utxos.slice(2).forEach((utxo) => {
      console.log("UTxO:", utxo);
      if (utxo.output.plutusData !== undefined) {
        const datum = deserializeDatum<MarketDatum>(utxo.output.plutusData!);
        console.log("Datum INSIDE :",datum)
        if (datum.fields[0].bytes === signerHash) {
          newUtxos.push(utxo);
        }
      } else {
        console.log("plutusData is undefined");
        newUtxos.push(utxo);
      } 
    });

    setUtxoList(newUtxos);
  }

  // Fungsi membaca informasi wallet
  async function getWalletInfo() {
    const walletAddress = await wallet.getChangeAddress();
    const utxos = await wallet.getUtxos();
    const collateral = (await wallet.getCollateral())[0];
    return { walletAddress, utxos, collateral };
  }

  async function handleTx(
    txHash: string,
    index: number,
    amount: Asset[],
    address: string
  ) {
    try {
      // Mendapatkan alamat wallet, list utxo, dan kolateral dari wallet address penerima dana
      const { walletAddress, utxos, collateral } = await getWalletInfo();

      // Membuat draft transaksi
      const txBuild = new MeshTxBuilder({
        fetcher: nodeProvider,
        evaluator: nodeProvider,
        verbose: true,
      });
      const txDraft = await txBuild
        .setNetwork("preprod")
        .spendingPlutusScript("V3")
        .txIn(txHash, index, amount, address)
        .txInScript(scriptCbor)
        .txInRedeemerValue(mConStr0([stringToHex(refNumber)]))
        .txInDatumValue(mConStr0([signerHash]))
        .requiredSignerHash(signerHash)
        .changeAddress(walletAddress)
        .txInCollateral(
          collateral.input.txHash,
          collateral.input.outputIndex,
          collateral.output.amount,
          collateral.output.address
        )
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
      setLoading(false);
      setUtxoList([]);

      // Jeda, setelah berhasil transaksi lalu muat ulang list UTxO dari contract address
      setTimeout(() => {
        alert(`Transaction successful : ${txHash_}`);
        getUtxosListContractAddr();
        setLoading(true);
      }, timeout);

      return;
    } catch (error) {
      // Error handling jika transaksi gagal
      alert(`Transaction failed ${error}`);
      return;
    }
  }

  if (isLoading) {
    return <h1 className="flex justify-center items-center h-screen text-2xl">Checking session...</h1>;
  }

  return (
    <div className="flex-col justify-center items-center">
      {/* NAVBAR */}
      <div className="bg-gray-900 flex justify-between items-center p-6 border-b border-white text-white mb-24">
        <h1 className="text-4xl font-bold">MERCHANT PAYOUT</h1>
      </div>

      {/* TABLE */}
      {connected && (
        <div className="flex justify-center items-center">
          {utxoList.length === 0 && !loading && (
            <p className="font-semibold text-lg">Loading...</p>
          )}
          {utxoList.length === 0 && loading && (
            <p className="font-semibold text-lg">No Funds</p>
          )}
          {utxoList.length > 0 && loading && (
            <table className="table-auto border-collapse border border-gray-300 w-3/4">
              <thead>
                <tr className="bg-gray-100 text-black">
                  <th className="border border-gray-300 px-4 py-2">
                    Transaction-ID
                  </th>
                  <th className="border border-gray-300 px-4 py-2">Revenue</th>
                  <th className="border border-gray-300 px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {utxoList.map((utxo, index) => (
                  <tr key={index} className="text-center">
                    <td className="border border-gray-300 px-4 py-2">
                      {utxo.input.txHash}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {Number(utxo.output.amount[0].quantity) / 1_000_000} ADA
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <button
                        className="bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold p-2 rounded"
                        onClick={() =>
                          handleTx(
                            utxo.input.txHash,
                            utxo.input.outputIndex,
                            utxo.output.amount,
                            utxo.output.address
                          )
                        }
                      >
                        Withdraw
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
