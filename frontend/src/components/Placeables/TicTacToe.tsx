import React, { FunctionComponent, useEffect } from 'react';
import ReactDOM from 'react-dom';
// import Button from 'react-bootstrap/Button';
// import Modal from 'react-bootstrap/Modal'\;
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button
  } from "@chakra-ui/react";
import PropTypes from 'prop-types';
  

export interface ModalProps {
  isShown: boolean;
  hide: () => void;
  modalContent: string;
  headerText: string;
}
export const TicTacToe: FunctionComponent<ModalProps> = ({
  isShown,
  hide,
  modalContent,
  headerText,
}) => {
  const modal = (
    <Modal isOpen={isShown} onClose={hide}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modal Title</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <iframe src="https://codepen.io/kapinoida/embed/OjmEGB?default-tab=result&theme-id=dark"
                title="hi"
                style={{width:'100%',height:'400px'}} />
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={hide}>
              Close
            </Button>
            <Button variant="ghost">Secondary Action</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
  );
//   return isShown ? ReactDOM.createPortal(modal, document.body) : null;
  return modal;

};