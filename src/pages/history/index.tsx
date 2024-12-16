/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useWallet } from "@meshsdk/react";
import {
  UTxO,
  deserializeDatum,
  Asset,
} from "@meshsdk/core";
import { useRouter } from "next/router";
import { checkSession } from "../api/authService";

import { notifySuccess, notifyError } from "@/utils/notifications";
import { changeStatus, getUtxosListContractAddr, MarketDatum } from "../offchain";

const timeout = 10000;

export default function Merchant() {
  const router = useRouter();
  const { connected, wallet } = useWallet();
  const [loading, setLoading] = useState(true);
  const [utxoList, setUtxoList] = useState<UTxO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    sessionHandler();
    if (connected) {
      callUtxos(false);
    } else {
      setUtxoList([])
    }
  }, [connected]);

  async function sessionHandler(){
    try{      
      const walletAddress = await wallet.getChangeAddress()
      const checkResult = await checkSession(walletAddress, 2);
      if (checkResult) {
        setIsLoading(false)
      } else {
        notifyError("You don't have permission to be here. Maybe upgrade your membership ?")
        router.push("/")
      }
    } catch {
      notifyError("You don't have permission to be here. Sign in first !")
      router.push("/")
    }
  }

  async function callUtxos(notif: boolean){
    setUtxoList(await getUtxosListContractAddr(wallet,'buyer'));
    if (notif){
      notifySuccess("Refreshed");
    }
  }

  async function handleTx(
    txHash: string,
    index: number,
    amount: Asset[],
    address: string,
    plutusData: string | undefined
  ) {
    try {
      setLoading(false);
      const res = await changeStatus(txHash,index,amount,address,plutusData,wallet)

      if (res){
        setTimeout(() => {
          alert(`Transaction successful`);
          getUtxosListContractAddr(wallet,'buyer');
          setLoading(true);
        }, timeout);
      } else{
        alert(`Transaction failed`);
        setLoading(true);
      }
    } catch (error) {
      alert(`Transaction failed`);
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
        <h1 className="text-4xl font-bold">Transaction History</h1>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded"
          onClick={() => callUtxos(true)}
        >
          Refresh
        </button>
      </div>

      {/* TABLE */}
      {connected && (
        <div className="flex justify-center items-center">
          {utxoList.length === 0 && !loading && (
            <p className="font-semibold text-lg">Loading...</p>
          )}
          {utxoList.length === 0 && loading && (
            <p className="font-semibold text-lg">No Transactions</p>
          )}
          {utxoList.length > 0 && loading && (
            <table className="table-auto border-collapse border border-gray-300 w-3/4">
              <thead>
                <tr className="bg-gray-100 text-black">
                  <th className="border border-gray-300 px-4 py-2">
                    Transaction-ID
                  </th>
                  <th className="border border-gray-300 px-4 py-2">Price</th>
                  <th className="border border-gray-300 px-4 py-2">Status</th>
                  <th className="border border-gray-300 px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
              {utxoList.map((utxo, index) => {
                const datum = deserializeDatum<MarketDatum>(utxo.output.plutusData!);
                const value = datum.fields[2].int as number;

                return (
                    <tr key={index} className="text-center">
                        <td className="border border-gray-300 px-4 py-2">
                            {utxo.input.txHash}
                        </td>

                        <td className="border border-gray-300 px-4 py-2">
                            {Number(utxo.output.amount[0].quantity) / 1_000_000} ADA
                        </td>

                        <td className="border border-gray-300 px-4 py-2">
                            {value == 0 ? (
                            <span className="text-yellow-500">On Delivery</span>
                            ) : (
                            <span className="text-green-500">Done</span>
                            )}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                            {value == 0 ? (
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold p-2 rounded"
                                    onClick={() =>
                                    handleTx(
                                        utxo.input.txHash,
                                        utxo.input.outputIndex,
                                        utxo.output.amount,
                                        utxo.output.address,
                                        utxo.output.plutusData
                                    )
                                    }
                                >
                                    Change Status
                                </button>
                            ) : (
                                <span>-</span>
                            )}
                        
                        </td>
                    </tr>
                );
                })}                
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
