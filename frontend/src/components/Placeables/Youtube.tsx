import React, { FunctionComponent, useEffect, useState } from 'react';
import YouTube from 'react-youtube';
import getYoutubeID from "get-youtube-id";
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



export const Youtube: FunctionComponent<ModalProps> = ({
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

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const [ID, setID] = useState<string>(getYoutubeID(modalContent));

  const opts = {
    height: '390',
    width: '640',
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 1,
    },
  };

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const modal = (
    <Modal isOpen={showing} onClose={hiding} blockScrollOnMount>
      <ModalOverlay />
      <ModalContent maxW="50%" marginLeft="20%" marginTop="50px">
        <ModalCloseButton boxShadow="dark-md" rounded="1rem"
                          w={{ base: "30%", sm: "15%", md: "30%" }}
                          mb={{ base: 12, md: 0 }}
                          style={{color: 'white', background: 'black', width: '40px', height: '30px'}}/>
        <ModalBody isCentered>
          <YouTube videoId={ID} opts={{height:"520", width:'800', playerVars:{autoplay: 1}}}/>;
        </ModalBody>
      </ModalContent>
    </Modal>
  );
  return modal;

}
