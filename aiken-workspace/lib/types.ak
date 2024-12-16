use aiken/crypto.{VerificationKeyHash}

pub type Datum {
  owner: VerificationKeyHash,
  buyer: VerificationKeyHash,
  status: Int,
}

pub type Redeemer {
  MSpend { msg: ByteArray }
  MDone { msg: ByteArray }
}
