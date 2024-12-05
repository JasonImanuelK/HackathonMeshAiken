use aiken/crypto.{VerificationKeyHash}

pub type Datum {
  owner: VerificationKeyHash,
  buyer: VerificationKeyHash,
  status: ByteArray,
}

pub type Redeemer {
  MSpend { msg: ByteArray }
  MDone { msg: ByteArray }
}
