import React from 'react'
import { translate, actions } from 'decorators'
import styles from './styles.module'
import classNames from 'classnames'
import { Icons, Button } from '@linkdrop/ui-kit'
import { AssetBalance } from 'components/common'
import widgetService from 'data/api/widget'

@actions(({ user: { ens }, assets: { items } }) => ({
  items,
  ens
}))
@translate('pages.common.assetsList')
class AssetsList extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      expanded: false
    }
  }

  renderDappButton () {
    return <Button className={styles.button} inverted onClick={() => widgetService.hideWidget()} >{this.t('buttons.continue')}</Button>
  }

  render () {
    const { items } = this.props
    const { expanded } = this.state
    return <div className={styles.container}>
      <div className={classNames(styles.assets, { [styles.assetsExpanded]: expanded })}>
        <div className={styles.assetsHeader} onClick={_ => this.setState({ expanded: !expanded })}>
          {this.t('titles.digitalAssets')}
          <Icons.PolygonArrow fill='#000' />
        </div>
        <div className={styles.assetsContent}>
          <div className={styles.assetsContentItems}>
            {this.renderAssets({ items })}
          </div>
          {this.renderDappButton()}
        </div>
      </div>
    </div>
  }

  renderAssets ({ items }) {
    if (items.length === 0) {
      return <div className={styles.note} dangerouslySetInnerHTML={{ __html: this.t('texts.empty') }} />
    }
    return items.map(({
      icon,
      symbol,
      balanceFormatted,
      tokenAddress,
      price
    }) => <AssetBalance
      key={tokenAddress}
      symbol={symbol}
      amount={balanceFormatted}
      price={price}
      icon={icon}
    />)
  }
}

export default AssetsList
