import React from 'react';
import classNames from 'classnames';
import { formatMoney } from '../lib/utils';
import './LodgingCard.css';

const LodgingCard = ({roomType, title, description, price, strikeoutPrice, priceSingle,
    selected, singleSelected, onClick, onToggleSingle}) => {
  return (
    <div className={classNames("card", "lodging-card", selected && "selected")}
        onClick={() => onClick(roomType)}>
      <img className="card-img-top thumbnail" src={`/images/${roomType}.jpg`} alt="Lodging thumbnail" />
      <div className="img-caption">
        <h2 className={classNames("content", selected || "hidden")}>Selected</h2>
      </div>
      <div className="card-body">
        <p className="price">{formatMoney(price, 0)}</p>
        {strikeoutPrice && <p className="price strikeout mr-2">{formatMoney(strikeoutPrice, 0)}</p>}
        <h5 className="card-title">{title}</h5>
        <p className="card-text">{description}</p>
        {priceSingle &&
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="single-room"
              checked={selected && singleSelected}
              disabled={!selected}
              onChange={onToggleSingle}
            />
            <label className="form-check-label" htmlFor="single-room">
              Single room supplement
            </label>
            <span className="price-single">{formatMoney(priceSingle, 0)}</span>
          </div>
        }
      </div>
    </div>
  );
}

export default LodgingCard;
