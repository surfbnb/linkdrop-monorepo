import { put } from 'redux-saga/effects'
import { factory, apiHost, jsonRpcUrl } from 'app.config.js'
import LinkdropSDK from 'sdk/src/index'
import { ethers } from 'ethers'
import { defineNetworkName } from 'linkdrop-commons'
import LinkdropFactory from 'contracts/LinkdropFactory.json'

const generator = function * ({ payload }) {
  try {
    const { wallet, isApprove = 'false', nftAddress, tokenId, weiAmount, expirationTime, chainId, linkKey, linkdropMasterAddress, linkdropSignerSignature } = payload
    yield put({ type: 'USER.SET_LOADING', payload: { loading: true } })
    const networkName = defineNetworkName({ chainId })
    const provider = yield ethers.getDefaultProvider(networkName)
    const factoryContract = yield new ethers.Contract(factory, LinkdropFactory.abi, provider)
    const version = yield factoryContract.getProxyMasterCopyVersion(linkdropMasterAddress)
    const { success, txHash, error } = yield LinkdropSDK.claimERC721({
      jsonRpcUrl,
      host: apiHost,
      weiAmount: weiAmount || '0',
      nftAddress,
      tokenId,
      expirationTime,
      linkKey,
      linkdropMasterAddress,
      linkdropSignerSignature,
      chainId,
      receiverAddress: wallet,
      isApprove,
      version: String(version.toNumber())
    })

    if (success) {
      yield put({ type: 'TOKENS.SET_TRANSACTION_ID', payload: { transactionId: txHash } })
    } else {
      console.error({ error })
    }
    yield put({ type: 'USER.SET_LOADING', payload: { loading: false } })
  } catch (e) {
    console.error(e)
  }
}

export default generator