const Component = require('react').Component
const h = require('react-hyperscript')
const inherits = require('util').inherits

const TransactionListItem = require('./transaction-list-item')
const { MAINNET_CODE } = require('../../../app/scripts/controllers/network/enums')

module.exports = TransactionList


inherits(TransactionList, Component)
function TransactionList () {
  Component.call(this)
}

TransactionList.prototype.render = function () {
  const { transactions, network, unapprovedMsgs, conversionRate ,networkList} = this.props

  var shapeShiftTxList
  if (Number(network) === MAINNET_CODE) {
    shapeShiftTxList = this.props.shapeShiftTxList
  }
  const txsToRender = !shapeShiftTxList ? transactions.concat(unapprovedMsgs) : transactions.concat(unapprovedMsgs, shapeShiftTxList)
  .sort((a, b) => b.time - a.time)

  return (

    h('section.transaction-list.full-flex-height', {
      style: {
        justifyContent: 'center',
      },
    }, [

      h('style', `
        .transaction-list .transaction-list-item:not(:last-of-type) {
          border-bottom: 1px solid #D4D4D4;
        }
        .transaction-list .transaction-list-item .ether-balance-label {
          display: block !important;
          font-size: small;
        }
      `),

      h('.tx-list', {
        style: {
          overflowY: 'auto',
          // maxHeight:'230px',
          padding: '0 13px 20px 13px',
          textAlign: 'center',
        },
      }, [

        txsToRender.length
          ? txsToRender.map((transaction, i) => {
            let key
            switch (transaction.key) {
              case 'shapeshift':
                const { depositAddress, time } = transaction
                key = `shift-tx-${depositAddress}-${time}-${i}`
                break
              default:
                key = `tx-${transaction.id}-${i}`
            }
            return h(TransactionListItem, {
              transaction, i, network, key,
              conversionRate, transactions,networkList,
              showTx: (txId) => {
                this.props.viewPendingTx(txId)
              },
              showTransctionDetails: (txId) => {
                this.props.viewTxDetails(txId)
              },
             
            })
          })
        : h('.flex-center.full-flex-height', {
          style: {
            flexDirection: 'column',
            justifyContent: 'center',
          },
        }, [
          h('p', {
            style: {
              margin: '95px 0',
              color: '#9FA9BA',
              // fontFamily: 'Inter',
              fontSize: '14px',
            },
          }, 'No transaction history'),
        ]),
      ]),
    ])
  )
}

