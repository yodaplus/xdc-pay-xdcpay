const abi = require('human-standard-token-abi')
const pify = require('pify')
const {getBuyEthUrl} = require('../../app/scripts/lib/buy-eth-url')
const {getTokenAddressFromTokenObject} = require('./util')
const {
  calcGasTotal,
  calcTokenBalance,
  estimateGas,
} = require('./components/send/send.utils')
const ethUtil = require('ethereumjs-util')
const {fetchLocale} = require('../i18n-helper')
const log = require('loglevel')
const {
  ENVIRONMENT_TYPE_NOTIFICATION,
} = require('../../app/scripts/lib/enums')
const {
  POA,
  DAI,
  POA_SOKOL,
  XDC,
  XDC_TESTNET,
  CLASSIC,
} = require('../../app/scripts/controllers/network/enums')
const {
  hasUnconfirmedTransactions,
} = require('./helpers/confirm-transaction/util')
const WebcamUtils = require('../lib/webcam-utils')
const {retry} = require('async')

var actions = {
  _setBackgroundConnection: _setBackgroundConnection,

  GO_HOME: 'GO_HOME',
  goHome: goHome,
  goConfig: goConfig,
  GO_CONFIG: 'GO_CONFIG',
  expandedSettings: expandedSettings,
  ExpandedSettings: 'ExpandedSettings',

  // modal state
  MODAL_OPEN: 'UI_MODAL_OPEN',
  MODAL_CLOSE: 'UI_MODAL_CLOSE',
  showModal: showModal,
  SHOW_SEEDWORDS: 'SHOW_SEEDWORDS',
  showSeedWords,
  hideModal: hideModal,
  // sidebar state
  SIDEBAR_OPEN: 'UI_SIDEBAR_OPEN',
  SIDEBAR_CLOSE: 'UI_SIDEBAR_CLOSE',
  showSidebar: showSidebar,
  hideSidebar: hideSidebar,
  // sidebar state
  ALERT_OPEN: 'UI_ALERT_OPEN',
  ALERT_CLOSE: 'UI_ALERT_CLOSE',
  showAlert: showAlert,
  hideAlert: hideAlert,
  QR_CODE_DETECTED: 'UI_QR_CODE_DETECTED',
  qrCodeDetected,
  // network dropdown open
  NETWORK_DROPDOWN_OPEN: 'UI_NETWORK_DROPDOWN_OPEN',
  NETWORK_DROPDOWN_CLOSE: 'UI_NETWORK_DROPDOWN_CLOSE',
  showNetworkDropdown: showNetworkDropdown,
  hideNetworkDropdown: hideNetworkDropdown,
  // menu state/
  getNetworkStatus: 'getNetworkStatus',
  // transition state
  TRANSITION_FORWARD: 'TRANSITION_FORWARD',
  TRANSITION_BACKWARD: 'TRANSITION_BACKWARD',
  transitionForward,
  transitionBackward,
  // remote state
  UPDATE_XDC_STATE: 'UPDATE_XDC_STATE',
  updateMetamaskState: updateMetamaskState,
  // notices
  MARK_NOTICE_READ: 'MARK_NOTICE_READ',
  markNoticeRead: markNoticeRead,
  SHOW_NOTICE: 'SHOW_NOTICE',
  showNotice: showNotice,
  CLEAR_NOTICES: 'CLEAR_NOTICES',
  clearNotices: clearNotices,
  markAccountsFound,
  // intialize screen
  CREATE_NEW_VAULT_IN_PROGRESS: 'CREATE_NEW_VAULT_IN_PROGRESS',
  SHOW_CREATE_VAULT: 'SHOW_CREATE_VAULT',
  SHOW_RESTORE_VAULT: 'SHOW_RESTORE_VAULT',
  FORGOT_PASSWORD: 'FORGOT_PASSWORD',
  forgotPassword: forgotPassword,
  markPasswordForgotten,
  unMarkPasswordForgotten,
  SHOW_INIT_MENU: 'SHOW_INIT_MENU',
  SHOW_NEW_VAULT_SEED: 'SHOW_NEW_VAULT_SEED',
  SHOW_NEW_VAULT_SEED1: 'SHOW_NEW_VAULT_SEED1',
  SHOW_INFO_PAGE: 'SHOW_INFO_PAGE',
  SHOW_IMPORT_PAGE: 'SHOW_IMPORT_PAGE',
  SHOW_FORGET_DEVICE_PAGE: 'SHOW_FORGET_DEVICE_PAGE',
  SHOW_HARDWARE_WALLET_PAGE: 'SHOW_HARDWARE_WALLET_PAGE',
  SHOW_NEW_ACCOUNT_PAGE: 'SHOW_NEW_ACCOUNT_PAGE',
  SET_NEW_ACCOUNT_FORM: 'SET_NEW_ACCOUNT_FORM',
  unlockMetamask: unlockMetamask,
  unlockFailed: unlockFailed,
  unlockSucceeded,
  showCreateVault: showCreateVault,
  showRestoreVault: showRestoreVault,
  showInitializeMenu: showInitializeMenu,
  showImportPage,
  showForgetDevicePage,
  showConnectHWWalletPage: showConnectHWWalletPage,
  showNewAccountPage,
  setNewAccountForm,
  createNewVaultAndKeychain: createNewVaultAndKeychain,
  createNewVaultAndRestore: createNewVaultAndRestore,
  createNewVaultInProgress: createNewVaultInProgress,
  addNewKeyring,
  importNewAccount,
  addNewAccount,
  connectHardware,
  connectHardwareAndUnlockAddress,
  checkHardwareStatus,
  forgetDevice,
  unlockHardwareWalletAccount,
  NEW_ACCOUNT_SCREEN: 'NEW_ACCOUNT_SCREEN',
  navigateToNewAccountScreen,
  resetAccount,
  changePassword,
  getContract,
  removeAccount,
  updateABI,
  showNewVaultSeed: showNewVaultSeed,
  showNewVaultSeed1: showNewVaultSeed1,
  showInfoPage: showInfoPage,
  CLOSE_WELCOME_SCREEN: 'CLOSE_WELCOME_SCREEN',
  closeWelcomeScreen,
  // seed recovery actions
  REVEAL_SEED_CONFIRMATION: 'REVEAL_SEED_CONFIRMATION',
  revealSeedConfirmation: revealSeedConfirmation,
  requestRevealSeed: requestRevealSeed,
  requestRevealSeed1: requestRevealSeed1,
  requestRevealSeedWords,
  // unlock screen
  UNLOCK_IN_PROGRESS: 'UNLOCK_IN_PROGRESS',
  UNLOCK_FAILED: 'UNLOCK_FAILED',
  UNLOCK_SUCCEEDED: 'UNLOCK_SUCCEEDED',
  UNLOCK_METAMASK: 'UNLOCK_METAMASK',
  LOCK_METAMASK: 'LOCK_METAMASK',
  UPDATE_GASFIELDS: 'UPDATE_GASFIELDS',
  UPDATE_TOKENSLIST: 'UPDATE_TOKENSLIST',
  UPDATE_EXPANDEDUI: 'UPDATE_EXPANDEDUI',
  UPDATE_VALIDATION_NAME: 'UPDATE_VALIDATION_NAME',
  UPDATE_VALIDATION_ADDRESS: 'UPDATE_VALIDATION_ADDRESS',
  isValidName: isValidName,
  isValidAddress: isValidAddress,
  showTokens: showTokens,
  expandedUi:expandedUi,
  showGasFields: showGasFields,
  tryUnlockMetamask: tryUnlockMetamask,
  lockMetamask: lockMetamask,
  unlockInProgress: unlockInProgress,
  // error handling
  displayToast: displayToast,
  displayWarning: displayWarning,
  DISPLAY_TOAST: 'DISPLAY_TOAST',
  HIDE_TOAST: 'HIDE_TOAST',
  hideToast: hideToast,
  DISPLAY_WARNING: 'DISPLAY_WARNING',
  HIDE_WARNING: 'HIDE_WARNING',
  hideWarning: hideWarning,
  // accounts screen
  SET_SELECTED_ACCOUNT: 'SET_SELECTED_ACCOUNT',
  SET_SELECTED_TOKEN: 'SET_SELECTED_TOKEN',
  setSelectedToken,
  SHOW_ACCOUNT_DETAIL: 'SHOW_ACCOUNT_DETAIL',
  SHOW_ACCOUNTS_PAGE: 'SHOW_ACCOUNTS_PAGE',
  SHOW_CONF_REC_PAGE: 'SHOW_CONF_REC_PAGE',
  SHOW_CONF_TX_PAGE: 'SHOW_CONF_TX_PAGE',
  SHOW_CONF_MSG_PAGE: 'SHOW_CONF_MSG_PAGE',
  SET_CURRENT_FIAT: 'SET_CURRENT_FIAT',
  showQrScanner,
  setCurrentCurrency,
  setCurrentAccountTab,
  // account detail screen
  SHOW_SEND_PAGE: 'SHOW_SEND_PAGE',
  showSendPage: showSendPage,
  SHOW_SEND_TOKEN_PAGE: 'SHOW_SEND_TOKEN_PAGE',
  showSendTokenPage,
  SHOW_SEND_CONTRACT_PAGE: 'SHOW_SEND_CONTRACT_PAGE',
  showSendContractPage,
  ADD_TO_ADDRESS_BOOK: 'ADD_TO_ADDRESS_BOOK',
  addToAddressBook: addToAddressBook,
  REQUEST_ACCOUNT_EXPORT: 'REQUEST_ACCOUNT_EXPORT',
  requestExportAccount: requestExportAccount,
  EXPORT_ACCOUNT: 'EXPORT_ACCOUNT',
  exportAccount: exportAccount,
  SHOW_PRIVATE_KEY: 'SHOW_PRIVATE_KEY',
  showPrivateKey: showPrivateKey,
  exportAccountComplete,
  SET_ACCOUNT_LABEL: 'SET_ACCOUNT_LABEL',
  setAccountLabel,
  updateNetworkNonce,
  SET_NETWORK_NONCE: 'SET_NETWORK_NONCE',
  // tx conf screen
  COMPLETED_TX: 'COMPLETED_TX',
  TRANSACTION_ERROR: 'TRANSACTION_ERROR',
  NEXT_TX: 'NEXT_TX',
  PREVIOUS_TX: 'PREV_TX',
  EDIT_TX: 'EDIT_TX',
  signMsg: signMsg,
  cancelMsg: cancelMsg,
  signPersonalMsg,
  cancelPersonalMsg,
  signTypedMsg,
  cancelTypedMsg,
  sendTx: sendTx,
  signTx: signTx,
  signTokenTx: signTokenTx,
  updateTransaction,
  updateAndApproveTx,
  cancelTx: cancelTx,
  cancelTxs,
  completedTx: completedTx,
  txError: txError,
  nextTx: nextTx,
  editTx,
  previousTx: previousTx,
  cancelAllTx: cancelAllTx,
  viewPendingTx: viewPendingTx,
  VIEW_PENDING_TX: 'VIEW_PENDING_TX',
  updateTransactionParams,
  UPDATE_TRANSACTION_PARAMS: 'UPDATE_TRANSACTION_PARAMS',
  // send screen
  UPDATE_GAS_LIMIT: 'UPDATE_GAS_LIMIT',
  UPDATE_GAS_PRICE: 'UPDATE_GAS_PRICE',
  UPDATE_GAS_TOTAL: 'UPDATE_GAS_TOTAL',
  UPDATE_SEND_FROM: 'UPDATE_SEND_FROM',
  UPDATE_SEND_HEX_DATA: 'UPDATE_SEND_HEX_DATA',
  UPDATE_SEND_TOKEN_BALANCE: 'UPDATE_SEND_TOKEN_BALANCE',
  UPDATE_SEND_TO: 'UPDATE_SEND_TO',
  UPDATE_SEND_AMOUNT: 'UPDATE_SEND_AMOUNT',
  UPDATE_SEND_MEMO: 'UPDATE_SEND_MEMO',
  UPDATE_SEND_ERRORS: 'UPDATE_SEND_ERRORS',
  UPDATE_MAX_MODE: 'UPDATE_MAX_MODE',
  UPDATE_SEND: 'UPDATE_SEND',
  CLEAR_SEND: 'CLEAR_SEND',
  OPEN_FROM_DROPDOWN: 'OPEN_FROM_DROPDOWN',
  CLOSE_FROM_DROPDOWN: 'CLOSE_FROM_DROPDOWN',
  GAS_LOADING_STARTED: 'GAS_LOADING_STARTED',
  GAS_LOADING_FINISHED: 'GAS_LOADING_FINISHED',
  setGasLimit,
  setGasPrice,
  updateGasData,
  setGasTotal,
  setSendTokenBalance,
  updateSendTokenBalance,
  updateSendFrom,
  updateSendHexData,
  updateSendTo,
  updateSendAmount,
  updateSendMemo,
  setMaxModeTo,
  updateSend,
  updateSendErrors,
  clearSend,
  setSelectedAddress,
  gasLoadingStarted,
  gasLoadingFinished,
  SHOW_CHOOSE_CONTRACT_EXECUTOR_PAGE: 'SHOW_CHOOSE_CONTRACT_EXECUTOR_PAGE',
  showChooseContractExecutorPage,
  // app messages
  confirmSeedWords: confirmSeedWords,
  showAccountDetail: showAccountDetail,
  confirmRecoveryPhrase: confirmRecoveryPhrase,
  BACK_TO_ACCOUNT_DETAIL: 'BACK_TO_ACCOUNT_DETAIL',
  backToAccountDetail: backToAccountDetail,
  showAccountsPage: showAccountsPage,
  showConfRecPage: showConfRecPage,
  showConfTxPage: showConfTxPage,
  // config screen
  SHOW_CONFIG_PAGE: 'SHOW_CONFIG_PAGE',
  SET_RPC_TARGET: 'SET_RPC_TARGET',
  SET_DEFAULT_RPC_TARGET: 'SET_DEFAULT_RPC_TARGET',
  SET_PROVIDER_TYPE: 'SET_PROVIDER_TYPE',
  showConfigPage,
  // generalSettings:
  generalSettings,
  advanceSettings,
  securityAndPrivacy,
  Contacts,
  contactDetails,
  networkSettings,
  addNetwork,
  showAddNetworkPage,
  showAddContactsPage,
  viewNetwork: viewNetwork,
  viewContact: viewContact,
  alertSettings,


  SHOW_VIEWNETWORK: 'SHOW_VIEWNETWORK',
  SHOW_GENSETTINGS_PAGE: 'SHOW_GENSETTINGS_PAGE',
  SHOW_ADVSETTINGS_PAGE: 'SHOW_ADVSETTINGS_PAGE',
  SHOW_SECURITYANDPRIVACY_PAGE: 'SHOW_SECURITYANDPRIVACY_PAGE ',
  SHOW_CONTACTS_PAGE: 'SHOW_CONTACTS_PAGE',
  SHOW_CONTACT_DETAILS: 'SHOW_CONTACT_DETAILS',
  SHOW_ALERTSETTINGS_PAGE: 'SHOW_ALERTSETTINGS_PAGE',
  SHOW_NETWORKSETTINGS_PAGE: 'SHOW_NETWORKSETTINGS_PAGE',
  SHOW_ADDNETWORK_PAGE: 'SHOW_ADDNETWORK_PAGE',
  SHOW_ADDCONTACTS_PAGE: 'SHOW_ADDCONTACTS_PAGE',

  SHOW_VIEW_NETWORK_PAGE: 'SHOW_VIEW_NETWORK_PAGE',
  SHOW_VIEW_CONTACT: 'SHOW_VIEW_CONTACT',
  ADD_NEW_NETWORK: 'ADD_NEW_NETWORK',

  SHOW_ADD_TOKEN_PAGE: 'SHOW_ADD_TOKEN_PAGE',
  SHOW_CONFIRM_ADD_TOKEN_PAGE: 'SHOW_CONFIRM_ADD_TOKEN_PAGE',
  SHOW_REMOVE_TOKEN_PAGE: 'SHOW_REMOVE_TOKEN_PAGE',
  showAddTokenPage,
  showConfirmAddTokensPage,
  showRemoveTokenPage,
  SHOW_ADD_SUGGESTED_TOKEN_PAGE: 'SHOW_ADD_SUGGESTED_TOKEN_PAGE',
  showAddSuggestedTokenPage,
  addToken,
  addTokens,
  removeToken,
  updateTokens,
  removeSuggestedTokens,
  UPDATE_TOKENS: 'UPDATE_TOKENS',
  setRpcTarget: setRpcTarget,
  setContactTarget: setContactTarget,
  delRpcTarget: delRpcTarget,
  setProviderType: setProviderType,
  SET_NETWORKNAME: 'SET_NETWORKNAME',
  setNetworkName: setNetworkName,
  SET_HARDWARE_WALLET_DEFAULT_HD_PATH: 'SET_HARDWARE_WALLET_DEFAULT_HD_PATH',
  setHardwareWalletDefaultHdPath,
  updateProviderType,
  // loading overlay
  SHOW_LOADING: 'SHOW_LOADING_INDICATION',
  HIDE_LOADING: 'HIDE_LOADING_INDICATION',
  showLoadingIndication: showLoadingIndication,
  hideLoadingIndication: hideLoadingIndication,
  // buy Eth with coinbase
  onboardingBuyEthView,
  ONBOARDING_BUY_ETH_VIEW: 'ONBOARDING_BUY_ETH_VIEW',
  BUY_ETH: 'BUY_ETH',
  buyEth: buyEth,
  buyEthView: buyEthView,
  buyWithShapeShift,
  BUY_ETH_VIEW: 'BUY_ETH_VIEW',
  COINBASE_SUBVIEW: 'COINBASE_SUBVIEW',
  coinBaseSubview: coinBaseSubview,
  SHAPESHIFT_SUBVIEW: 'SHAPESHIFT_SUBVIEW',
  shapeShiftSubview: shapeShiftSubview,
  PAIR_UPDATE: 'PAIR_UPDATE',
  pairUpdate: pairUpdate,
  coinShiftRquest: coinShiftRquest,
  SHOW_SUB_LOADING_INDICATION: 'SHOW_SUB_LOADING_INDICATION',
  showSubLoadingIndication: showSubLoadingIndication,
  HIDE_SUB_LOADING_INDICATION: 'HIDE_SUB_LOADING_INDICATION',
  hideSubLoadingIndication: hideSubLoadingIndication,
  // QR STUFF:
  SHOW_QR: 'SHOW_QR',
  showQrView: showQrView,
  reshowQrCode: reshowQrCode,
  SHOW_QR_VIEW: 'SHOW_QR_VIEW',
  // FORGOT PASSWORD:
  BACK_TO_INIT_MENU: 'BACK_TO_INIT_MENU',
  goBackToInitView: goBackToInitView,
  RECOVERY_IN_PROGRESS: 'RECOVERY_IN_PROGRESS',
  BACK_TO_UNLOCK_VIEW: 'BACK_TO_UNLOCK_VIEW',
  backToUnlockView: backToUnlockView,
  // SHOWING KEYCHAIN
  SHOW_NEW_KEYCHAIN: 'SHOW_NEW_KEYCHAIN',
  showNewKeychain: showNewKeychain,

  callBackgroundThenUpdate,
  forceUpdateMetamaskState,

  TOGGLE_ACCOUNT_MENU: 'TOGGLE_ACCOUNT_MENU',
  toggleAccountMenu,

  useEtherscanProvider,

  SET_USE_BLOCKIE: 'SET_USE_BLOCKIE',
  setUseBlockie,

  // locale
  SET_CURRENT_LOCALE: 'SET_CURRENT_LOCALE',
  SET_LOCALE_MESSAGES: 'SET_LOCALE_MESSAGES',

  setCurrentLocale,
  updateCurrentLocale,
  setLocaleMessages,
  //
  // Feature Flags
  setFeatureFlag,
  updateFeatureFlags,
  UPDATE_FEATURE_FLAGS: 'UPDATE_FEATURE_FLAGS',

  // Preferences
  setPreference,
  updatePreferences,
  UPDATE_PREFERENCES: 'UPDATE_PREFERENCES',
  setUseETHAsPrimaryCurrencyPreference,

  setMouseUserState,
  SET_MOUSE_USER_STATE: 'SET_MOUSE_USER_STATE',

  // Network
  updateNetworkEndpointType,
  UPDATE_NETWORK_ENDPOINT_TYPE: 'UPDATE_NETWORK_ENDPOINT_TYPE',

  retryTransaction,
  SET_PENDING_TOKENS: 'SET_PENDING_TOKENS',
  CLEAR_PENDING_TOKENS: 'CLEAR_PENDING_TOKENS',
  setPendingTokens,
  clearPendingTokens,
  SHOW_DELETE_RPC: 'SHOW_DELETE_RPC',
  showDeleteRPC,
  removeCustomRPC,
  SHOW_DELETE_IMPORTED_ACCOUNT: 'SHOW_DELETE_IMPORTED_ACCOUNT',
  showDeleteImportedAccount,
  CONFIRM_CHANGE_PASSWORD: 'CONFIRM_CHANGE_PASSWORD',
  confirmChangePassword,

  createCancelTransaction,
  connectedSites,
  CONNECTED_SITES: 'CONNECTED_SITES',
  transactionDetails: transactionDetails,
  TRANSACTION_DETAILS: 'TRANSACTION_DETAILS',
}

module.exports = actions

var background = null

function _setBackgroundConnection (backgroundConnection) {
  background = backgroundConnection
}

function goHome () {
  return {
    type: actions.GO_HOME,
  }
}

function goConfig () {
  return {
    type: actions.GO_CONFIG,
  }
}

function expandedSettings() {
  return {
    type: actions.ExpandedSettings,
  }
}

// async actions

function tryUnlockMetamask (password) {
  return (dispatch) => {
    dispatch(actions.showLoadingIndication())
    dispatch(actions.unlockInProgress())
    log.debug(`background.submitPassword`)

    return new Promise((resolve, reject) => {
      background.submitPassword(password, (error) => {
        if (error) {
          return reject(error)
        }

        resolve()
      })
    })
      .then(() => {
        dispatch(actions.unlockSucceeded())
        return forceUpdateMetamaskState(dispatch)
      })
      .catch((err) => {
        // log.error(err)
        return Promise.reject(err)
      })
      .then(() => {
        return new Promise((resolve, reject) => {
          background.verifySeedPhrase((err) => {
            if (err) {
              dispatch(actions.displayWarning(err.message))
              return reject(err)
            }

            resolve()
          })
        })
      })
      .then(() => {
        dispatch(actions.transitionForward())
        dispatch(actions.hideLoadingIndication())
      })
      .catch((err) => {
        dispatch(actions.unlockFailed(err.message))
        dispatch(actions.hideLoadingIndication())
        return Promise.reject(err)
      })
  }
}

function transitionForward () {
  return {
    type: this.TRANSITION_FORWARD,
  }
}

function showSeedWords () {
  return {
    type: actions.SHOW_SEEDWORDS,
  }

}

function connectedSites () {
  return {
    type: actions.CONNECTED_SITES,
  }

}

function transitionBackward () {
  return {
    type: this.TRANSITION_BACKWARD,
  }
}

function transactionDetails (txnId) {
  return {
    type: actions.TRANSACTION_DETAILS,
    value: txnId,
  }
}

function confirmSeedWords () {
  return (dispatch) => {
    dispatch(actions.showLoadingIndication())
    log.debug(`background.clearSeedWordCache`)
    return new Promise((resolve, reject) => {
      background.clearSeedWordCache((err, account) => {
        dispatch(actions.hideLoadingIndication())
        if (err) {
          dispatch(actions.displayWarning(err.message))
          return reject(err)
        }

        log.info('Seed word cache cleared. ' + account)
        dispatch(actions.showAccountsPage())
        resolve(account)
      })
    })
  }
}

function confirmRecoveryPhrase () {
  return (dispatch) => {
    console.log('!!!!')
    dispatch(actions.showConfRecPage())
    // dispatch(actions.showLoadingIndication());
    // log.debug(`background.clearSeedWordCache`);
    // return new Promise((resolve, reject) => {
    //   background.clearSeedWordCache((err, account) => {
    //     dispatch(actions.hideLoadingIndication());
    //     if (err) {
    //       dispatch(actions.displayWarning(err.message));
    //       return reject(err);
    //     }

    //     log.info("Seed word cache cleared. " + account);
    //     dispatch(actions.showConfRecPage());
    //     resolve(account);
    //   });
    // });
  }
}


function createNewVaultAndRestore (password, seed) {
  return (dispatch) => {
    dispatch(actions.showLoadingIndication())
    log.debug(`background.createNewVaultAndRestore`)

    return new Promise((resolve, reject) => {
      background.clearSeedWordCache((err) => {
        if (err) {
          return reject(err)
        }

        background.createNewVaultAndRestore(password, seed, (err) => {
          if (err) {
            return reject(err)
          }

          resolve()
        })
      })
    })
      .then(() => dispatch(actions.unMarkPasswordForgotten()))
      .then(() => {
        dispatch(actions.showAccountsPage())
        dispatch(actions.hideLoadingIndication())
      })
      .catch((err) => {
        dispatch(actions.displayWarning(err.message))
        dispatch(actions.hideLoadingIndication())
      })
  }
}

function createNewVaultAndKeychain (password) {
  return (dispatch) => {
    dispatch(actions.showLoadingIndication())
    log.debug(`background.createNewVaultAndKeychain`)

    return new Promise((resolve, reject) => {
      background.createNewVaultAndKeychain(password, (err) => {
        if (err) {
          dispatch(actions.displayWarning(err.message))
          return reject(err)
        }

        log.debug(`background.placeSeedWords`)

        background.placeSeedWords((err) => {
          if (err) {
            dispatch(actions.displayWarning(err.message))
            return reject(err)
          }

          resolve()
        })
      })
    })
      .then(() => forceUpdateMetamaskState(dispatch))
      .then(() => dispatch(actions.hideLoadingIndication()))
      .catch(() => dispatch(actions.hideLoadingIndication()))
  }
}

function revealSeedConfirmation () {
  return {
    type: this.REVEAL_SEED_CONFIRMATION,
  }
}

function verifyPassword (password) {
  return new Promise((resolve, reject) => {
    background.submitPassword(password, (error) => {
      if (error) {
        return reject(error)
      }

      resolve(true)
    })
  })
}

function verifySeedPhrase () {
  return new Promise((resolve, reject) => {
    background.verifySeedPhrase((error, seedWords) => {
      if (error) {
        return reject(error)
      }

      resolve(seedWords)
    })
  })
}

function requestRevealSeed (password) {
  return (dispatch) => {
    dispatch(actions.showLoadingIndication())
    log.debug(`background.submitPassword`)
    return new Promise((resolve, reject) => {
      background.submitPassword(password, (err) => {
        if (err) {
          dispatch(actions.displayWarning(err))
          return reject(err)
        }

        log.debug(`background.placeSeedWords`)
        background.placeSeedWords((err, result) => {
          if (err) {
            dispatch(actions.displayWarning(err.message))
            return reject(err)
          }

          dispatch(actions.showNewVaultSeed(result))
          dispatch(actions.hideLoadingIndication())
          resolve()
        })
      })
    }).catch((err) => {
      dispatch(actions.displayWarning(err.message))
      return Promise.reject(err)
    })
  }
}

function requestRevealSeed1 (password) {
  return (dispatch) => {
    dispatch(actions.showLoadingIndication())
    log.debug(`background.submitPassword`)
    return new Promise((resolve, reject) => {
      background.submitPassword(password, (err) => {
        if (err) {
          dispatch(actions.displayWarning(err))
          return reject(err)
        }

        log.debug(`background.placeSeedWords`)
        background.placeSeedWords((err, result) => {
          if (err) {
            dispatch(actions.displayWarning(err.message))
            return reject(err)
          }

          dispatch(actions.showNewVaultSeed1(result))
          dispatch(actions.hideLoadingIndication())
          resolve()
        })
      })
    }).catch((err) => {
      dispatch(actions.displayWarning(err.message))
      return Promise.reject(err)
    })
  }
}

function requestRevealSeedWords (password) {
  return async (dispatch) => {
    dispatch(actions.showLoadingIndication())
    log.debug(`background.submitPassword`)

    try {
      await verifyPassword(password)
      const seedWords = await verifySeedPhrase()
      dispatch(actions.hideLoadingIndication())
      return seedWords
    } catch (error) {
      dispatch(actions.hideLoadingIndication())
      dispatch(actions.displayWarning(error.message))
      throw new Error(error.message)
    }
  }
}

function resetAccount () {
  return (dispatch) => {
    dispatch(actions.showLoadingIndication())

    return new Promise((resolve, reject) => {
      background.resetAccount((err, account) => {
        dispatch(actions.hideLoadingIndication())
        if (err) {
          dispatch(actions.displayWarning(err.message))
          return reject(err)
        }

        log.info('Transaction history reset for ' + account)
        dispatch(actions.showAccountsPage())
        resolve(account)
      })
    })
  }
}

function changePassword (oldPassword, newPassword) {
  return (dispatch) => {
    dispatch(actions.showLoadingIndication())

    return new Promise((resolve, reject) => {
      background.changePassword(oldPassword, newPassword, (err, account) => {
        dispatch(actions.hideLoadingIndication())
        if (err) {
          log.error(err)
          return reject(err)
        }
        log.info('Password is changed for ' + account)
        dispatch(actions.showAccountsPage())
        resolve(account)
      })
    })
  }
}

function getContract (address) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      background.getContract(address, (err, props) => {
        if (err) {
          log.error(err)
          return reject(err)
        }
        log.info('Contract retrieved: ' + JSON.stringify(props))
        resolve(props)
      })
    })
  }
}

function removeAccount (address, network) {
  return (dispatch) => {
    dispatch(actions.showLoadingIndication())

    return new Promise((resolve, reject) => {
      background.removeAccount(address, network, (err, account) => {
        dispatch(actions.hideLoadingIndication())
        if (err) {
          dispatch(actions.displayWarning(err.message))
          return reject(err)
        }

        log.info('Account removed: ' + account)
        dispatch(actions.showAccountsPage())
        resolve()
      })
    })
  }
}

function updateABI (address, network, newABI) {
  return (dispatch) => {
    dispatch(actions.showLoadingIndication())

    return new Promise((resolve, reject) => {
      background.updateABI(address, network, newABI, (err, account) => {
        dispatch(actions.hideLoadingIndication())
        if (err) {
          dispatch(actions.displayWarning(err.message))
          return reject(err)
        }

        log.info('Implementation ABI for proxy updated: ' + account)
        dispatch(actions.showAccountsPage())
        resolve()
      })
    })
  }
}

function addNewKeyring (type, opts) {
  return (dispatch) => {
    dispatch(actions.showLoadingIndication())
    log.debug(`background.addNewKeyring`)
    background.addNewKeyring(type, opts, (err) => {
      dispatch(actions.hideLoadingIndication())
      if (err) return dispatch(actions.displayWarning(err.message))
      dispatch(actions.showAccountsPage())
    })
  }
}

function importNewAccount (strategy, args) {
  return async (dispatch) => {
    let newState
    dispatch(
      actions.showLoadingIndication('This may take a while, please be patient.'),
    )
    try {
      log.debug(`background.importAccountWithStrategy`)
      await pify(background.importAccountWithStrategy).call(
        background,
        strategy,
        args,
      )
      log.debug(`background.getState`)
      newState = await pify(background.getState).call(background)
    } catch (err) {
      dispatch(actions.hideLoadingIndication())
      dispatch(actions.displayWarning(err.message))
      throw err
    }
    dispatch(actions.hideLoadingIndication())
    dispatch(actions.updateMetamaskState(newState))
    if (newState.selectedAddress) {
      dispatch({
        type: actions.SHOW_ACCOUNT_DETAIL,
        value: newState.selectedAddress,
      })
    }
    return newState
  }
}

function navigateToNewAccountScreen () {
  return {
    type: this.NEW_ACCOUNT_SCREEN,
  }
}

function addNewAccount () {
  log.debug(`background.addNewAccount`)
  return (dispatch, getState) => {
    const oldIdentities = getState().metamask.identities
    dispatch(actions.showLoadingIndication())
    return new Promise((resolve, reject) => {
      background.addNewAccount((err, {identities: newIdentities}) => {
        if (err) {
          dispatch(actions.displayWarning(err.message))
          return reject(err)
        }
        console.log(newIdentities, '+++++')
        const newAccountAddress = Object.keys(newIdentities).find(
          (address) => !oldIdentities[address],
        )

        dispatch(actions.hideLoadingIndication())

        forceUpdateMetamaskState(dispatch)
        return resolve(newAccountAddress)
      })
    })
  }
}

function checkHardwareStatus (deviceName, hdPath) {
  log.debug(`background.checkHardwareStatus`, deviceName, hdPath)
  return (dispatch, getState) => {
    dispatch(actions.showLoadingIndication())
    return new Promise((resolve, reject) => {
      background.checkHardwareStatus(deviceName, hdPath, (err, unlocked) => {
        if (err) {
          log.error(err)
          dispatch(actions.displayWarning(err.message))
          return reject(err)
        }

        dispatch(actions.hideLoadingIndication())

        forceUpdateMetamaskState(dispatch)
        return resolve(unlocked)
      })
    })
  }
}

function forgetDevice (deviceName, clearAccounts) {
  log.debug(`background.forgetDevice`, deviceName)
  return (dispatch, getState) => {
    dispatch(actions.showLoadingIndication())
    return new Promise((resolve, reject) => {
      background.forgetDevice(
        deviceName,
        clearAccounts,
        (err, accountsToForget) => {
          if (err) {
            log.error(err)
            dispatch(actions.displayWarning(err.message))
            return reject(err)
          }

          dispatch(actions.hideLoadingIndication())

          forceUpdateMetamaskState(dispatch)
          return resolve(accountsToForget)
        },
      )
    })
  }
}

function connectHardware (deviceName, page, hdPath) {
  log.debug(`background.connectHardware`, deviceName, page, hdPath)
  return (dispatch, getState) => {
    dispatch(actions.showLoadingIndication())
    return new Promise((resolve, reject) => {
      background.connectHardware(deviceName, page, hdPath, (err, accounts) => {
        if (err) {
          log.error(err)
          dispatch(actions.displayWarning(err.message))
          return reject(err)
        }

        dispatch(actions.hideLoadingIndication())

        forceUpdateMetamaskState(dispatch)
        return resolve(accounts)
      })
    })
  }
}

function connectHardwareAndUnlockAddress (deviceName, hdPath, addressToUnlock) {
  log.debug(
    `background.connectHardwareAndUnlockAddress`,
    deviceName,
    hdPath,
    addressToUnlock,
  )
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      background.connectHardwareAndUnlockAddress(
        deviceName,
        hdPath,
        addressToUnlock,
        (err, accounts) => {
          if (err) {
            log.error(err)
            return reject(err)
          }

          forceUpdateMetamaskState(dispatch)
          return resolve(accounts)
        },
      )
    })
  }
}

function unlockHardwareWalletAccount (index, deviceName, hdPath) {
  log.debug(
    `background.unlockHardwareWalletAccount`,
    index,
    deviceName,
    hdPath,
  )
  return (dispatch, getState) => {
    dispatch(actions.showLoadingIndication())
    return new Promise((resolve, reject) => {
      background.unlockHardwareWalletAccount(
        index,
        deviceName,
        hdPath,
        (err, accounts) => {
          if (err) {
            log.error(err)
            dispatch(actions.displayWarning(err.message))
            return reject(err)
          }

          dispatch(actions.hideLoadingIndication())
          return resolve()
        },
      )
    })
  }
}

function showInfoPage () {
  return {
    type: actions.SHOW_INFO_PAGE,
  }
}

function showQrScanner (ROUTE) {
  return (dispatch, getState) => {
    return WebcamUtils.checkStatus()
      .then((status) => {
        if (!status.environmentReady) {
          // We need to switch to fullscreen mode to ask for permission
          global.platform.openExtensionInBrowser(`${ROUTE}`, `scan=true`)
        } else {
          dispatch(
            actions.showModal({
              name: 'QR_SCANNER',
            }),
          )
        }
      })
      .catch((e) => {
        dispatch(
          actions.showModal({
            name: 'QR_SCANNER',
            error: true,
            errorType: e.type,
          }),
        )
      })
  }
}

function setCurrentCurrency (currencyCode) {
  return (dispatch) => {
    dispatch(actions.showLoadingIndication())
    log.debug(`background.setCurrentCurrency`)
    background.setCurrentCurrency(currencyCode, (err, data) => {
      dispatch(actions.hideLoadingIndication())
      if (err) {
        log.error(err.stack)
        return dispatch(actions.displayWarning(err.message))
      }
      dispatch({
        type: actions.SET_CURRENT_FIAT,
        value: {
          currentCurrency: data.currentCurrency,
          conversionRate: data.conversionRate,
          conversionDate: data.conversionDate,
        },
      })
    })
  }
}

function signMsg (msgData) {
  log.debug('action - signMsg')
  return (dispatch, getState) => {
    dispatch(actions.showLoadingIndication())

    return new Promise((resolve, reject) => {
      log.debug(`actions calling background.signMessage`)
      background.signMessage(msgData, (err, newState) => {
        log.debug('signMessage called back')
        dispatch(actions.updateMetamaskState(newState))
        dispatch(actions.hideLoadingIndication())

        if (err) {
          log.error(err)
          dispatch(actions.displayWarning(err.message))
          return reject(err)
        }

        dispatch(actions.completedTx(msgData.metamaskId))

        if (!hasUnconfirmedTransactions(getState())) {
          return global.platform.closeNotificationWindow()
        }

        return resolve(msgData)
      })
    })
  }
}

function signPersonalMsg (msgData) {
  log.debug('action - signPersonalMsg')
  return (dispatch, getState) => {
    dispatch(actions.showLoadingIndication())

    return new Promise((resolve, reject) => {
      log.debug(`actions calling background.signPersonalMessage`)
      background.signPersonalMessage(msgData, (err, newState) => {
        log.debug('signPersonalMessage called back')
        dispatch(actions.updateMetamaskState(newState))
        dispatch(actions.hideLoadingIndication())

        if (err) {
          log.error(err)
          dispatch(actions.displayWarning(err.message))
          return reject(err)
        }

        dispatch(actions.completedTx(msgData.metamaskId))

        if (!hasUnconfirmedTransactions(getState())) {
          return global.platform.closeNotificationWindow()
        }

        return resolve(msgData)
      })
    })
  }
}

function signTypedMsg (msgData) {
  log.debug('action - signTypedMsg')
  return (dispatch, getState) => {
    dispatch(actions.showLoadingIndication())

    return new Promise((resolve, reject) => {
      log.debug(`actions calling background.signTypedMessage`)
      background.signTypedMessage(msgData, (err, newState) => {
        log.debug('signTypedMessage called back')
        dispatch(actions.updateMetamaskState(newState))
        dispatch(actions.hideLoadingIndication())

        if (err) {
          log.error(err)
          dispatch(actions.displayWarning(err.message))
          return reject(err)
        }

        dispatch(actions.completedTx(msgData.metamaskId))

        if (!hasUnconfirmedTransactions(getState())) {
          return global.platform.closeNotificationWindow()
        }

        return resolve(msgData)
      })
    })
  }
}

function signTx (txData) {
  return (dispatch) => {
    global.ethQuery.sendTransaction(txData, (err, data) => {
      if (err) {
        return dispatch(actions.displayWarning(err.message))
      }
    })
    dispatch(
      actions.showConfTxPage({
        isContractExecutionByUser: txData && txData.isContractExecutionByUser,
      }),
    )
  }
}

function setGasLimit (gasLimit) {
  return {
    type: actions.UPDATE_GAS_LIMIT,
    value: gasLimit,
  }
}

function setGasPrice (gasPrice) {
  return {
    type: actions.UPDATE_GAS_PRICE,
    value: gasPrice,
  }
}

function setGasTotal (gasTotal) {
  return {
    type: actions.UPDATE_GAS_TOTAL,
    value: gasTotal,
  }
}

function updateGasData ({
                          blockGasLimit,
                          recentBlocks,
                          selectedAddress,
                          selectedToken,
                          to,
                          value,
                          data,
                        }) {
  return (dispatch) => {
    dispatch(actions.gasLoadingStarted())
    return new Promise((resolve, reject) => {
      background.getGasPrice((err, data) => {
        if (err) return reject(err)
        return resolve(data)
      })
    })
      .then((estimateGasPrice) => {
        return Promise.all([
          Promise.resolve(estimateGasPrice),
          estimateGas({
            estimateGasMethod: background.estimateGas,
            blockGasLimit,
            selectedAddress,
            selectedToken,
            to,
            value,
            estimateGasPrice,
            data,
          }),
        ])
      })
      .then(([gasPrice, gas]) => {
        dispatch(actions.setGasPrice(gasPrice))
        dispatch(actions.setGasLimit(gas))
        return calcGasTotal(gas, gasPrice)
      })
      .then((gasEstimate) => {
        dispatch(actions.setGasTotal(gasEstimate))
        dispatch(updateSendErrors({gasLoadingError: null}))
        dispatch(actions.gasLoadingFinished())
      })
      .catch((err) => {
        log.error(err)
        dispatch(updateSendErrors({gasLoadingError: 'gasLoadingError'}))
        dispatch(actions.gasLoadingFinished())
      })
  }
}

function gasLoadingStarted () {
  return {
    type: actions.GAS_LOADING_STARTED,
  }
}

function gasLoadingFinished () {
  return {
    type: actions.GAS_LOADING_FINISHED,
  }
}

function showChooseContractExecutorPage ({
                                           methodSelected,
                                           methodABI,
                                           inputValues,
                                           txParams,
                                         }) {
  return {
    type: actions.SHOW_CHOOSE_CONTRACT_EXECUTOR_PAGE,
    methodSelected,
    methodABI,
    inputValues,
    txParams,
  }
}

function updateSendTokenBalance ({selectedToken, tokenContract, address}) {
  return (dispatch) => {
    const tokenBalancePromise = tokenContract
      ? tokenContract.balanceOf(address)
      : Promise.resolve()
    return tokenBalancePromise
      .then((usersToken) => {
        if (usersToken) {
          const newTokenBalance = calcTokenBalance({
            selectedToken,
            usersToken,
          })
          dispatch(setSendTokenBalance(newTokenBalance.toString(10)))
        }
      })
      .catch((err) => {
        log.error(err)
        updateSendErrors({tokenBalance: 'tokenBalanceError'})
      })
  }
}

function updateSendErrors (errorObject) {
  return {
    type: actions.UPDATE_SEND_ERRORS,
    value: errorObject,
  }
}

function setSendTokenBalance (tokenBalance) {
  return {
    type: actions.UPDATE_SEND_TOKEN_BALANCE,
    value: tokenBalance,
  }
}

function updateSendFrom (from) {
  return {
    type: actions.UPDATE_SEND_FROM,
    value: from,
  }
}

function updateSendHexData (value) {
  return {
    type: actions.UPDATE_SEND_HEX_DATA,
    value,
  }
}

function updateSendTo (to, nickname = '') {
  return {
    type: actions.UPDATE_SEND_TO,
    value: {to, nickname},
  }
}

function updateSendAmount (amount) {
  return {
    type: actions.UPDATE_SEND_AMOUNT,
    value: amount,
  }
}

function updateSendMemo (memo) {
  return {
    type: actions.UPDATE_SEND_MEMO,
    value: memo,
  }
}

function setMaxModeTo (bool) {
  return {
    type: actions.UPDATE_MAX_MODE,
    value: bool,
  }
}

function updateSend (newSend) {
  return {
    type: actions.UPDATE_SEND,
    value: newSend,
  }
}

function clearSend () {
  return {
    type: actions.CLEAR_SEND,
  }
}

function sendTx (txData) {
  log.info(`actions - sendTx: ${JSON.stringify(txData.txParams)}`)
  return (dispatch, getState) => {
    log.debug(`actions calling background.approveTransaction`)
    dispatch(actions.clearSend())
    background.approveTransaction(txData.id, (err) => {
      if (err) {
        err = err.message || err.error || err
        dispatch(actions.txError(err))
        return log.error(err)
      }
      dispatch(actions.completedTx(txData.id))

      if (!hasUnconfirmedTransactions(getState())) {
        return global.platform.closeNotificationWindow()
      }
    })
  }
}

function signTokenTx (
  tokenAddress,
  toAddress,
  amount,
  txData,
  confTxScreenParams,
) {
  return (dispatch) => {
    dispatch(actions.showLoadingIndication())
    const token = global.eth.contract(abi).at(tokenAddress)
    token
      .transfer(toAddress, ethUtil.addHexPrefix(amount), txData)
      .catch((err) => {
        dispatch(actions.hideLoadingIndication())
        dispatch(actions.displayWarning(err.message))
      })
    dispatch(actions.showConfTxPage(confTxScreenParams || {}))
  }
}

function updateTransaction (txData) {
  log.info('actions: updateTx: ' + JSON.stringify(txData))
  return (dispatch) => {
    log.debug(`actions calling background.updateTx`)
    dispatch(actions.showLoadingIndication())

    return new Promise((resolve, reject) => {
      background.updateTransaction(txData, (err) => {
        dispatch(actions.updateTransactionParams(txData.id, txData.txParams))
        if (err) {
          err = err.message || err.error || err
          dispatch(actions.txError(err))
          dispatch(actions.goHome())
          log.error(err.message)
          return reject(err)
        }

        resolve(txData)
      })
    })
      .then(() => updateMetamaskStateFromBackground())
      .then((newState) => dispatch(actions.updateMetamaskState(newState)))
      .then(() => {
        dispatch(actions.showConfTxPage({id: txData.id}))
        dispatch(actions.hideLoadingIndication())
        return txData
      })
  }
}

function updateAndApproveTx (txData) {
  log.info('actions: updateAndApproveTx: ' + JSON.stringify(txData))
  return (dispatch, getState) => {
    log.debug(`actions calling background.updateAndApproveTx`)
    dispatch(actions.showLoadingIndication())

    return new Promise((resolve, reject) => {
      background.updateAndApproveTransaction(txData, (err) => {
        dispatch(actions.updateTransactionParams(txData.id, txData.txParams))
        dispatch(actions.clearSend())

        if (err) {
          err = err.message || err.error || err
          dispatch(actions.txError(err))
          dispatch(actions.goHome())
          log.error(err)
          reject(err)
        }

        resolve(txData)
      })
    })
      .then(() => updateMetamaskStateFromBackground())
      .then((newState) => dispatch(actions.updateMetamaskState(newState)))
      .then(() => {
        dispatch(actions.clearSend())
        dispatch(actions.completedTx(txData.id))
        dispatch(actions.hideLoadingIndication())
        dispatch(actions.setCurrentAccountTab('history'))

        if (!hasUnconfirmedTransactions(getState())) {
          return global.platform.closeNotificationWindow()
        }

        return txData
      })
      .catch((err) => {
        dispatch(actions.hideLoadingIndication())
        return Promise.reject(err)
      })
  }
}

function completedTx (id) {
  return {
    type: actions.COMPLETED_TX,
    value: id,
  }
}

function updateTransactionParams (id, txParams) {
  return {
    type: actions.UPDATE_TRANSACTION_PARAMS,
    id,
    value: txParams,
  }
}

function txError (err) {
  return {
    type: actions.TRANSACTION_ERROR,
    message: err.message || err.error || err,
  }
}

function cancelMsg (msgData) {
  return (dispatch, getState) => {
    dispatch(actions.showLoadingIndication())

    return new Promise((resolve, reject) => {
      log.debug(`background.cancelMessage`)
      background.cancelMessage(msgData.id, (err, newState) => {
        dispatch(actions.updateMetamaskState(newState))
        dispatch(actions.hideLoadingIndication())

        if (err) {
          return reject(err)
        }

        dispatch(actions.completedTx(msgData.id))

        if (!hasUnconfirmedTransactions(getState())) {
          return global.platform.closeNotificationWindow()
        }

        return resolve(msgData)
      })
    })
  }
}

function cancelPersonalMsg (msgData) {
  return (dispatch, getState) => {
    dispatch(actions.showLoadingIndication())

    return new Promise((resolve, reject) => {
      const id = msgData.id
      background.cancelPersonalMessage(id, (err, newState) => {
        dispatch(actions.updateMetamaskState(newState))
        dispatch(actions.hideLoadingIndication())

        if (err) {
          return reject(err)
        }

        dispatch(actions.completedTx(id))

        if (!hasUnconfirmedTransactions(getState())) {
          return global.platform.closeNotificationWindow()
        }

        return resolve(msgData)
      })
    })
  }
}

function cancelTypedMsg (msgData) {
  return (dispatch, getState) => {
    dispatch(actions.showLoadingIndication())

    return new Promise((resolve, reject) => {
      const id = msgData.id
      background.cancelTypedMessage(id, (err, newState) => {
        dispatch(actions.updateMetamaskState(newState))
        dispatch(actions.hideLoadingIndication())

        if (err) {
          return reject(err)
        }

        dispatch(actions.completedTx(id))

        if (!hasUnconfirmedTransactions(getState())) {
          return global.platform.closeNotificationWindow()
        }

        return resolve(msgData)
      })
    })
  }
}

function cancelTx (txData) {
  return (dispatch, getState) => {
    log.debug(`background.cancelTransaction`)
    dispatch(actions.showLoadingIndication())

    return new Promise((resolve, reject) => {
      background.cancelTransaction(txData.id, (err) => {
        if (err) {
          return reject(err)
        }

        resolve()
      })
    })
      .then(() => updateMetamaskStateFromBackground())
      .then((newState) => dispatch(actions.updateMetamaskState(newState)))
      .then(() => {
        dispatch(actions.clearSend())
        dispatch(actions.completedTx(txData.id))
        dispatch(actions.hideLoadingIndication())

        if (!hasUnconfirmedTransactions(getState())) {
          return global.platform.closeNotificationWindow()
        }

        return txData
      })
  }
}

/**
 * Cancels all of the given transactions
 * @param {Array<object>} txDataList a list of tx data objects
 * @return {function(*): Promise<void>}
 */
function cancelTxs (txDataList) {
  return async (dispatch, getState) => {
    dispatch(actions.showLoadingIndication())
    const txIds = txDataList.map(({id}) => id)
    const cancellations = txIds.map(
      (id) =>
        new Promise((resolve, reject) => {
          background.cancelTransaction(id, (err) => {
            if (err) {
              return reject(err)
            }

            resolve()
          })
        }),
    )

    await Promise.all(cancellations)
    const newState = await updateMetamaskStateFromBackground()
    dispatch(actions.updateMetamaskState(newState))
    dispatch(actions.clearSend())

    txIds.forEach((id) => {
      dispatch(actions.completedTx(id))
    })

    dispatch(actions.hideLoadingIndication())

    if (global.METAMASK_UI_TYPE === ENVIRONMENT_TYPE_NOTIFICATION) {
      return global.platform.closeCurrentWindow()
    }
  }
}

/**
 * @deprecated
 * @param {Array<object>} txsData
 * @return {Function}
 */
function cancelAllTx (txsData) {
  return (dispatch) => {
    txsData.forEach((txData, i) => {
      background.cancelTransaction(txData.id, () => {
        dispatch(actions.completedTx(txData.id))
        if (i === txsData.length - 1) {
          dispatch(actions.goHome())
          global.platform.closeNotificationWindow()
        }
      })
    })
  }
}

//
// initialize screen
//

function showCreateVault () {
  return {
    type: actions.SHOW_CREATE_VAULT,
  }
}

function showRestoreVault () {
  return {
    type: actions.SHOW_RESTORE_VAULT,
  }
}

function markPasswordForgotten () {
  return (dispatch) => {
    return background.markPasswordForgotten(() => {
      dispatch(actions.hideLoadingIndication())
      dispatch(actions.forgotPassword())
      forceUpdateMetamaskState(dispatch)
    })
  }
}

function unMarkPasswordForgotten () {
  return (dispatch) => {
    return new Promise((resolve) => {
      background.unMarkPasswordForgotten(() => {
        dispatch(actions.forgotPassword(false))
        resolve()
      })
    }).then(() => forceUpdateMetamaskState(dispatch))
  }
}

function forgotPassword (forgotPasswordState = true) {
  return {
    type: actions.FORGOT_PASSWORD,
    value: forgotPasswordState,
  }
}

function showInitializeMenu () {
  return {
    type: actions.SHOW_INIT_MENU,
  }
}

function showImportPage () {
  return {
    type: actions.SHOW_IMPORT_PAGE,
  }
}

function showForgetDevicePage (device) {
  return {
    type: actions.SHOW_FORGET_DEVICE_PAGE,
    value: device,
  }
}

function showConnectHWWalletPage () {
  return {
    type: actions.SHOW_HARDWARE_WALLET_PAGE,
  }
}

function showNewAccountPage (formToSelect) {
  return {
    type: actions.SHOW_NEW_ACCOUNT_PAGE,
    formToSelect,
  }
}

function setNewAccountForm (formToSelect) {
  return {
    type: actions.SET_NEW_ACCOUNT_FORM,
    formToSelect,
  }
}

function createNewVaultInProgress () {
  return {
    type: actions.CREATE_NEW_VAULT_IN_PROGRESS,
  }
}

function showNewVaultSeed (seed) {
  return {
    type: actions.SHOW_NEW_VAULT_SEED,
    value: seed,
  }
}

function showNewVaultSeed1 (seed) {
  return (dispatch) => {
    log.debug(`background.setIsRevealingSeedWords`)
    background.setIsRevealingSeedWords(true, (err, result) => {
      if (err) {
        log.error(err)
      }
    })
    dispatch({
      type: actions.SHOW_NEW_VAULT_SEED1,
      value: seed,
    })
  }
}

function closeWelcomeScreen () {
  return {
    type: actions.CLOSE_WELCOME_SCREEN,
  }
}

function backToUnlockView () {
  return {
    type: actions.BACK_TO_UNLOCK_VIEW,
  }
}

function showNewKeychain () {
  return {
    type: actions.SHOW_NEW_KEYCHAIN,
  }
}

//
// unlock screen
//

function unlockInProgress () {
  return {
    type: actions.UNLOCK_IN_PROGRESS,
  }
}

function unlockFailed (message) {
  return {
    type: actions.UNLOCK_FAILED,
    value: message,
  }
}

function unlockSucceeded (message) {
  return {
    type: actions.UNLOCK_SUCCEEDED,
    value: message,
  }
}

function unlockMetamask (account) {
  return {
    type: actions.UNLOCK_METAMASK,
    value: account,
  }
}

function updateMetamaskState (newState) {
  return {
    type: actions.UPDATE_XDC_STATE,
    value: newState,
  }
}

function showGasFields (newState) {
  return (dispatch) => {
    log.debug(`background.showGasFields`)
    background.setGasFields(newState, (err, result) => {
      if (err) {
        log.error(err)
        return dispatch(
          actions.displayWarning('Had a problem changing networks!'),
        )
      }
      dispatch({
        type: actions.UPDATE_GASFIELDS,
        value: newState,

      })
    })
  }
}

function showTokens (newState) {
  return (dispatch) => {
    log.debug(`background.showTokens`)
    background.showTokens(newState, (err, result) => {
      if (err) {
        log.error(err)
        return dispatch(
          actions.displayWarning('Had a problem changing networks!'),
        )
      }
      dispatch({
        type: actions.UPDATE_TOKENSLIST,
        value: newState,
      })
    })
  }
}

function expandedUi(newState) {
  return {
    type: actions.UPDATE_EXPANDEDUI,
    value: newState,
  }
}

function isValidName (newState) {
  return {
    type: actions.UPDATE_VALIDATION_NAME,
    value: newState,
  }
}

function isValidAddress (newState) {
  return {
    type: actions.UPDATE_VALIDATION_ADDRESS,
    value: newState,
  }
}

const backgroundSetLocked = () => {
  return new Promise((resolve, reject) => {
    background.setLocked((error) => {
      if (error) {
        return reject(error)
      }

      resolve()
    })
  })
}

const updateMetamaskStateFromBackground = () => {
  log.debug(`background.getState`)

  return new Promise((resolve, reject) => {
    background.getState((error, newState) => {
      if (error) {
        return reject(error)
      }

      resolve(newState)
    })
  })
}

function lockMetamask () {
  log.debug(`background.setLocked`)

  return (dispatch) => {
    dispatch(actions.showLoadingIndication())

    return backgroundSetLocked()
      .then(() => updateMetamaskStateFromBackground())
      .catch((error) => {
        dispatch(actions.displayWarning(error.message))
        return Promise.reject(error)
      })
      .then((newState) => {
        dispatch(actions.updateMetamaskState(newState))
        dispatch(actions.hideLoadingIndication())
        dispatch({type: actions.LOCK_METAMASK})
      })
      .catch(() => {
        dispatch(actions.hideLoadingIndication())
        dispatch({type: actions.LOCK_METAMASK})
      })
  }
}

function setCurrentAccountTab (newTabName) {
  log.debug(`background.setCurrentAccountTab: ${newTabName}`)
  return callBackgroundThenUpdateNoSpinner(
    background.setCurrentAccountTab,
    newTabName,
  )
}

function setSelectedToken (tokenAddress) {
  return {
    type: actions.SET_SELECTED_TOKEN,
    value: tokenAddress || null,
  }
}

function setSelectedAddress (address) {
  return (dispatch) => {
    dispatch(actions.showLoadingIndication())
    log.debug(`background.setSelectedAddress`)
    background.setSelectedAddress(address, (err) => {
      dispatch(actions.hideLoadingIndication())
      if (err) {
        return dispatch(actions.displayWarning(err.message))
      }
    })
  }
}

function showAccountDetail (address) {
  return (dispatch) => {
    dispatch(actions.showLoadingIndication())
    log.debug(`background.setSelectedAddress`)
    background.setSelectedAddress(address, (err, tokens) => {
      dispatch(actions.hideLoadingIndication())
      if (err) {
        return dispatch(actions.displayWarning(err.message))
      }
      dispatch(updateTokens(tokens))
      dispatch({
        type: actions.SHOW_ACCOUNT_DETAIL,
        value: address,
      })
      dispatch(actions.setSelectedToken())
    })
  }
}

function backToAccountDetail (address) {
  return {
    type: actions.BACK_TO_ACCOUNT_DETAIL,
    value: address,
  }
}

function showAccountsPage () {
  return {
    type: actions.SHOW_ACCOUNTS_PAGE,
  }
}

function showConfRecPage () {
  return {
    type: actions.SHOW_CONF_REC_PAGE,
  }
}

function showConfTxPage (screenParams) {
  return {
    type: actions.SHOW_CONF_TX_PAGE,
    transForward: screenParams.transForward || true,
    id: screenParams.id,
    value: screenParams,
  }
}

function nextTx () {
  return {
    type: actions.NEXT_TX,
  }
}

function viewPendingTx (txId) {
  return {
    type: actions.VIEW_PENDING_TX,
    value: txId,
  }
}

function previousTx () {
  return {
    type: actions.PREVIOUS_TX,
  }
}

function editTx (txId) {
  return {
    type: actions.EDIT_TX,
    value: txId,
  }
}

function showConfigPage (transitionForward = true) {
  return {
    type: actions.SHOW_CONFIG_PAGE,
    value: transitionForward,
  }
}

function showAddTokenPage (transitionForward = true) {
  return {
    type: actions.SHOW_ADD_TOKEN_PAGE,
    value: transitionForward,
  }
}

function generalSettings () {
  return {
    type: actions.SHOW_GENSETTINGS_PAGE,
    // value: transitionForward,
  }
}

function advanceSettings () {
  return {
    type: actions.SHOW_ADVSETTINGS_PAGE,
    // value: transitionForward,
  }
}

function securityAndPrivacy () {
  return {
    type: actions.SHOW_SECURITYANDPRIVACY_PAGE,
    // value: transitionForward,
  }
}

function Contacts () {
  return {
    type: actions.SHOW_CONTACTS_PAGE,
    // value: transitionForward,
  }
}

function contactDetails (contactObj) {
  return {
    type: actions.SHOW_CONTACT_DETAILS,
    value: contactObj,
  }
}


function networkSettings () {
  return {
    type: actions.SHOW_NETWORKSETTINGS_PAGE,
    // value: transitionForward,
  }
}

function showAddNetworkPage () {
  return {
    type: actions.SHOW_ADDNETWORK_PAGE,
    // value: transitionForward,
  }
}

function showAddContactsPage (contactObj) {
  return {
    type: actions.SHOW_ADDCONTACTS_PAGE,
    value: contactObj,
  }
}

function addNetwork (networkObj) {
  return {
    type: actions.ADD_NEW_NETWORK,
    value: networkObj,
  }
}

function viewNetwork (networkObj) {
  this.updatePreferences('networkList')
  return {
    type: actions.SHOW_VIEW_NETWORK_PAGE,
    value: networkObj,
  }
}

function viewContact (contactObj) {
  this.updatePreferences('contactList')
  return {
    type: actions.SHOW_VIEW_CONTACT,
    value: contactObj,
  }
}


function alertSettings () {
  return {
    type: actions.SHOW_ALERTSETTINGS_PAGE,
    // value: transitionForward,
  }
}

function showConfirmAddTokensPage (transitionForward = true) {
  return {
    type: actions.SHOW_CONFIRM_ADD_TOKEN_PAGE,
    value: transitionForward,
  }
}

function showAddSuggestedTokenPage (transitionForward = true) {
  return {
    type: actions.SHOW_ADD_SUGGESTED_TOKEN_PAGE,
    value: transitionForward,
  }
}

function showRemoveTokenPage (token, transitionForward = true) {
  return {
    type: actions.SHOW_REMOVE_TOKEN_PAGE,
    value: transitionForward,
    token,
  }
}

function addToken (address, symbol, decimals, image, network) {
  return (dispatch) => {
    dispatch(actions.showLoadingIndication())
    return new Promise((resolve, reject) => {
      background.addToken(
        address,
        symbol,
        decimals,
        image,
        network,
        (err, tokens) => {
          dispatch(actions.hideLoadingIndication())
          if (err) {
            dispatch(actions.displayWarning(err.message))
            reject(err)
          }
          dispatch(actions.updateTokens(tokens))
          resolve(tokens)
        },
      )
    })
  }
}

function removeToken (address) {
  return (dispatch) => {
    dispatch(actions.showLoadingIndication())
    return new Promise((resolve, reject) => {
      background.removeToken(address, (err, tokens) => {
        dispatch(actions.hideLoadingIndication())
        if (err) {
          dispatch(actions.displayWarning(err.message))
          reject(err)
        }
        dispatch(actions.updateTokens(tokens))
        resolve(tokens)
      })
    })
  }
}

function addTokens (tokens) {
  return (dispatch) => {
    if (Array.isArray(tokens)) {
      dispatch(
        actions.setSelectedToken(getTokenAddressFromTokenObject(tokens[0])),
      )
      return Promise.all(
        tokens.map(({address, symbol, decimals, network}) =>
          dispatch(addToken(address, symbol, decimals, network)),
        ),
      )
    } else {
      dispatch(
        actions.setSelectedToken(getTokenAddressFromTokenObject(tokens)),
      )
      return Promise.all(
        Object.entries(tokens).map(
          ([_, {address, symbol, decimals, network}]) =>
            dispatch(addToken(address, symbol, decimals, network)),
        ),
      )
    }
  }
}

function removeSuggestedTokens () {
  return (dispatch) => {
    // dispatch(actions.showLoadingIndication())
    return new Promise((resolve, reject) => {
      background.removeSuggestedTokens((err, suggestedTokens) => {
        dispatch(actions.hideLoadingIndication())
        if (err) {
          dispatch(actions.displayWarning(err.message))
        }
        dispatch(actions.clearPendingTokens())
        if (global.METAMASK_UI_TYPE === ENVIRONMENT_TYPE_NOTIFICATION) {
          return global.platform.closeCurrentWindow()
        }
        resolve(suggestedTokens)
      })
    })
      .then(() => updateMetamaskStateFromBackground())
      .then((suggestedTokens) =>
        dispatch(actions.updateMetamaskState({...suggestedTokens})),
      )
  }
}

function updateTokens (newTokens) {
  return {
    type: actions.UPDATE_TOKENS,
    newTokens,
  }
}

function clearPendingTokens () {
  return {
    type: actions.CLEAR_PENDING_TOKENS,
  }
}

function goBackToInitView () {
  return {
    type: actions.BACK_TO_INIT_MENU,
  }
}

//
// notice
//

function markNoticeRead (notice) {
  return (dispatch) => {
    dispatch(actions.showLoadingIndication())
    log.debug(`background.markNoticeRead`)
    return new Promise((resolve, reject) => {
      background.markNoticeRead(notice, (err, notice) => {
        dispatch(actions.hideLoadingIndication())
        if (err) {
          dispatch(actions.displayWarning(err.message))
          return reject(err)
        }

        if (notice) {
          dispatch(actions.showNotice(notice))
          resolve(true)
        } else {
          dispatch(actions.clearNotices())
          resolve(false)
        }
      })
    })
  }
}

function showNotice (notice) {
  return {
    type: actions.SHOW_NOTICE,
    value: notice,
  }
}

function clearNotices () {
  return {
    type: actions.CLEAR_NOTICES,
  }
}

function markAccountsFound () {
  log.debug(`background.markAccountsFound`)
  return callBackgroundThenUpdate(background.markAccountsFound)
}

function retryTransaction (txId) {
  log.debug(`background.retryTransaction`)
  let newTxId

  return (dispatch) => {
    return new Promise((resolve, reject) => {
      background.retryTransaction(txId, (err, newState) => {
        if (err) {
          dispatch(actions.displayWarning(err.message))
          reject(err)
        }

        const {selectedAddressTxList} = newState
        const {id} = selectedAddressTxList[selectedAddressTxList.length - 1]
        newTxId = id
        resolve(newState)
      })
    })
      .then((newState) => dispatch(actions.updateMetamaskState(newState)))
      .then(() => newTxId)
  }
}

function createCancelTransaction (txId, customGasPrice) {
  log.debug('background.cancelTransaction')
  let newTxId

  return (dispatch) => {
    return new Promise((resolve, reject) => {
      background.createCancelTransaction(
        txId,
        customGasPrice,
        (err, newState) => {
          if (err) {
            dispatch(actions.displayWarning(err.message))
            reject(err)
          }

          const {selectedAddressTxList} = newState
          const {id} =
            selectedAddressTxList[selectedAddressTxList.length - 1]
          newTxId = id
          resolve(newState)
        },
      )
    })
      .then((newState) => dispatch(actions.updateMetamaskState(newState)))
      .then(() => newTxId)
  }
}

//
// config
//

function setProviderType (type) {
  return (dispatch) => {
    log.debug(`background.setProviderType`, type)
    background.setProviderType(type, (err, result) => {
      if (err) {
        log.error(err)
        return dispatch(
          actions.displayWarning('Had a problem changing networks!'),
        )
      }
      dispatch(actions.updateProviderType(type))
      dispatch(actions.setSelectedToken())
    })

    const newCoin =
      type === POA || type === POA_SOKOL
        ? 'poa'
        : type === DAI
          ? 'dai'
          : type === CLASSIC
            ? 'etc'
            : type === XDC || type === XDC_TESTNET
              ? 'xdc'
              : 'eth'
    background.setCurrentCoin(newCoin, (err, data) => {
      if (err) {
        log.error(err.stack)
        return dispatch(actions.displayWarning(err.message))
      }
      dispatch({
        type: actions.SET_CURRENT_FIAT,
        value: {
          currentCurrency: data.currentCurrency,
          conversionRate: data.conversionRate,
          conversionDate: data.conversionDate,
        },
      })
    })
  }
}

function updateProviderType (type) {
  return {
    type: actions.SET_PROVIDER_TYPE,
    value: type,
  }
}

function setRpcTarget (rpcNetworkObj) {
  return (dispatch) => {
    log.debug(`background.setRpcTarget: ${rpcNetworkObj}`)
    background.setCustomRpc(rpcNetworkObj, (err, result) => {
      if (err) {
        log.error(err)
        return dispatch(
          actions.displayWarning('Had a problem changing networks!'),
        )
      }
      dispatch(actions.setSelectedToken())
    })
  }
}

function setContactTarget (contactObj) {
  return (dispatch) => {
    log.debug(`background.setContact: ${contactObj}`)
    background.setContact(contactObj, (err, result) => {
      if (err) {
        log.error(err)
        return dispatch(
          actions.displayWarning('Had a problem changing networks!'),
        )
      }
      // dispatch(actions.setSelectedToken())
    })
  }
}

function setNetworkName (networkName) {
  return (dispatch) => {
    log.debug(`background.setNetworkName: ${networkName}`)
    background.setCustomRpc(newRpc, (err, result) => {
      if (err) {
        log.error(err)
        return dispatch(
          actions.displayWarning('Had a problem changing networks!'),
        )
      }
      dispatch(actions.setSelectedToken())
    })
  }
}

function delRpcTarget (oldRPCObj) {
  return (dispatch) => {
    log.debug(`background.delRpcTarget: ${oldRPCObj}`)
    background.delCustomRpc(oldRPCObj, (err, result) => {
      if (err) {
        log.error(err)
        return dispatch(self.displayWarning('Had a problem removing network!'))
      }
      dispatch(actions.setProviderType('xdc'))

      dispatch(actions.displayWarning(''))
      dispatch(actions.setSelectedToken())
    })
  }
}


// Calls the addressBookController to add a new address.
function addToAddressBook (name, address = '', toRemove = false) {
  log.debug(`background.addToAddressBook`)
  return (dispatch) => {
    background.setAddressBook(name, address, toRemove, (err, result) => {
      if (err) {
        log.error(err)
        return dispatch(self.displayWarning('Address book failed to update'))
      }
    })
  }
}

function useEtherscanProvider () {
  log.debug(`background.useEtherscanProvider`)
  background.useEtherscanProvider()
  return {
    type: actions.USE_ETHERSCAN_PROVIDER,
  }
}

function showNetworkDropdown () {
  return {
    type: actions.NETWORK_DROPDOWN_OPEN,
  }
}

function hideNetworkDropdown () {
  return {
    type: actions.NETWORK_DROPDOWN_CLOSE,
  }
}

function showModal (payload) {
  return {
    type: actions.MODAL_OPEN,
    payload,
  }
}

function hideModal (payload) {
  return {
    type: actions.MODAL_CLOSE,
    payload,
  }
}

// function transactionDetails () {
//   return {
//     type: actions.TRANSACTION_DETAILS,
//   }
// }

function showSidebar ({transitionName, type}) {
  return {
    type: actions.SIDEBAR_OPEN,
    value: {
      transitionName,
      type,
    },
  }
}

function hideSidebar () {
  return {
    type: actions.SIDEBAR_CLOSE,
  }
}

function showAlert (msg) {
  return {
    type: actions.ALERT_OPEN,
    value: msg,
  }
}

function hideAlert () {
  return {
    type: actions.ALERT_CLOSE,
  }
}

/**
 * This action will receive two types of values via qrCodeData
 * an object with the following structure {type, values}
 * or null (used to clear the previous value)
 */
function qrCodeDetected (qrCodeData) {
  return {
    type: actions.QR_CODE_DETECTED,
    value: qrCodeData,
  }
}

function showLoadingIndication (message) {
  return {
    type: actions.SHOW_LOADING,
    value: message,
  }
}

function setHardwareWalletDefaultHdPath ({device, path}) {
  return {
    type: actions.SET_HARDWARE_WALLET_DEFAULT_HD_PATH,
    value: {device, path},
  }
}

function hideLoadingIndication () {
  return {
    type: actions.HIDE_LOADING,
  }
}

function showSubLoadingIndication () {
  return {
    type: actions.SHOW_SUB_LOADING_INDICATION,
  }
}

function hideSubLoadingIndication () {
  return {
    type: actions.HIDE_SUB_LOADING_INDICATION,
  }
}

function displayWarning (text) {
  return {
    type: actions.DISPLAY_WARNING,
    value: text,
  }
}

function hideWarning () {
  return {
    type: actions.HIDE_WARNING,
  }
}

function displayToast (text) {
  return {
    type: actions.DISPLAY_TOAST,
    value: text,
  }
}

function hideToast () {
  return {
    type: actions.HIDE_TOAST,
  }
}

function requestExportAccount () {
  return {
    type: actions.REQUEST_ACCOUNT_EXPORT,
  }
}

function exportAccount (password, address) {
  var self = this

  return function (dispatch) {
    dispatch(self.showLoadingIndication())

    log.debug(`background.submitPassword`)
    return new Promise((resolve, reject) => {
      background.submitPassword(password, function (err) {
        if (err) {
          log.error('Error in submiting password.')
          dispatch(self.hideLoadingIndication())
          dispatch(self.displayWarning('Incorrect Password.'))
          return reject(err)
        }
        log.debug(`background.exportAccount`)
        return background.exportAccount(address, function (err, result) {
          dispatch(self.hideLoadingIndication())

          if (err) {
            log.error(err)
            dispatch(
              self.displayWarning('Had a problem exporting the account.'),
            )
            return reject(err)
          }

          // dispatch(self.exportAccountComplete())
          dispatch(self.showPrivateKey(result))

          return resolve(result)
        })
      })
    })
  }
}

function exportAccountComplete () {
  return {
    type: actions.EXPORT_ACCOUNT,
  }
}

function showPrivateKey (key) {
  return {
    type: actions.SHOW_PRIVATE_KEY,
    value: key,
  }
}

function setAccountLabel (account, label) {
  return (dispatch) => {
    dispatch(actions.showLoadingIndication())
    log.debug(`background.setAccountLabel`)

    return new Promise((resolve, reject) => {
      background.setAccountLabel(account, label, (err) => {
        dispatch(actions.hideLoadingIndication())

        if (err) {
          dispatch(actions.displayWarning(err.message))
          reject(err)
        }

        dispatch({
          type: actions.SET_ACCOUNT_LABEL,
          value: {account, label},
        })

        resolve(account)
      })
    })
  }
}

function showSendPage () {
  return {
    type: actions.SHOW_SEND_PAGE,
  }
}

function showSendTokenPage (address) {
  return {
    type: actions.SHOW_SEND_TOKEN_PAGE,
    value: address,
  }
}

function showSendContractPage ({methodSelected, methodABI, inputValues}) {
  return {
    type: actions.SHOW_SEND_CONTRACT_PAGE,
    methodSelected,
    methodABI,
    inputValues,
  }
}

function buyEth (opts) {
  return (dispatch) => {
    const url = getBuyEthUrl(opts)
    global.platform.openWindow({url})
    dispatch({
      type: actions.BUY_ETH,
    })
  }
}

function onboardingBuyEthView (address) {
  return {
    type: actions.ONBOARDING_BUY_ETH_VIEW,
    value: address,
  }
}

function buyEthView (address, isContractExecutionByUser) {
  return {
    type: actions.BUY_ETH_VIEW,
    value: {
      address,
      isContractExecutionByUser,
    },
  }
}

function coinBaseSubview () {
  return {
    type: actions.COINBASE_SUBVIEW,
  }
}

function pairUpdate (coin) {
  return (dispatch) => {
    dispatch(actions.showSubLoadingIndication())
    dispatch(actions.hideWarning())
    shapeShiftRequest(
      'marketinfo',
      {pair: `${coin.toLowerCase()}_eth`},
      (mktResponse) => {
        dispatch(actions.hideSubLoadingIndication())
        if (mktResponse.error) {
          return dispatch(actions.displayWarning(mktResponse.error))
        }
        dispatch({
          type: actions.PAIR_UPDATE,
          value: {
            marketinfo: mktResponse,
          },
        })
      },
    )
  }
}

function shapeShiftSubview (network) {
  var pair = 'btc_eth'
  return (dispatch) => {
    dispatch(actions.showSubLoadingIndication())
    shapeShiftRequest('marketinfo', {pair}, (mktResponse) => {
      shapeShiftRequest('getcoins', {}, (response) => {
        dispatch(actions.hideSubLoadingIndication())
        if (mktResponse.error) {
          return dispatch(actions.displayWarning(mktResponse.error))
        }
        dispatch({
          type: actions.SHAPESHIFT_SUBVIEW,
          value: {
            marketinfo: mktResponse,
            coinOptions: response,
          },
        })
      })
    })
  }
}

function coinShiftRquest (data, marketData) {
  return (dispatch) => {
    dispatch(actions.showLoadingIndication())
    shapeShiftRequest('shift', {method: 'POST', data}, (response) => {
      dispatch(actions.hideLoadingIndication())
      if (response.error) {
        return dispatch(actions.displayWarning(response.error))
      }
      var message = `
        Deposit your ${response.depositType} to the address below:`
      log.debug(`background.createShapeShiftTx`)
      background.createShapeShiftTx(response.deposit, response.depositType)
      dispatch(
        actions.showQrView(response.deposit, [message].concat(marketData)),
      )
    })
  }
}

function buyWithShapeShift (data) {
  return (dispatch) =>
    new Promise((resolve, reject) => {
      shapeShiftRequest('shift', {method: 'POST', data}, (response) => {
        if (response.error) {
          return reject(response.error)
        }
        background.createShapeShiftTx(response.deposit, response.depositType)
        return resolve(response)
      })
    })
}

function showQrView (data, message) {
  return {
    type: actions.SHOW_QR_VIEW,
    value: {
      message: message,
      data: data,
    },
  }
}

function reshowQrCode (data, coin) {
  return (dispatch) => {
    dispatch(actions.showLoadingIndication())
    shapeShiftRequest(
      'marketinfo',
      {pair: `${coin.toLowerCase()}_eth`},
      (mktResponse) => {
        if (mktResponse.error) {
          return dispatch(actions.displayWarning(mktResponse.error))
        }

        var message = [
          `Deposit your ${coin} to the address below:`,
          `Deposit Limit: ${mktResponse.limit}`,
          `Deposit Minimum:${mktResponse.minimum}`,
        ]

        dispatch(actions.hideLoadingIndication())
        return dispatch(actions.showQrView(data, message))
        // return dispatch(actions.showModal({
        //   name: 'SHAPESHIFT_DEPOSIT_TX',
        //   Qr: { data, message },
        // }))
      },
    )
  }
}

function shapeShiftRequest (query, options, cb) {
  var queryResponse, method
  !options ? (options = {}) : null
  options.method ? (method = options.method) : (method = 'GET')

  var requestListner = function (request) {
    try {
      queryResponse = JSON.parse(this.responseText)
      cb ? cb(queryResponse) : null
      return queryResponse
    } catch (e) {
      cb ? cb({error: e}) : null
      return e
    }
  }

  var shapShiftReq = new XMLHttpRequest()
  shapShiftReq.addEventListener('load', requestListner)
  shapShiftReq.open(
    method,
    `https://shapeshift.io/${query}/${options.pair ? options.pair : ''}`,
    true,
  )

  if (options.method === 'POST') {
    var jsonObj = JSON.stringify(options.data)
    shapShiftReq.setRequestHeader('Content-Type', 'application/json')
    return shapShiftReq.send(jsonObj)
  } else {
    return shapShiftReq.send()
  }
}

function setFeatureFlag (feature, activated, notificationType) {
  return (dispatch) => {
    dispatch(actions.showLoadingIndication())
    return new Promise((resolve, reject) => {
      background.setFeatureFlag(
        feature,
        activated,
        (err, updatedFeatureFlags) => {
          dispatch(actions.hideLoadingIndication())
          if (err) {
            dispatch(actions.displayWarning(err.message))
            return reject(err)
          }
          dispatch(actions.updateFeatureFlags(updatedFeatureFlags))
          notificationType &&
          dispatch(actions.showModal({name: notificationType}))
          resolve(updatedFeatureFlags)
        },
      )
    })
  }
}

function updateFeatureFlags (updatedFeatureFlags) {
  return {
    type: actions.UPDATE_FEATURE_FLAGS,
    value: updatedFeatureFlags,
  }
}

function setPreference (preference, value) {
  return (dispatch) => {
    dispatch(actions.showLoadingIndication())
    return new Promise((resolve, reject) => {
      background.setPreference(preference, value, (err, updatedPreferences) => {
        dispatch(actions.hideLoadingIndication())

        if (err) {
          dispatch(actions.displayWarning(err.message))
          return reject(err)
        }

        dispatch(actions.updatePreferences(updatedPreferences))
        resolve(updatedPreferences)
      })
    })
  }
}

function updatePreferences (value) {
  return {
    type: actions.UPDATE_PREFERENCES,
    value,
  }
}

function setUseETHAsPrimaryCurrencyPreference (value) {
  return setPreference('useETHAsPrimaryCurrency', value)
}

function setNetworkNonce (networkNonce) {
  return {
    type: actions.SET_NETWORK_NONCE,
    value: networkNonce,
  }
}

function updateNetworkNonce (address) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      global.ethQuery.getTransactionCount(address, (err, data) => {
        if (err) {
          dispatch(actions.displayWarning(err.message))
          return reject(err)
        }
        dispatch(setNetworkNonce(data))
        resolve(data)
      })
    })
  }
}

function setMouseUserState (isMouseUser) {
  return {
    type: actions.SET_MOUSE_USER_STATE,
    value: isMouseUser,
  }
}

// Call Background Then Update
//
// A function generator for a common pattern wherein:
// We show loading indication.
// We call a background method.
// We hide loading indication.
// If it errored, we show a warning.
// If it didn't, we update the state.
function callBackgroundThenUpdateNoSpinner (method, ...args) {
  return (dispatch) => {
    method.call(background, ...args, (err) => {
      if (err) {
        return dispatch(actions.displayWarning(err.message))
      }
      forceUpdateMetamaskState(dispatch)
    })
  }
}

function callBackgroundThenUpdate (method, ...args) {
  return (dispatch) => {
    dispatch(actions.showLoadingIndication())
    method.call(background, ...args, (err) => {
      dispatch(actions.hideLoadingIndication())
      if (err) {
        return dispatch(actions.displayWarning(err.message))
      }
      forceUpdateMetamaskState(dispatch)
    })
  }
}

function forceUpdateMetamaskState (dispatch) {
  log.debug(`background.getState`)
  return new Promise((resolve, reject) => {
    background.getState((err, newState) => {
      if (err) {
        dispatch(actions.displayWarning(err.message))
        return reject(err)
      }

      dispatch(actions.updateMetamaskState(newState))
      resolve(newState)
    })
  })
}

function toggleAccountMenu () {
  return {
    type: actions.TOGGLE_ACCOUNT_MENU,
  }
}

function setUseBlockie (val) {
  return (dispatch) => {
    dispatch(actions.showLoadingIndication())
    log.debug(`background.setUseBlockie`)
    background.setUseBlockie(val, (err) => {
      dispatch(actions.hideLoadingIndication())
      if (err) {
        return dispatch(actions.displayWarning(err.message))
      }
    })
    dispatch({
      type: actions.SET_USE_BLOCKIE,
      value: val,
    })
  }
}

function updateCurrentLocale (key) {
  return (dispatch) => {
    dispatch(actions.showLoadingIndication())
    return fetchLocale(key).then((localeMessages) => {
      log.debug(`background.setCurrentLocale`)
      background.setCurrentLocale(key, (err) => {
        dispatch(actions.hideLoadingIndication())
        if (err) {
          return dispatch(actions.displayWarning(err.message))
        }
        dispatch(actions.setCurrentLocale(key))
        dispatch(actions.setLocaleMessages(localeMessages))
      })
    })
  }
}

function setCurrentLocale (key) {
  return {
    type: actions.SET_CURRENT_LOCALE,
    value: key,
  }
}

function setLocaleMessages (localeMessages) {
  return {
    type: actions.SET_LOCALE_MESSAGES,
    value: localeMessages,
  }
}

function updateNetworkEndpointType (networkEndpointType) {
  return {
    type: actions.UPDATE_NETWORK_ENDPOINT_TYPE,
    value: networkEndpointType,
  }
}

function setPendingTokens (pendingTokens) {
  const {selectedTokens = {}, customToken = {}} = pendingTokens
  const {address, symbol, decimals, network} = customToken
  Object.keys(selectedTokens).forEach((address) => {
    selectedTokens[address].network = parseInt(network)
  })
  const tokens =
    address && symbol && decimals && network
      ? {...selectedTokens, [address]: {...customToken, isCustom: true}}
      : selectedTokens

  return {
    type: actions.SET_PENDING_TOKENS,
    payload: tokens,
  }
}

function showDeleteRPC (RPC_URL, transitionForward = true) {
  return {
    type: actions.SHOW_DELETE_RPC,
    value: transitionForward,
    RPC_URL,
  }
}

function removeCustomRPC (url, provider) {
  return (dispatch) => {
    dispatch(actions.showLoadingIndication())
    return new Promise((resolve, reject) => {
      background.removeRpcUrl(url, (err, _url) => {
        if (provider.type === 'rpc' && url === provider.rpcTarget) {
          dispatch(actions.setProviderType('xdc'))
        }
        dispatch(actions.hideLoadingIndication())
        if (err) {
          dispatch(actions.displayWarning(err.message))
          reject(err)
        }
        resolve(url)
      })
    })
  }
}

function showDeleteImportedAccount (identity, keyring) {
  return {
    type: actions.SHOW_DELETE_IMPORTED_ACCOUNT,
    identity,
    keyring,
  }
}

function confirmChangePassword () {
  return {
    type: actions.CONFIRM_CHANGE_PASSWORD,
  }
}

// module.exports = {
//   setRpcName,
// }
