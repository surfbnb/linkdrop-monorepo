import { takeEvery } from 'redux-saga/effects'

import sendEth from './every/send-eth'
import sendErc20 from './every/send-erc20'
import sendErc20WithEth from './every/send-erc20-with-eth'

export default function * () {
  yield takeEvery('*METAMASK.SEND_ETH', sendEth)
  yield takeEvery('*METAMASK.SEND_ERC20', sendErc20)
  yield takeEvery('*METAMASK.SEND_ERC20_WITH_ETH', sendErc20WithEth)
}
