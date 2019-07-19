import { put } from 'redux-saga/effects'
import initializeSdk from 'data/sdk'
import { jsonRpcUrl, apiHost, factory, initialBlockRinkeby, initialBlockMainnet } from 'app.config.js'
import { ethers } from 'ethers'
import Web3 from 'web3'
import LinkdropMastercopy from 'contracts/LinkdropMastercopy.json'
import { defineNetworkName } from 'linkdrop-commons'

const web3 = new Web3(Web3.givenProvider)

const generator = function * ({ payload }) {
  try {
    const { linkdropMasterAddress, chainId, linkKey, campaignId } = payload
    const networkName = defineNetworkName({ chainId })
    const sdk = initializeSdk({ factoryAddress: factory, chain: networkName, linkdropMasterAddress, jsonRpcUrl, apiHost })
    yield put({ type: 'USER.SET_SDK', payload: { sdk } })
    const address = sdk.computeProxyAddress(factory, linkdropMasterAddress, campaignId)
    const provider = yield ethers.getDefaultProvider(networkName)
    const linkWallet = yield new ethers.Wallet(linkKey, provider)
    const linkId = yield linkWallet.address
    const contract = yield new web3.eth.Contract(LinkdropMastercopy.abi, address)
    const initialBlock = Number(chainId) === 4 ? initialBlockRinkeby : initialBlockMainnet

    yield put({ type: '*CONTRACT.GET_PAST_EVENTS', payload: { networkName, linkId, contract, initialBlock } })
    yield put({ type: '*CONTRACT.SUBSCRIBE_TO_CLAIM_EVENT', payload: { networkName, linkId, contract, initialBlock } })
  } catch (e) {
    console.error(e)
  }
}

export default generator
