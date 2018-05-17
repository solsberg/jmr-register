import React, { Component } from 'react';
import classNames from 'classnames';
import { formatMoney } from '../lib/utils';

class MoneyField extends Component {
  constructor(props) {
    super(props);

    this.state = {
      maskedAmount: !!props.amount ? formatMoney(props.amount) : ""
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.amount !== this.props.amount) {
      this.setState({
        maskedAmount: formatMoney(nextProps.amount)
      });
    }
  }

  handleChange = (evt) => {
    evt.preventDefault();
    let input = evt.target.value;
    let dollars = "";
    let cents = "";
    let decimal = false;
    for (let i = 0; i < input.length; i++) {
      const char = input.charAt(i);
      if (char === "$" || char.match(/\s/)) {
        if (dollars.length > 0 || decimal) {
          break;
        }
      } else if (!!char.match(/\d/)) {
        if (!decimal) {
          dollars += char;
        } else {
          cents += char;
          if (cents.length === 2) {
            break;
          }
        }
      } else if (char === '.' && !decimal) {
        decimal = true;
      } else {
        break;
      }
    }

    this.setState({
      maskedAmount: `$${dollars}${decimal ? '.' : ''}${cents}`
    });
  }

  handleBlur = (evt) => {
    const { minimumAmount, allowNone, maximumAmount, onChange } = this.props;

    evt.preventDefault();
    let amount = this.getAmount();
    if (amount === undefined) {
      this.setState({
        maskedAmount: ''
      });
      onChange();
      return;
    }

    if (!!minimumAmount && amount < minimumAmount) {
      if (amount > 0 || !allowNone) {
        amount = minimumAmount;
      }
    }
    if (!!maximumAmount && amount > maximumAmount) {
      amount = maximumAmount;
    }
    this.setState({
      maskedAmount: formatMoney(amount)
    });
    onChange(amount);
  }

  getAmount = () => {
    const { defaultAmount } = this.props;
    if (!this.state.maskedAmount) {
      return defaultAmount;
    }
    return this.parseMoney(this.state.maskedAmount);
  }

  parseMoney = (input) => {
    if (input.charAt(0) === '$') {
      input = input.substring(1);
    }
    if (input.length === 0) {
      return;
    }
    return parseFloat(input).toFixed(2) * 100;
  }

  render() {
    const {id, className, defaultAmount, disabled} = this.props;

    let value = this.state.maskedAmount;
    if (!value && !!defaultAmount) {
      value = formatMoney(defaultAmount)
    }

    return (
      <input id={id} type="text" className={classNames("form-control", className)}
        value={value}
        onChange={this.handleChange}
        onBlur={this.handleBlur}
        disabled={disabled}
      />
    );
  }
}

export default MoneyField;
