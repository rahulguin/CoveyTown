import { Socket } from 'socket.io-client';
import Player, { UserLocation } from './classes/Player';
import Placeable from './classes/Placeable';
import TownsServiceClient from './classes/TownsServiceClient';

export type CoveyEvent = 'playerMoved' | 'playerAdded' | 'playerRemoved' | 'placeableAdded' | 'placeableRemoved';

export type VideoRoom = {
  twilioID: string,
  id: string
};
export type UserProfile = {
  displayName: string,
  id: string
};
export type NearbyPlayers = {
  nearbyPlayers: Player[]
};
export type CoveyAppState = {
  sessionToken: string,
  userName: string,
  currentTownFriendlyName: string,
  currentTownID: string,
  currentTownIsPubliclyListed: boolean,
  myPlayerID: string,
  mySecretKey: string,
  players: Player[],
  currentLocation: UserLocation,
  nearbyPlayers: NearbyPlayers,
  emitMovement: (location: UserLocation) => void,
  socket: Socket | null,
  apiClient: TownsServiceClient,
  placeables: Placeable[]
};


