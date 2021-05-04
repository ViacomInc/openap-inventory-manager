import React from "react";
import ReactModal from "react-modal";
import { Button, Icons } from "./";

import { APP_ID } from "../../config";
import Styles from "./Modal.module.css";

const parentSelector = () => document.getElementById(APP_ID) || document.body;

const styles = {
  portalClassName: Styles.Portal,
  bodyOpenClassName: Styles.BodyOpen,
  htmlOpenClassName: Styles.HTMLOpen,
  className: {
    base: Styles.Content,
    afterOpen: Styles.ContentDidOpen,
    beforeClose: Styles.ContentWillClose,
  },
  overlayClassName: {
    base: Styles.Overlay,
    afterOpen: Styles.OverlayDidOpen,
    beforeClose: Styles.OverlayWillClose,
  },
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAfterClose?: () => void;
  onAfterOpen?: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  onAfterClose,
  onAfterOpen,
  title,
  children,
}: ModalProps): JSX.Element {
  return (
    <ReactModal
      {...styles}
      ariaHideApp={false}
      isOpen={isOpen}
      onRequestClose={onClose}
      onAfterOpen={onAfterOpen}
      onAfterClose={onAfterClose}
      closeTimeoutMS={300}
      parentSelector={parentSelector}
    >
      <Button
        className={Styles.CloseButton}
        onClick={onClose}
        icon={Icons.Close}
      />
      {title && <h1 className={Styles.Title}>{title}</h1>}
      {children}
    </ReactModal>
  );
}
