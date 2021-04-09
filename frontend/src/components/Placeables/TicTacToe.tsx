import React, { FunctionComponent, useEffect, useState } from 'react';
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
    const [showing, setShowing] = useState<boolean>(true);
    const hiding = () => {
        setShowing(false);
        hide();
    };
    const modal = (
        <Modal isOpen={showing} onClose={hiding}>
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
                <Button colorScheme="blue" mr={3} onClick={hiding}>
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