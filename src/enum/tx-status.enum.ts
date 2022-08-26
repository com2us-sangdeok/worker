//transaction.dao
export enum TxStatus {
  WAIT,
  PENDING,
  SUCCESS,
  FAIL,
  PENDINGINVALID,
  // broadcast시 실패 할 경우(블록 반영x)
  REJECT = 99,
}
