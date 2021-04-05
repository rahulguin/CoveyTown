import React from 'react';
import { Divider, VStack, Center, Flex, Box, Spacer, Button, Heading, Text } from '@chakra-ui/react';
import DeviceSelectionScreen from './DeviceSelectionScreen/DeviceSelectionScreen';
import IntroContainer from '../IntroContainer/IntroContainer';
import { TownJoinResponse } from '../../../../../classes/TownsServiceClient';
import TownSelection from '../../../../Login/TownSelection';
import LocationCityIcon from '@material-ui/icons/LocationCity';

export default function PreJoinScreens(props: { doLogin: (initData: TownJoinResponse) => Promise<boolean>; setMediaError?(error: Error): void }) {
  return (
    <IntroContainer>
      <div style={{
        position: "absolute",
        backgroundColor: "white",
        width: "100%",
        opacity: "100%"
      }}>
        <Flex boxShadow="dark-lg" p="4" rounded="md" bg="white" width="100%">
          <b><LocationCityIcon/>CoveyTown</b>
        </Flex>
      </div>


      <div>


        <VStack spacing="100px" style={{
          backgroundImage: `url("https://cdn.dribbble.com/users/454082/screenshots/2555904/city_dribbble.gif")`
        }}>
          <Center height="30px">
            <Divider orientation="vertical" />
          </Center>
          <Center p="2">
            <Heading as="h2" size="xl" fontSize="56px">Welcome to Covey Town!</Heading>
          </Center>
          <Box width="50%">
            <Text fontSize={"20px"} fontFamily={"whitney"} align="center" backdrop-filter>
              Covey Town is a social platform that integrates a 2D game-like metaphor with video chat.
              To get started, setup your camera and microphone, choose a username, and then create a new town
              to hang out in, or join an existing one.
            </Text>
          </Box>
          <Center height="100px">
            <Divider orientation="vertical" />
          </Center>
        </VStack>


        <Center height="10px">
          <Divider orientation="vertical" />
        </Center>
        <DeviceSelectionScreen setMediaError={props.setMediaError} />
      </div>
      <TownSelection doLogin={props.doLogin} />
    </IntroContainer>
  );
}
