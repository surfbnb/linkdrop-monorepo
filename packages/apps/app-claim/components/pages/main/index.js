import React from 'react'
import { Loading } from '@linkdrop/ui-kit'
import { actions, translate, platform } from 'decorators'
import InitialPage from './initial-page'
import { Page } from 'components/pages'
import ClaimingProcessPage from './claiming-process-page'
import ErrorPage from './error-page'
import ClaimingFinishedPage from './claiming-finished-page'
import { getHashVariables, defineNetworkName, capitalize } from '@linkdrop/commons'
import { Web3Consumer } from 'web3-react'

@actions(({ user: { errors, step, loading: userLoading, readyToClaim, alreadyClaimed }, tokens: { transactionId }, assets: { loading, itemsToClaim } }) => ({
  userLoading,
  loading,
  itemsToClaim,
  step,
  transactionId,
  errors,
  alreadyClaimed,
  readyToClaim
}))
@platform()
@translate('pages.claim')
class Main extends React.Component {
  componentDidMount () {
    const {
      linkKey,
      chainId,
      linkdropMasterAddress,
      campaignId
    } = getHashVariables()
    this.actions().tokens.checkIfClaimed({ linkKey, chainId, linkdropMasterAddress, campaignId })
    this.actions().user.createSdk({ linkdropMasterAddress, chainId, linkKey, campaignId })
  }

  componentWillReceiveProps ({ readyToClaim, alreadyClaimed }) {
    const { readyToClaim: prevReadyToClaim } = this.props
    if (
      (readyToClaim === true && prevReadyToClaim === true) ||
      readyToClaim == null ||
      readyToClaim === false ||
      alreadyClaimed == null
    ) { return }
    const {
      tokenAddress,
      weiAmount,
      tokenAmount,
      expirationTime,
      chainId,
      nftAddress,
      tokenId
    } = getHashVariables()
    // params in url:
    // token - contract/token address,
    // amount - tokens amount,
    // expirationTime - expiration time of link,
    // sender,
    // linkdropSignerSignature,
    // linkKey - private key for link,
    // chainId - network id

    // params needed for claim
    // sender: sender key address, e.g. 0x1234...ff
    // linkdropSignerSignature: ECDSA signature signed by sender (contained in claim link)
    // receiverSignature: ECDSA signature signed by receiver using link key

    // destination: destination address - can be received from web3-react context
    // token: ERC20 token address, 0x000...000 for ether - can be received from url params
    // tokenAmount: token amount in atomic values - can be received from url params
    // expirationTime: link expiration time - can be received from url params
    if (Number(expirationTime) < (+(new Date()) / 1000)) {
      // show error page if link expired
      return this.actions().user.setErrors({ errors: ['LINK_EXPIRED'] })
    }

    if (nftAddress && tokenId) {
      this.actions().assets.getTokenERC721Data({ nftAddress, tokenId, chainId })
    } else {
      this.actions().assets.getTokenERC20Data({ tokenAddress, tokenAmount, chainId })
    }
    this.actions().assets.getEthData({ weiAmount, chainId })
  }

  render () {
    const { step } = this.props
    return <Page dynamicHeader>
      <Web3Consumer>
        {context => this.renderCurrentPage({ context })}
      </Web3Consumer>
    </Page>
  }

  renderCurrentPage ({ context }) {
    const { itemsToClaim, userLoading, errors, alreadyClaimed } = this.props
    // in context we can find:
    // active,
    // connectorName,
    // connector,
    // library,
    // networkId,
    // account,
    // error
    const step = 3
    const {
      account,
      networkId
    } = context
    const {
      chainId,
      linkdropMasterAddress
    } = getHashVariables()
    const commonData = { linkdropMasterAddress, chainId, itemsToClaim, wallet: account, loading: userLoading }
    if (this.platform === 'desktop' && !account) {
      return <div>
        <ErrorPage
          error='NEED_METAMASK'
        />
      </div>
    }
    if (errors && errors.length > 0) {
      // if some errors occured and can be found in redux store, then show error page
      return <ErrorPage error={errors[0]} />
    }
    if (
      (this.platform === 'desktop' && networkId && Number(chainId) !== Number(networkId)) ||
      (this.platform !== 'desktop' && account && networkId && Number(chainId) !== Number(networkId))) {
      // if network id in the link and in the web3 are different
      return <ErrorPage error='NETWORK_NOT_SUPPORTED' network={capitalize({ string: defineNetworkName({ chainId }) })} />
    }

    if (alreadyClaimed) {
      // if tokens we already claimed (if wallet is totally empty).
      return <ClaimingFinishedPage
        {...commonData}
      />
    }
    switch (step) {
      case 1:
        return <InitialPage
          {...commonData}
          onClick={_ => {
            if (account) {
              // if wallet account was found in web3 context, then go to step 2 and claim assets
              return this.actions().user.setStep({ step: 2 })
            }
          }}
        />
      case 2:
        // claiming is in process
        return <ClaimingProcessPage
          {...commonData}
        />
      case 3:
        // claiming finished successfully
        return <ClaimingFinishedPage
          {...commonData}
        />
      default:
        // зloading
        return <Loading />
    }
  }
}

export default Main
