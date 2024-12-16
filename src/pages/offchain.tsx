import {
    BlockfrostProvider,
    deserializeAddress,
    serializePlutusScript,
    mConStr0,
    MeshTxBuilder,
    Asset,
    BrowserWallet,
    stringToHex,
    deserializeDatum,
    ConStr0,
    PubKeyHash,
    Integer,
    mConStr1,
    UTxO
  } from "@meshsdk/core";
  import { applyParamsToScript } from "@meshsdk/core-csl";

import contractBlueprint from "../../aiken-workspace/plutus.json";

  const scriptCbor = applyParamsToScript(
    contractBlueprint.validators[0].compiledCode,
    []
  );
  const contractAddress = serializePlutusScript(
    { code: scriptCbor, version: "V3" },
    undefined,
    0
  ).address;

  const blockfrostApiKey = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY || "";
  const nodeProvider = new BlockfrostProvider(blockfrostApiKey);
  const merchantAddress = process.env.NEXT_PUBLIC_SELLER_ADDRESS || "";
  const ownerHash = deserializeAddress(merchantAddress).pubKeyHash;
  const refNumber = "17925";

export type MarketDatum = ConStr0<
  [PubKeyHash, PubKeyHash, Integer]
>;

async function getWalletInfo(wallet: BrowserWallet) {
    const walletAddress = await wallet.getChangeAddress();
    const utxos = await wallet.getUtxos();
    const collateral = (await wallet.getCollateral())[0]; 
    return { walletAddress, utxos, collateral };
}

export async function purchase(totalPrice: number, wallet: BrowserWallet): Promise<boolean> {
    try {
      const lovelaceAmount = (totalPrice * 1000000).toString();
      const assets: Asset[] = [{ unit: "lovelace", quantity: lovelaceAmount }];

      // Mendapatkan wallet address dan index utxo
      const { walletAddress, utxos, collateral: _ } = await getWalletInfo(wallet);

      const buyerHash = deserializeAddress(walletAddress).pubKeyHash;

      // Membuat draft transaksi
      const txBuild = new MeshTxBuilder({
        fetcher: nodeProvider,
        evaluator: nodeProvider,
        verbose: true,
      });
      const txDraft = await txBuild
        .setNetwork("preprod")
        .txOut(contractAddress, assets)
        .txOutInlineDatumValue(mConStr0([ownerHash,buyerHash,0]))
        .changeAddress(walletAddress)
        .selectUtxosFrom(utxos)
        .complete();

      // Menandatangani transaksi
      let signedTx;
      try {
        signedTx = await wallet.signTx(txDraft);
      } catch (error) {
        return false;
      }

      const txHash_ = await wallet.submitTx(signedTx);
      return true;
    } catch (error) {
      return false;
    }
}

export async function withdraw(
    txHash: string,
    index: number,
    amount: Asset[],
    address: string,
    wallet: BrowserWallet
  ) : Promise<boolean> {
    try {
      // Mendapatkan alamat wallet, list utxo, dan kolateral dari wallet address penerima dana
      const { walletAddress, utxos, collateral } = await getWalletInfo(wallet);

      const ownerHash = deserializeAddress(walletAddress).pubKeyHash;

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
        .spendingReferenceTxInInlineDatumPresent()
        .txInScript(scriptCbor)
        .spendingReferenceTxInRedeemerValue(mConStr0([stringToHex(refNumber)]))
        .requiredSignerHash(ownerHash)
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
        return false;
      }

      // Submit transaksi dan mendapatkan transaksi hash
      const txHash_ = await wallet.submitTx(signedTx);
      return true;
    } catch (error) {
      return false;
    }
}

export async function changeStatus(
    txHash: string,
    index: number,
    amount: Asset[],
    address: string,
    plutusData: string | undefined,
    wallet: BrowserWallet
  ): Promise<boolean> {
    try {
      const { walletAddress, utxos, collateral } = await getWalletInfo(wallet);
      const buyerHash = deserializeAddress(walletAddress).pubKeyHash;

      let datum = deserializeDatum<MarketDatum>(plutusData!);

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
        .spendingReferenceTxInInlineDatumPresent()
        .spendingReferenceTxInRedeemerValue(mConStr1([stringToHex(refNumber)]))
        .txOut(contractAddress, amount)
        .txOutInlineDatumValue(mConStr0([datum.fields[0].bytes,datum.fields[1].bytes,1]))
        .requiredSignerHash(buyerHash)
        .changeAddress(walletAddress)
        .txInCollateral(
          collateral.input.txHash,
          collateral.input.outputIndex,
          collateral.output.amount,
          collateral.output.address
        )
        .selectUtxosFrom(utxos)
        .complete();

      let signedTx;
      try {
        signedTx = await wallet.signTx(txDraft);
      } catch (error) {
        return false;
      }

      const txHash_ = await wallet.submitTx(signedTx);
      return true;
    } catch (error) {
      return false;
    }
}

export async function getUtxosListContractAddr(wallet: BrowserWallet, actor: string): Promise<UTxO[]>{
    const utxosContract: UTxO[] = await nodeProvider.fetchAddressUTxOs(contractAddress);

    const { walletAddress} = await getWalletInfo(wallet);
    const walletHash = deserializeAddress(walletAddress).pubKeyHash;
    
    const newUtxos: UTxO[] = [];
    utxosContract.forEach((utxo) => {
      console.log("UTxO:", utxo);
      if (utxo.output.plutusData !== undefined) {
        const datum = deserializeDatum<MarketDatum>(utxo.output.plutusData!);
        console.log("Datum INSIDE :",datum)
        const index = actor === 'owner' ? 0 : 1
        if (datum.fields[index].bytes === walletHash) {
          newUtxos.push(utxo);
        }
      } else {
        console.log("plutusData is undefined");
        newUtxos.push(utxo);
      } 
    });
    return newUtxos;
}