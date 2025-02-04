const Component = require('react').Component
const h = require('react-hyperscript')
const inherits = require('util').inherits
const TokenTracker = require('eth-token-watcher')
const connect = require('react-redux').connect
const selectors = require('../../../ui/app/selectors')
const log = require('loglevel')

function mapStateToProps (state) {
  return {
    userAddress: selectors.getSelectedAddress(state),
  }
}

module.exports = connect(mapStateToProps)(TokenBalance)


inherits(TokenBalance, Component)
function TokenBalance () {
  this.state = {
    string: '',
    symbol: '',
    isLoading: true,
    error: null,
  }
  Component.call(this)
}

TokenBalance.prototype.render = function () {
  const state = this.state
  const props = this.props
  const { symbol, string, isLoading } = state
  const { balanceOnly } = this.props
  var realTokenBalance=(parseFloat(string)).toLocaleString('en-US', {valute: 'USD'})

  const valueStyle = props.valueStyle ? props.valueStyle : {
    color: '#848484',
    width: '100%',
    fontSize: props.fontSize || '12px',
    textAlign: 'right',
  }
  const dimStyle = props.dimStyle ? props.dimStyle : {
    color: ' #848484',
    fontSize: props.fontSize || '12px',
    marginLeft: '5px',
  }

  return isLoading
    ? h('div', '')
    : h('.flex-row', {
        style: {
          lineHeight: '20px',
          textRendering: 'geometricPrecision',
          marginTop: '137px',
        },
      }, [h('div',{
        style: {
            marginBottom: '15px',
            fontSize: '12px',
            color: '#848484',
            marginRight: '4px',
        }
    },'Available:'),
      h('div.hide-text-overflow.token-balance__amount', {
          style: valueStyle,
      }, realTokenBalance),
      !balanceOnly && h('span.token-balance__symbol', {
          style: dimStyle,
      }, symbol),
    ])
}

TokenBalance.prototype.componentDidMount = function () {
  this.createFreshTokenTracker()
}

TokenBalance.prototype.createFreshTokenTracker = function () {
  if (this.tracker) {
    // Clean up old trackers when refreshing:
    this.tracker.stop()
    this.tracker.removeListener('update', this.balanceUpdater)
    this.tracker.removeListener('error', this.showError)
  }

  if (!global.ethereumProvider) return
  const { userAddress, token } = this.props

  this.tracker = new TokenTracker({
    userAddress,
    provider: global.ethereumProvider,
    tokens: [token],
    pollingInterval: 8000,
  })


  // Set up listener instances for cleaning up
  this.balanceUpdater = this.updateBalance.bind(this)
  this.showError = error => {
    this.setState({ error, isLoading: false })
  }
  this.tracker.on('update', this.balanceUpdater)
  this.tracker.on('error', this.showError)

  this.tracker.updateBalances()
    .then(() => {
      this.updateBalance(this.tracker.serialize())
    })
    .catch((reason) => {
      log.error(`Problem updating balances`, reason)
      this.setState({ isLoading: false })
    })
}

TokenBalance.prototype.componentDidUpdate = function (nextProps) {
  const {
    userAddress: oldAddress,
    token: { address: oldTokenAddress },
  } = this.props
  const {
    userAddress: newAddress,
    token: { address: newTokenAddress },
  } = nextProps

  if ((!oldAddress || !newAddress) && (!oldTokenAddress || !newTokenAddress)) return
  if ((oldAddress === newAddress) && (oldTokenAddress === newTokenAddress)) return

  this.setState({ isLoading: true })
  this.createFreshTokenTracker()
}

TokenBalance.prototype.updateBalance = function (tokens = []) {
  if (!this.tracker.running) {
    return
  }

  const [{ string, symbol }] = tokens

  this.setState({
    string,
    symbol,
    isLoading: false,
  })
}

TokenBalance.prototype.componentWillUnmount = function () {
  if (!this.tracker) return
  this.tracker.stop()
  this.tracker.removeListener('update', this.balanceUpdater)
  this.tracker.removeListener('error', this.showError)
}

