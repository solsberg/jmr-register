import React from 'react';
import PropTypes from 'prop-types';
import './Loading.css';

const BASE_SIZE = 36;
const BASE_WIDTH = 0.3;
const COLOR_PATTERN = /^#?([0-9a-f]{3}){1,2}$/gi;

const Loading = (props) => {
  let caption = props.caption || "Loading";
  let loadingStyle = {
  };
  if (!!props.spinnerScale) {
    const size = Math.round(BASE_SIZE * props.spinnerScale);
    const width = Math.round(BASE_WIDTH * props.spinnerScale * 100) / 100;
    loadingStyle = {
      ...loadingStyle,
      width: `${size}px`,
      height: `${size}px`,
      borderWidth: `${width}rem`
    };
  }
  if (!!props.spinnerColor && !!props.spinnerColor.match(COLOR_PATTERN)) {
    let color = props.spinnerColor;
    if (color.charAt(0) !== "#") {
      color = "#" + color;
    }
    const alpha = color.length === 4 ? "3" : "30";
    loadingStyle = {
      ...loadingStyle,
      borderColor: color + alpha,
      borderTopColor: color
    };
  }
  return (
    <div>
      <h5 className="text-center">{caption}...</h5>
      <div className="loading" style={loadingStyle} />
    </div>
  );
}

Loading.propTypes = {
  caption: PropTypes.string,
  spinnerScale: PropTypes.number,
  spinnerColor: PropTypes.string
}

export default Loading;
