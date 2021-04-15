import React, { FunctionComponent, useState } from 'react';
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
export const Chess: FunctionComponent<ModalProps> = ({hide}) => {
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
          <iframe src="https://fritz.chessbase.com"
                  title="hi"
                  style={{width:'100%',height:'400px'}} />
          <iframe width="644" height="362" src="https://www.youtube.com/embed/tUXn5azsTic" title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen />
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
