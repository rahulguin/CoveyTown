import { Button, Checkbox, FormControl, FormLabel, Input, MenuItem, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Table, TableCaption, Tbody, Td, Th, Thead, Tr, useDisclosure, useToast } from "@chakra-ui/react";
import { Typography } from "@material-ui/core";
import React, { useCallback, useEffect, useState } from "react";
import Player from "../../classes/Player";
import { PlayerPermissionSpecification, PlayerUpdateSpecifications } from "../../classes/TownsServiceClient";
import useCoveyAppState from "../../hooks/useCoveyAppState";
import useMaybeVideo from "../../hooks/useMaybeVideo";

export default function PermissionsButton(): JSX.Element {  
  const { isOpen, onOpen, onClose } = useDisclosure()
  const video = useMaybeVideo()
  const { players, apiClient, currentTownID } = useCoveyAppState();
  const [roomUpdatePassword, setRoomUpdatePassword] = useState<string>('');
  const [currentPlayers, setCurrentPlayers] = useState<Player[]>();
  const [currentPlayersCanPlace, setPlayersCanPlace] = useState<Map<string, boolean>>()
  const toast = useToast();

  const openPermissions = useCallback(()=>{
    onOpen();
    video?.pauseGame();
  }, [onOpen, video]);

  const closePermissions = useCallback(()=>{
    onClose();
    video?.unPauseGame();
  }, [onClose, video]);

  const processUpdates = async (action: string) =>{
    if(action === 'submit'){
      const updates: PlayerUpdateSpecifications = { specifications: []}

      currentPlayersCanPlace?.forEach((value: boolean, key: string) => {
        const playersPermission: PlayerPermissionSpecification =  { playerID: key, canPlace: value };
        updates.specifications.push(playersPermission);
      })

      try{
        await apiClient.updatePlayerPermissions({coveyTownID: currentTownID, coveyTownPassword: roomUpdatePassword,
          updates });
        toast({
          title: 'Player\'s permissions sucessfully updated',
          status: 'success'
        })
        closePermissions();
      } catch(err) {
        toast({
          title: 'Unable to update players locations',
          description: err.toString(),
          status: 'error'
        });
      }
    }
  };

  useEffect(() => {
    async function initializePlayerCanPlace(initialPlayers: Player[]): Promise<void> {
      const initialPlayerPermissions = new Map<string, boolean>();
      initialPlayers.forEach(async (player) => {
        const thisPlayerCanPlace = await apiClient.getPlayersPermission({ coveyTownID: currentTownID, playerID: player.id });
        initialPlayerPermissions.set(player.id, thisPlayerCanPlace);
      });
      setPlayersCanPlace(initialPlayerPermissions);
    }
    
    setCurrentPlayers(players)
    initializePlayerCanPlace(players);
  }, [apiClient, currentTownID, players])

    


return <>
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
      <TableCaption placement="bottom">Players</TableCaption>
      <Thead><Tr><Th>Player Name</Th><Th>player ID</Th><Th>can place</Th></Tr></Thead>
      <Tbody>
          {currentPlayers?.map((player) => (
          <Tr key={player.id}><Td role='cell'>{player.userName}</Td><Td
                      role='cell'>{player.id}</Td>
                      <Td role='cell'>
                      <Checkbox isChecked={currentPlayersCanPlace?.get(player.id)} onChange={(e) => setPlayersCanPlace(currentPlayersCanPlace?.set(player.id, e.target.checked))} spacing="1rem">Can Place</Checkbox>
                      </Td>
          </Tr>
       ))}
      </Tbody>
    </Table>
    </ModalBody>

    <ModalFooter>
      <Button data-testid='updatebutton' colorScheme="blue" mr={3} value="update" name='action2' onClick={()=>processUpdates('sumbit')}>
        Update
      </Button>
      <Button onClick={closePermissions}>Cancel</Button>
    </ModalFooter>
  </form>
</ModalContent>
</Modal>
</>

}