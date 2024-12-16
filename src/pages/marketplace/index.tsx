/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import Image from "next/image";
import { useWallet } from "@meshsdk/react";
import { useRouter } from "next/router";
import { checkSession } from "../api/authService";
import { notifyError } from "@/utils/notifications";
import { purchase } from "../offchain";

const price = 10;
const platformFee = 1;
const deliveryFee = 3;

export default function Marketplace() {
  const router = useRouter();
  const { connected, wallet } = useWallet();
  const [view, setView] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [rank, setRank] = useState(0);

  useEffect(() => {
    sessionHandler();
  }, [connected]);

  async function sessionHandler(){
    try{      
      const walletAddress = await wallet.getChangeAddress()
      const checkResult = await checkSession(walletAddress, 1);
      if (checkResult) {
        setRank(checkResult)
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

  function clearStates() {
    setView(1);
    setQuantity(1);
    setTotalPrice(0);
  }

  async function txHandler() {
    try {
      const totalPrice = price * quantity + platformFee + deliveryFee;

      const res = await purchase(totalPrice,wallet);

      if (res){
        alert(`Transaction successful`);
        clearStates();
        return;
      } else{
        alert(`Transaction failed`);
        clearStates();
      }
    } catch (error) {
      alert(`Transaction failed`);
      clearStates();
      return;
    }
  }

  function checkoutHandler() {
    if(rank > 1){
      const total = price * quantity + platformFee + deliveryFee;
      setTotalPrice(total);
      setView(2);
    } else {
      notifyError("You don't have permission to buy. Upgrade your membership !")
    }
    
  }

  if (isLoading) {
    return <h1 className="flex justify-center items-center h-screen text-2xl">Checking session...</h1>;
  }

  return (
    <div className="flex-col justify-center items-center text-white">
      {/* NAVBAR */}
      <div className="bg-gray-900 flex justify-between items-center p-6 border-b border-white mb-20">
        <h1 className="text-4xl font-bold">MARKETPLACE</h1>
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
