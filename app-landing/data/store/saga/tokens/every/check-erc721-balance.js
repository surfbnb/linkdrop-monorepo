import { put } from 'redux-saga/effects'
import { ethers } from 'ethers'
import { defineNetworkName } from 'linkdrop-commons'
import NFTMock from 'contracts/NFTMock.json'

const generator = function * ({ payload }) {
  try {
    yield put({ type: 'USER.SET_LOADING', payload: { loading: true } })
    let { account, networkId, tokenAddress, tokenId } = payload
    const networkName = defineNetworkName({ networkId })
    const provider = yield ethers.getDefaultProvider(networkName)
    const nftContract = yield new ethers.Contract(tokenAddress, NFTMock.abi, provider)
    const nftContractOwner = yield nftContract.ownerOf(tokenId)
    if (nftContractOwner.toLowerCase() === account.toLowerCase()) {
      yield put({ type: 'TOKENS.SET_TOKEN_ID', payload: { tokenId: tokenId } })
      yield put({ type: 'TOKENS.SET_TOKEN_ADDRESS', payload: { tokenAddress } })
    }

    yield put({ type: 'USER.SET_LOADING', payload: { loading: false } })
  } catch (e) {
    console.error(e)
    yield put({ type: 'USER.SET_ERRORS', payload: { errors: ['PROBLEM_WITH_EXRTERNAL_LIBRARY'] } })
    yield put({ type: 'USER.SET_STEP', payload: { step: 1 } })
  }
}

export default generator
