import React, { FunctionComponent, useEffect, useState } from 'react';
import 'react-responsive-modal/styles.css';
import { Modal } from 'react-responsive-modal';

import {
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button, Box
} from "@chakra-ui/react";


export interface ModalProps {
  isShown: boolean;
  hide: () => void;
  modalContent: string;
  headerText: string;
}
export const Banner: FunctionComponent<ModalProps> = ({
                                                        isShown,
                                                        hide,
                                                        modalContent,
                                                        headerText,
                                                      }) => {
  const [showing, setShowing] = useState<boolean>(true);
  const hiding = () => {
    setShowing(false);
    hide();
  };

  const modal = (
    <Modal open={showing} onClose={hiding} center blockScroll>
      <h1 style={{textAlign: "center", color: "red", fontFamily: "Lucida Handwriting", fontSize: "20px", fontWeight: "bolder"}}>TOWN ANNOUCEMENT!</h1>
      &nbsp;
      <h1>{modalContent}</h1>
    </Modal>

  );
  return modal;

};
