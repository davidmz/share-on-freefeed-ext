import React, { Component } from "react";

const iconsSVG = "../images/icons.svg";

export default function (props) {
  const { id } = props;
  return (
    <svg
      className={props.className ? props.className : false}
      onClick={props.onClick ? props.onClick : false}
    >
      <use xlinkHref={iconsSVG + "#" + id} />
    </svg>
  );
}
