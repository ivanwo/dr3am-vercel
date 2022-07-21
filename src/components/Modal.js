import React, { useEffect, useState } from "react";
import { msalConfig } from "../../settings/msalConfig";

const Modal = ({ modalVisible, setModalVisible }) => {
  useEffect((_) => {
    console.log(modalVisible);
  }, []);

  return (
    <div className={"modalbacker" + (modalVisible ? "" : " modalinvisible")}>
      <div className={"modal" + (modalVisible ? "" : " modalinvisible")}>
        <h1>{msalConfig.modal.title}</h1>
        <p>{msalConfig.modal.message}</p>
        <button onClick={(_) => setModalVisible(false)}>
          {msalConfig.modal.confirmtext}
        </button>
      </div>
    </div>
  );
};

export default Modal;
