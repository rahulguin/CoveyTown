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
  Button, Box
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
        <Modal isOpen={showing} onClose={hiding} blockScrollOnMount>
            <ModalOverlay />
            <ModalContent maxW="50%" marginLeft="20%" marginTop="50px">
              <ModalCloseButton boxShadow="dark-md" rounded="1rem"
                                w={{ base: "30%", sm: "15%", md: "30%" }}
                                mb={{ base: 12, md: 0 }}
                                style={{color: 'white', background: 'black', width: '40px', height: '30px'}}/>
            <ModalBody isCentered>
              <iframe src="https://codepen.io/kapinoida/embed/OjmEGB?default-tab=result&theme-id=dark"
                      title="hi"
                      style={{width:'100%',height:'500px'}} />
              { /* <iframe src="https://funhtml5games.com?embed=flappy" title="gf" style={{width:'800px' ,height:'520px'}}
                      frameBorder="0" scrolling="no" /> */ }
            </ModalBody>
            </ModalContent>
        </Modal>
    );
    //   return isShown ? ReactDOM.createPortal(modal, document.body) : null;
    return modal;

};