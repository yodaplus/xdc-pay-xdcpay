const Component = require('react').Component
const h = require('react-hyperscript')
const inherits = require('util').inherits
const ethUtil = require('ethereumjs-util')
const BN = ethUtil.BN
const extend = require('xtend')

module.exports = BnAsDecimalInput

inherits(BnAsDecimalInput, Component)
function BnAsDecimalInput () {
  this.state = { invalid: null }
  Component.call(this)
}

/* Bn as Decimal Input
 *
 * A component for allowing easy, decimal editing
 * of a passed in bn string value.
 *
 * On change, calls back its `onChange` function parameter
 * and passes it an updated bn string.
 */

BnAsDecimalInput.prototype.render = function () {
  const props = this.props
  const state = this.state

  const { value, scale, precision, onChange, min, max } = props

  const suffix = props.suffix
  const style = props.style
  const valueString = value.toString(10)
  const newMin = min && this.downsize(min.toString(10), scale)
  const newMax = max && this.downsize(max.toString(10), scale)
  const newValue = this.downsize(valueString, scale)

  return (
    h('.flex-column', [
      h('.flex-row .arrowrm', {
        style: {
          alignItems: 'flex-end',
          lineHeight: '13px',
          textRendering: 'geometricPrecision',
        },
      }, [
        h('input.hex-input', {
          type: 'number',
          step: 'any',
          required: true,
          min: newMin,
          max: newMax,
          style: extend({
            display: 'block',
            textAlign: 'left',
            backgroundColor: 'transparent',
            height: '32px',
            borderRadius: '4px',
            border: '2px solid #C7CDD8',
            fontFamily: 'Nunito Regular',
            fontSize: '14px',
            paddingLeft: '10px',
            appearance:"textfield",
          }, style),
          value: newValue,
          onBlur: (event) => {
            this.updateValidity(event)
          },
          onChange: (event) => {
            this.updateValidity(event)
            const value = (event.target.value === '') ? '' : event.target.value


            const scaledNumber = this.upsize(value, scale, precision)
            const precisionBN = new BN(scaledNumber, 10)
            onChange(precisionBN, event.target.checkValidity())
          },
          onInvalid: (event) => {
            const msg = this.constructWarning()
            if (msg === state.invalid) {
              return
            }
            this.setState({ invalid: msg })
            event.preventDefault()
            return false
          },
        }),
        // h('div', {
        //   style: {
        //     color: ' #333333',
        //     fontFamily: 'Nunito Regular',
        //     fontSize: '14px',
        //     marginLeft: '5px',
        //     width: '29px',
        //     lineHeight: '32px',
        //   },
        // }, suffix),
      ]),

      state.invalid ? h('div', {
        style: {
          // paddingLeft: '30px',
          // paddingRight: '30px',
          // background: 'rgba(255, 255, 255, 0.85)',
          // position: 'absolute',
          // top: props.id === 'gas_limit' ? '180px' : '250px',
          // left: '0px',
          marginTop: '10px',
        },
      }, [
        h('div.error', {
          style: {
            zIndex: props.id === 'gas_limit' ? '1' : '2',
            backgroundPosition: 'left',
            backgroundPositionX: '15px'
          },
        }, state.invalid),
      ]) : null,
    ])
  )
}

BnAsDecimalInput.prototype.setValid = function (message) {
  this.setState({ invalid: null })
}

BnAsDecimalInput.prototype.updateValidity = function (event) {
  const target = event.target
  const value = this.props.value
  const newValue = target.value

  if (value === newValue) {
    return 
  }

  const valid = target.checkValidity()

  if (valid) {
    this.setState({ invalid: null })
  }
}

BnAsDecimalInput.prototype.constructWarning = function () {
  const { name, min, max, scale, suffix } = this.props
  const newMin = min && this.downsize(min.toString(10), scale)
  const newMax = max && this.downsize(max.toString(10), scale)
  let message = name ? name + ' ' : ''

  if (min && max) {
    message += `must be greater than ${newMin} and less than ${newMax}.`
  } else if (min) {
    message += `must be greater than ${newMin}.`
  } else if (max) {
    message += `must be less than or equal to ${newMax}.`
  } else {
    message += 'Invalid input.'
  }

  return message
}


BnAsDecimalInput.prototype.downsize = function (number, scale) {
  // if there is no scaling, simply return the number
  if (scale === 0) {
    return Number(number)
  } else {
    // if the scale is the same as the precision, account for this edge case.
    var adjustedNumber = number
    while (adjustedNumber.length < scale) {
      adjustedNumber = '0' + adjustedNumber
    }
    return Number(adjustedNumber.slice(0, -scale) + '.' + adjustedNumber.slice(-scale))
  }
}

BnAsDecimalInput.prototype.upsize = function (number, scale, precision) {
  var stringArray = number.toString().split('.')
  var decimalLength = stringArray[1] ? stringArray[1].length : 0
  var newString = stringArray[0]

  // If there is scaling and decimal parts exist, integrate them in.
  if ((scale !== 0) && (decimalLength !== 0)) {
    newString += stringArray[1].slice(0, precision)
  }

  // Add 0s to account for the upscaling.
  for (var i = decimalLength; i < scale; i++) {
    newString += '0'
  }
  return newString
}
