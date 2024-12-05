// Library standar yang digunakan
use aiken/collection/list
use cardano/transaction.{OutputReference, Transaction}
use types.{Datum, MDone, MSpend, Redeemer}

validator hello_world {
  spend(
    datum: Option<Datum>,
    redeemer: Redeemer,
    _own_ref: OutputReference,
    tx: Transaction,
  ) {
    expect Some(d) = datum

    when redeemer is {
      MSpend { msg } -> and {
          msg == "17925",
          list.has(tx.extra_signatories, d.owner),
          d.status == "Done",
        }
      MDone { msg } -> {
        expect _newDatum = d
        and {
          msg == "17925",
          list.has(tx.extra_signatories, d.buyer),
        }
      }
    }
  }

  else(_) {
    fail
  }
}

// Skenario_1: Pesan atau isi Redeemer tidak valid dan transaksi tidak disetujui user
test scenario_1() {
  let owner = #"00000000000000000000000000000000000000000000000000000000"
  let buyer = #"00000000000000000000000000000000000000000000000000000000"
  let datum = Datum { owner, buyer, status: "Done" }
  let redeemer = MSpend("17925")
  let placeholder_utxo = OutputReference { transaction_id: "", output_index: 0 }

  hello_world.spend(
    Some(datum),
    redeemer,
    placeholder_utxo,
    Transaction { ..transaction.placeholder, extra_signatories: [datum.owner] },
  )
}
// test scenario_2() {
//   let datum =
//     Datum { owner: #"00000000000000000000000000000000000000000000000000000000" }
//   let redeemer = Redeemer { msg: "17925" }

//   let placeholder_utxo =
//     OutputReference { transaction_id: " ", output_index: 0 }

//   hello_world.spend(
//     Some(datum),
//     redeemer,
//     placeholder_utxo,
//     transaction.placeholder,
//   )
// }

// test scenario_3() {
//   let datum =
//     Datum { owner: #"00000000000000000000000000000000000000000000000000000000" }
//   let redeemer = Redeemer { msg: "17925" }

//   let placeholder_utxo =
//     OutputReference { transaction_id: " ", output_index: 0 }

//   hello_world.spend(
//     Some(datum),
//     redeemer,
//     placeholder_utxo,
//     Transaction { ..transaction.placeholder, extra_signatories: [datum.owner] },
//   )
// }
