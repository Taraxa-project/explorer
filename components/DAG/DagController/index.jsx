import React from 'react';
// import { useCallback } from "react";

const DagController = (props) => {
  // let onUp = useCallback(() => {
  //     console.log("up")
  // })
  // let onDown = useCallback(() => {
  //     console.log("down")
  // })
  // let onLeft = useCallback(() => {
  //     console.log("left")
  // })
  // let onRight = useCallback(() => {
  //     console.log("right")
  // })
  // let onMiddle = useCallback(() => {
  //     console.log("middle")
  // })

  return (
    <div className="dag-controller">
      <button className="up ion-ios-arrow-up" onClick={props.onUp} />

      <div className="mid">
        <button className="left ion-ios-arrow-back" onClick={props.onLeft} />
        <button className="middle ion-ios-refresh" onClick={props.onMiddle} />
        <button className="right ion-ios-arrow-forward" onClick={props.onRight} />
      </div>

      <button className="down ion-ios-arrow-down" onClick={props.onDown} />
    </div>
  );
};

export default DagController;
