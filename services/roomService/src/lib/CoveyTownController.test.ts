// import { randomInt } from 'crypto';
// import { mock, mockReset } from 'jest-mock-extended';
// import { nanoid } from 'nanoid';
// import { Socket } from 'socket.io';
// import * as TestUtils from '../client/TestUtils';
// import { randomPlaceablesFromAllowedPlaceables } from '../client/TestUtils';
// import { PlaceableLocation, UserLocation } from '../CoveyTypes';
// import {
//   PlaceableInfo,
//   townSubscriptionHandler,
// } from '../requestHandlers/CoveyTownRequestHandlers';
// import CoveyTownListener from '../types/CoveyTownListener';
// import Placeable from '../types/Placeable';
// import Player from '../types/Player';
// import PlayerSession from '../types/PlayerSession';
// import CoveyTownController from './CoveyTownController';
// import CoveyTownsStore from './CoveyTownsStore';
// import TwilioVideo from './TwilioVideo';

// jest.mock('./TwilioVideo');

// const mockGetTokenForTown = jest.fn();
// // eslint-disable-next-line
// // @ts-ignore it's a mock
// TwilioVideo.getInstance = () => ({
//   getTokenForTown: mockGetTokenForTown,
// });

// function generateTestLocation(): UserLocation {
//   return {
//     rotation: 'back',
//     moving: Math.random() < 0.5,
//     x: Math.floor(Math.random() * 100),
//     y: Math.floor(Math.random() * 100),
//   };
// }

// describe('CoveyTownController', () => {
//   beforeEach(() => {
//     mockGetTokenForTown.mockClear();
//   });
//   it('constructor should set the friendlyName property', () => {
//     // Included in handout
//     const townName = `FriendlyNameTest-${nanoid()}`;
//     const townController = new CoveyTownController(townName, false);
//     expect(townController.friendlyName).toBe(townName);
//   });
//   describe('addPlayer', () => {
//     // Included in handout
//     it('should use the coveyTownID and player ID properties when requesting a video token', async () => {
//       const townName = `FriendlyNameTest-${nanoid()}`;
//       const townController = new CoveyTownController(townName, false);
//       const newPlayerSession = await townController.addPlayer(new Player(nanoid()));
//       expect(mockGetTokenForTown).toBeCalledTimes(1);
//       expect(mockGetTokenForTown).toBeCalledWith(
//         townController.coveyTownID,
//         newPlayerSession.player.id,
//       );
//     });
//   });
//   describe('addPlaceable', () => {
//     let townName: string;
//     let townController: CoveyTownController;
//     let player: Player;
//     let placedLocation: PlaceableLocation;
//     let placeableID: string;
//     let secondPlaceableID: string;

//     beforeEach(async () => {
//       townName = `FriendlyNameTest-${nanoid()}`;
//       townController = new CoveyTownController(townName, false);
//       player = new Player('test player');
//       await townController.addPlayer(player);
//       const xIndex = randomInt(100);
//       const yIndex = randomInt(100);
//       placedLocation = { xIndex, yIndex };
//       [placeableID, secondPlaceableID] = randomPlaceablesFromAllowedPlaceables(2);
//     });
//     it('should return a failure string when addPlaceable is called where there is already a placeable - different ids', async () => {
//       const firstCallReturn = await townController.addPlaceable(
//         player,
//         placeableID,
//         placedLocation,
//       );
//       expect(firstCallReturn).toBe(undefined);

//       const failedCallReturn = await townController.addPlaceable(
//         player,
//         secondPlaceableID,
//         placedLocation,
//       );
//       expect(failedCallReturn).not.toBe(undefined);
//       expect(failedCallReturn?.length).toBeGreaterThan(0);
//     });

//     it('should return a failure string when addPlaceable is called where there is already a placeable - same ids', async () => {
//       const firstCallReturn = await townController.addPlaceable(
//         player,
//         placeableID,
//         placedLocation,
//       );
//       expect(firstCallReturn).toBe(undefined);

//       const failedCallReturn = await townController.addPlaceable(
//         player,
//         placeableID,
//         placedLocation,
//       );
//       expect(failedCallReturn).not.toBe(undefined);
//       expect(failedCallReturn?.length).toBeGreaterThan(0);
//     });
//     it('should return a failure string when addPlaceable is called with an id that does not exist', async () => {
//       const failedCallReturn = await townController.addPlaceable(player, nanoid(), placedLocation);
//       expect(failedCallReturn).not.toBe(undefined);
//       expect(failedCallReturn?.length).toBeGreaterThan(0);
//     });
//     it('should not change what is there when addPlaceable is called where there is already a placeable', async () => {
//       const firstCallReturn = await townController.addPlaceable(
//         player,
//         placeableID,
//         placedLocation,
//       );
//       expect(firstCallReturn).toBe(undefined);

//       const secondCallReturn = await townController.addPlaceable(
//         player,
//         secondPlaceableID,
//         placedLocation,
//       );
//       expect(secondCallReturn).not.toBe(undefined);
//       expect(secondCallReturn?.length).toBeGreaterThan(0);

//       expect(townController.getPlaceableAt(placedLocation).placeableID).toBe(placeableID);
//     });
//     it('should return undefined after a successful call to addPlaceable', async () => {
//       const firstCallReturn = await townController.addPlaceable(
//         new Player(nanoid()),
//         placeableID,
//         placedLocation,
//       );
//       expect(firstCallReturn).toBe(undefined);
//     });
//     it('should be able to see the given placeable at the specified location after a successful call to addPlaceable', async () => {
//       await townController.addPlaceable(new Player(nanoid()), placeableID, placedLocation);
//       expect(townController.getPlaceableAt(placedLocation).placeableID).toBe(placeableID);
//     });
//   });
//   describe('deletePlaceable', () => {
//     let townName: string;
//     let townController: CoveyTownController;
//     let player: Player;
//     let placedLocation: PlaceableLocation;
//     let placeableID: string;

//     beforeEach(async () => {
//       townName = `FriendlyNameTest-${nanoid()}`;
//       townController = new CoveyTownController(townName, false);
//       player = new Player('test player');
//       await townController.addPlayer(player);
//       const xIndex = randomInt(100);
//       const yIndex = randomInt(100);
//       placedLocation = { xIndex, yIndex };
//       [placeableID] = randomPlaceablesFromAllowedPlaceables();
//     });
//     it('should return a fail string when deletePlaceable is called where there is not a placeable at the given location', async () => {
//       const failedCallReturn = await townController.deletePlaceable(
//         new Player(nanoid()),
//         placedLocation,
//       );
//       expect(failedCallReturn).not.toBe(undefined);
//       expect(failedCallReturn?.length).toBeGreaterThan(0);
//     });
//     it('should return undefined after a successful call to deletePlaceable', async () => {
//       const addPlaceableMessage = await townController.addPlaceable(
//         new Player(nanoid()),
//         placeableID,
//         placedLocation,
//       );
//       expect(addPlaceableMessage).toBe(undefined);

//       const failedCallReturn = townController.deletePlaceable(new Player(nanoid()), placedLocation);
//       expect(failedCallReturn).toBe(undefined);
//     });
//     it('should not be able to see a placeable at the specified location after a successful call to deletePlaceable', async () => {
//       const addPlaceableMessage = townController.addPlaceable(
//         new Player(nanoid()),
//         placeableID,
//         placedLocation,
//       );
//       expect(addPlaceableMessage).toBe(undefined);

//       const defaultPlaceable: PlaceableInfo = {
//         coveyTownID: townController.coveyTownID,
//         placeableID: Placeable.EMPTY_PLACEABLE_ID,
//         placeableName: Placeable.EMPTY_PLACEABLE_NAME,
//         location: placedLocation,
//       };
//       townController.deletePlaceable(new Player(nanoid()), placedLocation);
//       expect(townController.getPlaceableAt(placedLocation)).toStrictEqual(defaultPlaceable);
//     });
//   });
//   describe('getPlaceableAt', () => {
//     let townName: string;
//     let townController: CoveyTownController;
//     let player: Player;
//     let placedLocation: PlaceableLocation;
//     let placeableID: string;
//     let placeableInfo: PlaceableInfo;
//     let emptyInfo: PlaceableInfo;

//     beforeEach(async () => {
//       townName = `FriendlyNameTest-${nanoid()}`;
//       townController = new CoveyTownController(townName, false);
//       player = new Player('test player');
//       await townController.addPlayer(player);
//       const xIndex = randomInt(100);
//       const yIndex = randomInt(100);
//       placedLocation = { xIndex, yIndex };
//       [placeableID] = randomPlaceablesFromAllowedPlaceables();
//       const placeable = new Placeable(placeableID, placedLocation);
//       placeableInfo = {
//         coveyTownID: townController.coveyTownID,
//         placeableID: placeable.placeableID,
//         placeableName: placeable.name,
//         location: placeable.location,
//       };
//       emptyInfo = {
//         coveyTownID: townController.coveyTownID,
//         placeableID: Placeable.EMPTY_PLACEABLE_ID,
//         placeableName: Placeable.EMPTY_PLACEABLE_NAME,
//         location: placedLocation,
//       };
//     });

//     it('should return the default placeable info when get is called where there is no placeable', async () => {
//       const firstResponce = townController.getPlaceableAt(placedLocation);
//       expect(firstResponce).toStrictEqual(emptyInfo);
//     });
//     it('should return the specific placeable after a succesful addPlaceable call', async () => {
//       const addResponce = townController.addPlaceable(player, placeableID, placedLocation);
//       expect(addResponce).toStrictEqual(undefined);

//       const firstResponce = townController.getPlaceableAt(placedLocation);
//       expect(firstResponce).toStrictEqual(placeableInfo);
//     });
//     it('should return the same info after successive calls with no modifiers call inbetween', () => {
//       const addResponce = townController.addPlaceable(player, placeableID, placedLocation);
//       expect(addResponce).toBe(undefined);

//       const firstResponce = townController.getPlaceableAt(placedLocation);
//       expect(firstResponce).toStrictEqual(placeableInfo);

//       const secondResponce = townController.getPlaceableAt(placedLocation);
//       expect(secondResponce).toStrictEqual(placeableInfo);
//       expect(firstResponce).toStrictEqual(secondResponce);
//     });
//     it('Should return the original placeable if a failed added was called', async () => {
//       const addResponce = townController.addPlaceable(player, placeableID, placedLocation);
//       expect(addResponce).toBe(undefined);

//       const secondAddResponce = townController.addPlaceable(player, nanoid(), placedLocation);
//       expect(secondAddResponce).not.toBe(undefined);

//       const getResponce = townController.getPlaceableAt(placedLocation);
//       expect(getResponce).toStrictEqual(placeableInfo);
//     });
//     it('should return the default placeable info after a successful delete', async () => {
//       const addResponce = townController.addPlaceable(player, placeableID, placedLocation);
//       expect(addResponce).toBe(undefined);

//       const secondAddResponce = townController.deletePlaceable(player, placedLocation);
//       expect(secondAddResponce).toBe(undefined);

//       const getResponce = townController.getPlaceableAt(placedLocation);
//       expect(getResponce).toStrictEqual(emptyInfo);
//     });
//   });
//   describe('town listeners and events', () => {
//     let testingTown: CoveyTownController;
//     const mockListeners = [
//       mock<CoveyTownListener>(),
//       mock<CoveyTownListener>(),
//       mock<CoveyTownListener>(),
//     ];
//     beforeEach(() => {
//       const townName = `town listeners and events tests ${nanoid()}`;
//       testingTown = new CoveyTownController(townName, false);
//       mockListeners.forEach(mockReset);
//     });
//     it('should notify added listeners of player movement when updatePlayerLocation is called', async () => {
//       const player = new Player('test player');
//       await testingTown.addPlayer(player);
//       const newLocation = generateTestLocation();
//       mockListeners.forEach(listener => testingTown.addTownListener(listener));
//       testingTown.updatePlayerLocation(player, newLocation);
//       mockListeners.forEach(listener => expect(listener.onPlayerMoved).toBeCalledWith(player));
//     });
//     it('should notify added listeners of player disconnections when destroySession is called', async () => {
//       const player = new Player('test player');
//       const session = await testingTown.addPlayer(player);

//       mockListeners.forEach(listener => testingTown.addTownListener(listener));
//       testingTown.destroySession(session);
//       mockListeners.forEach(listener =>
//         expect(listener.onPlayerDisconnected).toBeCalledWith(player),
//       );
//     });
//     it('should notify added listeners of new players when addPlayer is called', async () => {
//       mockListeners.forEach(listener => testingTown.addTownListener(listener));

//       const player = new Player('test player');
//       await testingTown.addPlayer(player);
//       mockListeners.forEach(listener => expect(listener.onPlayerJoined).toBeCalledWith(player));
//     });
//     it('should notify added listeners that the town is destroyed when disconnectAllPlayers is called', async () => {
//       const player = new Player('test player');
//       await testingTown.addPlayer(player);

//       mockListeners.forEach(listener => testingTown.addTownListener(listener));
//       testingTown.disconnectAllPlayers();
//       mockListeners.forEach(listener => expect(listener.onTownDestroyed).toBeCalled());
//     });
//     it('should notify added listeners that a placeable has been added when addPlaceable is called without conflict', async () => {
//       const player = new Player('test player');
//       await testingTown.addPlayer(player);
//       const xIndex = randomInt(100);
//       const yIndex = randomInt(100);
//       const [placeableID] = randomPlaceablesFromAllowedPlaceables();

//       mockListeners.forEach(listener => testingTown.addTownListener(listener));
//       testingTown.addPlaceable(player, placeableID, { xIndex, yIndex });
//       mockListeners.forEach(listener => expect(listener.onPlaceableAdded).toBeCalled());
//     });
//     it('should not notify added listeners that a placeable has been added when addPlaceable is called with conflict', async () => {
//       const player = new Player('test player');
//       await testingTown.addPlayer(player);
//       const xIndex = randomInt(100);
//       const yIndex = randomInt(100);
//       const [placeableID] = randomPlaceablesFromAllowedPlaceables();

//       const listenerRemoved = mockListeners[1];
//       testingTown.removeTownListener(listenerRemoved);

//       const addResponce = testingTown.addPlaceable(player, placeableID, { xIndex, yIndex });
//       expect(addResponce).toBe(undefined);
//       expect(listenerRemoved.onPlaceableAdded).not.toBeCalled();
//     });
//     it('should notify added listeners that a placeable has been deleted when deletePlaceable is called without conflict', async () => {
//       const player = new Player('test player');
//       await testingTown.addPlayer(player);
//       const xIndex = randomInt(100);
//       const yIndex = randomInt(100);
//       const [placeableID] = randomPlaceablesFromAllowedPlaceables();

//       testingTown.addPlaceable(player, placeableID, { xIndex, yIndex });
//       mockListeners.forEach(listener => testingTown.addTownListener(listener));

//       const listenerRemoved = mockListeners[1];
//       testingTown.removeTownListener(listenerRemoved);

//       testingTown.deletePlaceable(player, { xIndex, yIndex });

//       expect(listenerRemoved.onPlaceableAdded).not.toBeCalled();
//     });
//     it('should not notify added listeners that a placeable has been deleted when deletePlaceable is called with conflict', async () => {
//       const player = new Player('test player');
//       await testingTown.addPlayer(player);
//       const xIndex = randomInt(100);
//       const yIndex = randomInt(100);

//       mockListeners.forEach(listener => testingTown.addTownListener(listener));
//       testingTown.deletePlaceable(player, { xIndex, yIndex });
//       mockListeners.forEach(listener => expect(listener.onPlaceableDeleted).not.toBeCalled());
//     });
//     it('should not notify removed listeners of player movement when updatePlayerLocation is called', async () => {
//       const player = new Player('test player');
//       await testingTown.addPlayer(player);

//       mockListeners.forEach(listener => testingTown.addTownListener(listener));
//       const newLocation = generateTestLocation();
//       const listenerRemoved = mockListeners[1];
//       testingTown.removeTownListener(listenerRemoved);
//       testingTown.updatePlayerLocation(player, newLocation);
//       expect(listenerRemoved.onPlayerMoved).not.toBeCalled();
//     });
//     it('should not notify removed listeners of player disconnections when destroySession is called', async () => {
//       const player = new Player('test player');
//       const session = await testingTown.addPlayer(player);

//       mockListeners.forEach(listener => testingTown.addTownListener(listener));
//       const listenerRemoved = mockListeners[1];
//       testingTown.removeTownListener(listenerRemoved);
//       testingTown.destroySession(session);
//       expect(listenerRemoved.onPlayerDisconnected).not.toBeCalled();
//     });
//     it('should not notify removed listeners of new players when addPlayer is called', async () => {
//       const player = new Player('test player');

//       mockListeners.forEach(listener => testingTown.addTownListener(listener));
//       const listenerRemoved = mockListeners[1];
//       testingTown.removeTownListener(listenerRemoved);
//       const session = await testingTown.addPlayer(player);
//       testingTown.destroySession(session);
//       expect(listenerRemoved.onPlayerJoined).not.toBeCalled();
//     });

//     it('should not notify removed listeners that the town is destroyed when disconnectAllPlayers is called', async () => {
//       const player = new Player('test player');
//       await testingTown.addPlayer(player);

//       mockListeners.forEach(listener => testingTown.addTownListener(listener));
//       const listenerRemoved = mockListeners[1];
//       testingTown.removeTownListener(listenerRemoved);
//       testingTown.disconnectAllPlayers();
//       expect(listenerRemoved.onTownDestroyed).not.toBeCalled();
//     });
//     it('should not notify removed listeners of new placeables when addPlaceable is called', async () => {
//       const player = new Player('test player');
//       await testingTown.addPlayer(player);
//       const xIndex = randomInt(100);
//       const yIndex = randomInt(100);
//       const [placeableID] = randomPlaceablesFromAllowedPlaceables();

//       mockListeners.forEach(listener => testingTown.addTownListener(listener));
//       const listenerRemoved = mockListeners[1];
//       testingTown.removeTownListener(listenerRemoved);
//       testingTown.addPlaceable(player, placeableID, { xIndex, yIndex });
//       expect(listenerRemoved.onPlaceableAdded).not.toBeCalled();
//     });
//     it('should not notify removed listeners of deleted placeables when deletedPlaceable is called', async () => {
//       const player = new Player('test player');
//       await testingTown.addPlayer(player);
//       const xIndex = randomInt(100);
//       const yIndex = randomInt(100);
//       const [placeableID] = randomPlaceablesFromAllowedPlaceables();

//       testingTown.addPlaceable(player, placeableID, { xIndex, yIndex });

//       mockListeners.forEach(listener => testingTown.addTownListener(listener));
//       const listenerRemoved = mockListeners[1];
//       testingTown.removeTownListener(listenerRemoved);
//       testingTown.deletePlaceable(player, { xIndex, yIndex });
//       expect(listenerRemoved.onPlaceableDeleted).not.toBeCalled();
//     });
//   });
//   describe('townSubscriptionHandler', () => {
//     const mockSocket = mock<Socket>();
//     let testingTown: CoveyTownController;
//     let player: Player;
//     let session: PlayerSession;
//     beforeEach(async () => {
//       const townName = `connectPlayerSocket tests ${nanoid()}`;
//       testingTown = CoveyTownsStore.getInstance().createTown(townName, false);
//       mockReset(mockSocket);
//       player = new Player('test player');
//       session = await testingTown.addPlayer(player);
//     });
//     it('should reject connections with invalid town IDs by calling disconnect', async () => {
//       TestUtils.setSessionTokenAndTownID(nanoid(), session.sessionToken, mockSocket);
//       townSubscriptionHandler(mockSocket);
//       expect(mockSocket.disconnect).toBeCalledWith(true);
//     });
//     it('should reject connections with invalid session tokens by calling disconnect', async () => {
//       TestUtils.setSessionTokenAndTownID(testingTown.coveyTownID, nanoid(), mockSocket);
//       townSubscriptionHandler(mockSocket);
//       expect(mockSocket.disconnect).toBeCalledWith(true);
//     });
//     describe('with a valid session token', () => {
//       it('should add a town listener, which should emit "newPlayer" to the socket when a player joins', async () => {
//         TestUtils.setSessionTokenAndTownID(
//           testingTown.coveyTownID,
//           session.sessionToken,
//           mockSocket,
//         );
//         townSubscriptionHandler(mockSocket);
//         await testingTown.addPlayer(player);
//         expect(mockSocket.emit).toBeCalledWith('newPlayer', player);
//       });
//       it('should add a town listener, which should emit "playerMoved" to the socket when a player moves', async () => {
//         TestUtils.setSessionTokenAndTownID(
//           testingTown.coveyTownID,
//           session.sessionToken,
//           mockSocket,
//         );
//         townSubscriptionHandler(mockSocket);
//         testingTown.updatePlayerLocation(player, generateTestLocation());
//         expect(mockSocket.emit).toBeCalledWith('playerMoved', player);
//       });
//       it('should add a town listener, which should emit "playerDisconnect" to the socket when a player disconnects', async () => {
//         TestUtils.setSessionTokenAndTownID(
//           testingTown.coveyTownID,
//           session.sessionToken,
//           mockSocket,
//         );
//         townSubscriptionHandler(mockSocket);
//         testingTown.destroySession(session);
//         expect(mockSocket.emit).toBeCalledWith('playerDisconnect', player);
//       });
//       it('should add a town listener, which should emit "townClosing" to the socket and disconnect it when disconnectAllPlayers is called', async () => {
//         TestUtils.setSessionTokenAndTownID(
//           testingTown.coveyTownID,
//           session.sessionToken,
//           mockSocket,
//         );
//         townSubscriptionHandler(mockSocket);
//         testingTown.disconnectAllPlayers();
//         expect(mockSocket.emit).toBeCalledWith('townClosing');
//         expect(mockSocket.disconnect).toBeCalledWith(true);
//       });
//       it('should add a town listener, which should emit "placeableAdded" to the socket when a placeable is added', async () => {
//         const [placeableID] = randomPlaceablesFromAllowedPlaceables();
//         const location: PlaceableLocation = { xIndex: 5, yIndex: 5 };
//         const addedPlaceable = new Placeable(placeableID, location);
//         TestUtils.setSessionTokenAndTownID(
//           testingTown.coveyTownID,
//           session.sessionToken,
//           mockSocket,
//         );
//         townSubscriptionHandler(mockSocket);
//         const addReturn = testingTown.addPlaceable(new Player(nanoid()), placeableID, location);
//         expect(addReturn).toBe(undefined);
//         expect(mockSocket.emit).toBeCalledWith('placeableAdded', addedPlaceable);
//       });
//       it('should add a town listener, which should emit "deleteAdded" to the socket when a placeable is deleted', async () => {
//         const [placeableID] = randomPlaceablesFromAllowedPlaceables();
//         const location: PlaceableLocation = { xIndex: 5, yIndex: 5 };
//         const emptyPlaceable: Placeable = Placeable.constructEmptyPlaceable(location);
//         testingTown.addPlaceable(new Player(nanoid()), placeableID, location);
//         TestUtils.setSessionTokenAndTownID(
//           testingTown.coveyTownID,
//           session.sessionToken,
//           mockSocket,
//         );
//         townSubscriptionHandler(mockSocket);
//         const deleteReturn = testingTown.deletePlaceable(new Player(nanoid()), location);
//         expect(deleteReturn).toBe(undefined);
//         expect(mockSocket.emit).toBeCalledWith('placeableDeleted', emptyPlaceable);
//       });
//       describe('when a socket disconnect event is fired', () => {
//         it('should remove the town listener for that socket, and stop sending events to it', async () => {
//           TestUtils.setSessionTokenAndTownID(
//             testingTown.coveyTownID,
//             session.sessionToken,
//             mockSocket,
//           );
//           townSubscriptionHandler(mockSocket);

//           // find the 'disconnect' event handler for the socket, which should have been registered after the socket was connected
//           const disconnectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'disconnect');
//           if (disconnectHandler && disconnectHandler[1]) {
//             disconnectHandler[1]();
//             const newPlayer = new Player('should not be notified');
//             await testingTown.addPlayer(newPlayer);
//             expect(mockSocket.emit).not.toHaveBeenCalledWith('newPlayer', newPlayer);
//           } else {
//             fail('No disconnect handler registered');
//           }
//         });
//         it('should destroy the session corresponding to that socket', async () => {
//           TestUtils.setSessionTokenAndTownID(
//             testingTown.coveyTownID,
//             session.sessionToken,
//             mockSocket,
//           );
//           townSubscriptionHandler(mockSocket);

//           // find the 'disconnect' event handler for the socket, which should have been registered after the socket was connected
//           const disconnectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'disconnect');
//           if (disconnectHandler && disconnectHandler[1]) {
//             disconnectHandler[1]();
//             mockReset(mockSocket);
//             TestUtils.setSessionTokenAndTownID(
//               testingTown.coveyTownID,
//               session.sessionToken,
//               mockSocket,
//             );
//             townSubscriptionHandler(mockSocket);
//             expect(mockSocket.disconnect).toHaveBeenCalledWith(true);
//           } else {
//             fail('No disconnect handler registered');
//           }
//         });
//       });
//       it('should forward playerMovement events from the socket to subscribed listeners', async () => {
//         TestUtils.setSessionTokenAndTownID(
//           testingTown.coveyTownID,
//           session.sessionToken,
//           mockSocket,
//         );
//         townSubscriptionHandler(mockSocket);
//         const mockListener = mock<CoveyTownListener>();
//         testingTown.addTownListener(mockListener);
//         // find the 'playerMovement' event handler for the socket, which should have been registered after the socket was connected
//         const playerMovementHandler = mockSocket.on.mock.calls.find(
//           call => call[0] === 'playerMovement',
//         );
//         if (playerMovementHandler && playerMovementHandler[1]) {
//           const newLocation = generateTestLocation();
//           player.location = newLocation;
//           playerMovementHandler[1](newLocation);
//           expect(mockListener.onPlayerMoved).toHaveBeenCalledWith(player);
//         } else {
//           fail('No playerMovement handler registered');
//         }
//       });
//     });
//   });
// });
