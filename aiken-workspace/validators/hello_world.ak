// Library standar yang digunakan
use aiken/collection/list
use cardano/transaction.{OutputReference, Transaction}
use types.{Datum, MDone, MSpend, Redeemer}

validator hello_world {
  spend(
    pDatum: Option<Datum>,
    redeemer: Redeemer,
    _own_ref: OutputReference,
    tx: Transaction,
  ) {
    when redeemer is {
      MSpend { msg } -> {
        expect Some(d) = pDatum
        let messageCorrect = msg == "17925"
        let realOwner = list.has(tx.extra_signatories, d.owner)
        let deliveryDone = d.status == 1

        messageCorrect && realOwner && deliveryDone
      }
      MDone { msg } -> {
        expect Some(d) = pDatum
        let messageCorrect = msg == "17925"
        let realBuyer = list.has(tx.extra_signatories, d.buyer)

        messageCorrect && realBuyer
      }
    }
  }

  else(_) {
    fail
  }
}

test scenario_1() {
  let owner = #"00000000000000000000000000000000000000000000000000000000"
  let buyer = #"00000000000000000000000000000000000000000000000000000000"
  let datum = Datum { owner, buyer, status: 1 }
  let redeemer = MSpend("17925")
  let placeholder_utxo = OutputReference { transaction_id: "", output_index: 0 }

  hello_world.spend(
    Some(datum),
    redeemer,
    placeholder_utxo,
    Transaction { ..transaction.placeholder, extra_signatories: [datum.owner] },
  )
}

test scenario_2() {
  let owner = #"00000000000000000000000000000000000000000000000000000000"
  let buyer = #"00000000000000000000000000000000000000000000000000000000"
  let datum = Datum { owner, buyer, status: 0 }
  let redeemer = MDone("17925")
  let placeholder_utxo = OutputReference { transaction_id: "", output_index: 0 }

  hello_world.spend(
    Some(datum),
    redeemer,
    placeholder_utxo,
    Transaction { ..transaction.placeholder, extra_signatories: [datum.buyer] },
  )
}
