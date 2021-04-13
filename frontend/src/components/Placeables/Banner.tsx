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
    <Modal isOpen={showing} onClose={hiding} blockScrollOnMount>
      <ModalOverlay />
      <ModalContent maxW="50%" marginLeft="20%" marginTop="50px">
        <ModalCloseButton boxShadow="dark-md" rounded="1rem"
                          w={{ base: "30%", sm: "15%", md: "30%" }}
                          mb={{ base: 12, md: 0 }}
                          style={{color: 'white', background: 'black', width: '40px', height: '30px'}}/>
        <ModalBody isCentered>
          Hello
        </ModalBody>
      </ModalContent>
    </Modal>
  );
  return modal;

};
