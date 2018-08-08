import React from 'react';
import { formatMoney } from '../lib/utils';

const formatItemAmount = (item) => {
  let amount = formatMoney(item.amount);
  if (item.type === 'credit' || item.type === 'discount' || item.type === 'due') {
    amount = '(' + amount + ')';
  }
  return amount;
};

const renderLineItem = (item, idx) => {
  return (
    <tr key={"li" + idx} className={(item.type === 'balance' || item.type === 'due') ? 'table-success' : undefined}>
      <td>{item.description}</td>
      <td style={{textAlign: 'right'}}>{formatItemAmount(item)}</td>
    </tr>
  );
};

const StatementTable = ({lineitems}) => {
  return (
    <table className="table table-sm">
      <tbody>
        {lineitems.map(renderLineItem)}
      </tbody>
    </table>
  );
};

export default StatementTable;
