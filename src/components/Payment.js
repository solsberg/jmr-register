import React, { Component } from 'react';

class Payment extends Component {
  componentWillMount() {
    this.setState({
    });
  }

  handleSubmit = (evt) => {
    evt.preventDefault();
  }

  buildStatement = () => {
    const { registration, event } = this.props;
    if (!registration || !event) {
      return [];
    }

    let order = Object.assign({}, registration.order, registration.cart);
    let lineItems = [];

    //main registration
    let totalCharges = 0;
    lineItems.push({
      description: "Accommodation type: " + order.roomChoice,
      amount: event.priceList.roomChoice[order.roomChoice],
      type: "order"
    });
    totalCharges += event.priceList.roomChoice[order.roomChoice];

    lineItems.push({
      description: "Total charges",
      amount: totalCharges,
      type: "subtotal"
    });

    lineItems.push({
      description: "Balance due",
      amount: totalCharges,
      type: "balance"
    });

    return lineItems;
  }

  renderLineItem = (item, idx) => {
    return (
      <tr key={"li" + idx} className={item.type === 'balance' && 'table-success'}>
        <td>{item.description}</td>
        <td style={{textAlign: 'right'}}>${item.amount}</td>
      </tr>
    );
  }

  render() {
    let statement = this.buildStatement();
    return (
      <div>
        Payment Form
        <div className="mt-3 col-md-6 offset-md-4">
          <table className="table table-sm">
            <tbody>
              {statement.map(this.renderLineItem)}
            </tbody>
          </table>
        </div>
        <form onSubmit={this.handleSubmit}>
        </form>
      </div>
    );
  }
}

export default Payment;
