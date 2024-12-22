import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { formatMoney } from '../lib/utils';

const MoneyField = ({ amount, minimumAmount, allowNone, maximumAmount, onChange, defaultAmount, id, className, disabled }) => {
  const [ maskedAmount, setMaskedAmount ] = useState('');

  useEffect(() => {
    setMaskedAmount(!!amount ? formatMoney(amount) : "");
  }, [ amount ]);

  const handleChange = (evt) => {
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

    setMaskedAmount(`$${dollars}${decimal ? '.' : ''}${cents}`);
  };

  const handleBlur = (evt) => {
    evt.preventDefault();
    let amount = getAmount();
    if (amount === undefined) {
      setMaskedAmount('');
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
    setMaskedAmount(formatMoney(amount));
    onChange(amount);
  };

  const getAmount = () => {
    if (!maskedAmount) {
      return defaultAmount;
    }
    return parseMoney(maskedAmount);
  };

  const parseMoney = (input) => {
    if (input.charAt(0) === '$') {
      input = input.substring(1);
    }
    if (input.length === 0) {
      return;
    }
    return parseFloat(input).toFixed(2) * 100;
  };

  let value = maskedAmount;
  if (!value && !!defaultAmount) {
    value = formatMoney(defaultAmount)
  }

  return (
    <input id={id} type="text" className={classNames("form-control", className)}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      disabled={disabled}
    />
  );
};

export default MoneyField;
