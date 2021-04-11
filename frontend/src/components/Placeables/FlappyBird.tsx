import React, { FunctionComponent, useEffect, useState } from 'react';
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
export const FlappyBird: FunctionComponent<ModalProps> = ({
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
      <ModalContent maxW="50%" marginLeft="20%" marginTop="50px" boxShadow="dark-md" rounded="1rem" w={{ base: "30%", sm: "15%", md: "30%" }} mb={{ base: 12, md: 0 }}>
        <ModalCloseButton />
        <ModalBody isCentered>
          <iframe src="https://funhtml5games.com?embed=flappy" title="gf" style={{width:'800px' ,height:'520px'}}
                      frameBorder="0" scrolling="no" />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
  return modal;

};
