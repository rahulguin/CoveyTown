import { Button, Checkbox, FormControl, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Table, TableCaption, Tbody, Td, Th, Thead, Tr, useDisclosure, useToast } from "@chakra-ui/react";
import { MenuItem, Typography } from "@material-ui/core";
import React, { useCallback, useEffect, useState } from "react";
import Player from "../../classes/Player";
import { PlayerPermissionSpecification, PlayerUpdateSpecifications } from "../../classes/TownsServiceClient";
import useCoveyAppState from "../../hooks/useCoveyAppState";
import useMaybeVideo from "../../hooks/useMaybeVideo";
import '../../App.css';

export default function PermissionsButton(): JSX.Element {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const video = useMaybeVideo()
  const { players, apiClient, currentTownID } = useCoveyAppState();
  const [roomUpdatePassword, setRoomUpdatePassword] = useState<string>('');
  const [currentPlayers, setCurrentPlayers] = useState<Player[]>([]);
  const [currentPlayersCanPlace, setPlayersCanPlace] = useState<Map<string, boolean>>(new Map<string, boolean>());
  const toast = useToast();

  async function updatePlayersCanPlace(playersOnOpen: Player[]): Promise<void> {
    const updatePlayerPermissions = new Map<string, boolean>();
    playersOnOpen.forEach(async (player) => {
      const thisPlayerCanPlace = await apiClient.getPlayersPermission({ coveyTownID: currentTownID, playerID: player.id });
      updatePlayerPermissions.set(player.id, thisPlayerCanPlace);
    });
    setPlayersCanPlace(updatePlayerPermissions);
  }

  const openPermissions = useCallback(async ()=>{
    await updatePlayersCanPlace(currentPlayers)
    video?.pauseGame();
    onOpen();
  }, [onOpen, video]);

  const closePermissions = useCallback(()=>{
    onClose();
    video?.unPauseGame();
  }, [onClose, video]);

  const processUpdates = async (action: string) =>{
    if(action === 'submit'){
      const updates: PlayerUpdateSpecifications = { specifications: []}
      console.log(`currentSelections ${currentPlayersCanPlace}`);
      currentPlayersCanPlace?.forEach((value: boolean, key: string) => {
        const playersPermission: PlayerPermissionSpecification =  { playerID: key, canPlace: value };
        updates.specifications.push(playersPermission);
      })
      console.log(`specifications ${updates.specifications[0].canPlace}`);

      try{
        await apiClient.updatePlayerPermissions({coveyTownID: currentTownID, coveyTownPassword: roomUpdatePassword,
          updates });
        toast({
          title: 'Player\'s permissions sucessfully updated',
          status: 'success'
        })
        closePermissions();
        updatePlayersCanPlace(currentPlayers);
      } catch(err) {
        toast({
          title: 'Unable to update players permissions',
          description: err.toString(),
          status: 'error'
        });
      }
      const playerIDToTest = updates.specifications[0].playerID
      if (playerIDToTest) {
        console.log(`has permission`, await apiClient.getPlayersPermission({ playerID: playerIDToTest, coveyTownID: currentTownID }));
      }
    }
  };

  useEffect(() => {
    setCurrentPlayers(players)
  }, [players]);

  useEffect(() => {
    updatePlayersCanPlace(currentPlayers);
  }, [currentPlayers])

return (
<>
  <MenuItem data-testid='openPermissionsMenuButton' onClick={openPermissions}>
    <Typography variant="body1">Player Permissions</Typography>
  </MenuItem>

  <Modal isOpen={isOpen} onClose={closePermissions}>  
  <ModalOverlay/>
  <ModalContent>
    <ModalHeader>change players permissions</ModalHeader>
    <ModalCloseButton/>
    <form onSubmit={(ev)=>{ev.preventDefault(); processUpdates('submit')}}>
      <ModalBody pb={6}>
      <FormControl isRequired>
          <FormLabel htmlFor="updatePassword">Town Update Password</FormLabel>
          <Input data-testid="updatePassword" id="updatePassword" placeholder="Password" name="password" type="password" value={roomUpdatePassword} onChange={(e)=>setRoomUpdatePassword(e.target.value)} />
      </FormControl>

      <Table>
        <Thead><Tr><Th>Player Name</Th><Th>player ID</Th><Th>can place</Th></Tr></Thead>
        <Tbody>
            {currentPlayers?.map((player) => (
            <Tr key={player.id}><Td role='cell'>{player.userName}</Td><Td
                        role='cell'>{player.id}</Td>
                        <Td role='cell'>
                        <Checkbox isChecked={currentPlayersCanPlace.get(player.id)} onChange={(e) => setPlayersCanPlace(currentPlayersCanPlace.set(player.id, e.target.checked))} spacing="1rem" />
                        </Td>
            </Tr>
        ))}
        </Tbody>
      </Table>
      </ModalBody>

      <ModalFooter>
        <Button data-testid='updatebutton' colorScheme="blue" mr={3} value="submit" name='action2' onClick={()=>processUpdates('submit')}>
          Submit
        </Button>
        <Button onClick={closePermissions}>Cancel</Button>
      </ModalFooter>
    </form>
  </ModalContent>
  </Modal>
</>
)

}