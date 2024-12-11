import { useState, useEffect } from "react";
import { addCookies, checkSession, deleteCookies } from './api/authService';
import { useWallet } from "@meshsdk/react";
import { notifySuccess, notifyWarning, notifyError } from "@/utils/notifications";

export default function Home() {
  const { connected, wallet, disconnect } = useWallet();
  const [session, setSessionState] = useState<boolean>(false);

  const token1 = process.env.NEXT_PUBLIC_TOKEN_1;
  const token2 = process.env.NEXT_PUBLIC_TOKEN_2;
  const token3 = process.env.NEXT_PUBLIC_TOKEN_3;
  const policyID = process.env.NEXT_PUBLIC_POLICY_ID;

  useEffect(() => {
    if (connected) {
      checkNftCredentials();
    }
  }, [connected]);

  async function handleSignOut(){
    try {
      disconnect();
      deleteCookies();
      setSessionState(false);
      console.log("Session : ",session)
      notifySuccess("Sign Out Successful.")
    } catch (error: unknown) {
      notifyError("Sign Out Failed.");
    }
  }

  async function checkNftCredentials() {
    try {
      const _assets = await wallet.getAssets();
      const walletAdd = await wallet.getChangeAddress();

      const filteredAsset: any = _assets.filter(
        (asset: { assetName: string; policyId: string }) =>
          (asset.assetName === token1 ||
            asset.assetName === token2 ||
            asset.assetName === token3) &&
          asset.policyId === policyID
      );

      if (filteredAsset.length === 0) {
        notifyWarning("You don't have any of the required assets.");
        return;
      }
      else {
        const tokens = [token3, token2, token1]; 
        let membershipType: string | null = null;

        for (const token of tokens) {
          for (const asset of filteredAsset) {
            if (asset.assetName === token) {
              
              if (token === token3) {
                membershipType = "Platinum Member";
              } else if (token === token2) {
                membershipType = "Gold Member";
              } else if (token === token1) {
                membershipType = "Silver Member";
              }
              break; 
            }
          }
          if (membershipType) {
            break; 
          }
        }
        
        if (membershipType) {
          const walletAddress = await wallet.getChangeAddress()
          const checkResult = await checkSession(walletAddress, 1);
          if (!checkResult) {
            const checkLogin = await addCookies(walletAdd, membershipType);
            setSessionState(true);

            if (checkLogin){
              notifySuccess("Sign In Successful.");
            } else {
              notifyError("Sign In Failed.");
            }
          } else {
            setSessionState(true);
          }     
        } 
      }
    } catch (error) {
      console.error("Error fetching assets:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white text-center flex justify-center items-center">
      <div>
        <h1 className="mb-1 text-4xl font-bold">WELCOME TO </h1>
        <h1 className="mb-8 text-4xl font-bold">WEB3 MARKET PLACE</h1>
        {session && (
          <button onClick={handleSignOut}
            className="bg-yellow-500 py-1 rounded-xl w-full text-indigo-900 font-semibold hover:font-bold hover:bg-yellow-400">
            Sign Out
          </button>
        )}
      </div>
    </div>    
  );
}
