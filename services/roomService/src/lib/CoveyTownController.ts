import { customAlphabet, nanoid } from 'nanoid';
import { PlaceableLocation, UserLocation } from '../CoveyTypes';
import CoveyTownListener from '../types/CoveyTownListener';
import Player from '../types/Player';
import PlayerSession from '../types/PlayerSession';
import TwilioVideo from './TwilioVideo';
import IVideoClient from './IVideoClient';
import Placeable from '../types/Placeable';
import { PlaceableInfo } from '../requestHandlers/CoveyTownRequestHandlers';

const friendlyNanoID = customAlphabet('1234567890ABCDEF', 8);

/**
 * The CoveyTownController implements the logic for each town: managing the various events that
 * can occur (e.g. joining a town, moving, leaving a town)
 */
export default class CoveyTownController {
  get capacity(): number {
    return this._capacity;
  }
  set isPubliclyListed(value: boolean) {
    this._isPubliclyListed = value;
  }

  get isPubliclyListed(): boolean {
    return this._isPubliclyListed;
  }

  get townUpdatePassword(): string {
    return this._townUpdatePassword;
  }

  get players(): Player[] {
    return this._players;
  }

  get occupancy(): number {
    return this._listeners.length;
  }

  get friendlyName(): string {
    return this._friendlyName;
  }

  set friendlyName(value: string) {
    this._friendlyName = value;
  }

  get coveyTownID(): string {
    return this._coveyTownID;
  }

  /** The list of players currently in the town * */
  private _players: Player[] = [];

  /** The list of valid sessions for this town * */
  private _sessions: PlayerSession[] = [];

  /** The videoClient that this CoveyTown will use to provision video resources * */
  private _videoClient: IVideoClient = TwilioVideo.getInstance();

  /** The list of CoveyTownListeners that are subscribed to events in this town * */
  private _listeners: CoveyTownListener[] = [];

  private readonly _coveyTownID: string;

  private _friendlyName: string;

  private readonly _townUpdatePassword: string;

  private _isPubliclyListed: boolean;

  private _capacity: number;

  private _placeables: Placeable[] = [];

  constructor(friendlyName: string, isPubliclyListed: boolean) {
    this._coveyTownID = (process.env.DEMO_TOWN_ID === friendlyName ? friendlyName : friendlyNanoID());
    this._capacity = 50;
    this._townUpdatePassword = nanoid(24);
    this._isPubliclyListed = isPubliclyListed;
    this._friendlyName = friendlyName;
  }

  /**
   * Adds a player to this Covey Town, provisioning the necessary credentials for the
   * player, and returning them
   *
   * @param newPlayer The new player to add to the town
   */
  async addPlayer(newPlayer: Player): Promise<PlayerSession> {
    const theSession = new PlayerSession(newPlayer);

    this._sessions.push(theSession);
    this._players.push(newPlayer);

    // Create a video token for this user to join this town
    theSession.videoToken = await this._videoClient.getTokenForTown(this._coveyTownID, newPlayer.id);

    // Notify other players that this player has joined
    this._listeners.forEach((listener) => listener.onPlayerJoined(newPlayer));

    return theSession;
  }

  /**
   * Destroys all data related to a player in this town.
   *
   * @param session PlayerSession to destroy
   */
  destroySession(session: PlayerSession): void {
    this._players = this._players.filter((p) => p.id !== session.player.id);
    this._sessions = this._sessions.filter((s) => s.sessionToken !== session.sessionToken);
    this._listeners.forEach((listener) => listener.onPlayerDisconnected(session.player));
  }

  /**
   * Updates the location of a player within the town
   * @param player Player to update location for
   * @param location New location for this player
   */
  updatePlayerLocation(player: Player, location: UserLocation): void {
    player.updateLocation(location);
    this._listeners.forEach((listener) => listener.onPlayerMoved(player));
  }

  /**
   * Subscribe to events from this town. Callers should make sure to
   * unsubscribe when they no longer want those events by calling removeTownListener
   *
   * @param listener New listener
   */
  addTownListener(listener: CoveyTownListener): void {
    this._listeners.push(listener);
  }

  /**
   * Unsubscribe from events in this town.
   *
   * @param listener The listener to unsubscribe, must be a listener that was registered
   * with addTownListener, or otherwise will be a no-op
   */
  removeTownListener(listener: CoveyTownListener): void {
    this._listeners = this._listeners.filter((v) => v !== listener);
  }

  /**
   * Fetch a player's session based on the provided session token. Returns undefined if the
   * session token is not valid.
   *
   * @param token
   */
  getSessionByToken(token: string): PlayerSession | undefined {
    return this._sessions.find((p) => p.sessionToken === token);
  }

  disconnectAllPlayers(): void {
    this._listeners.forEach((listener) => listener.onTownDestroyed());
  }

    /**
     * Adds a placeable to this CoveyTown, checking that the player can add placeables and this placeable can be added at this specified location.
     * 
     * @param player the player that made the request to add the placeable
     * @param placeableID the id assocaited of the placeable that is wanting to be added
     * @param location the location the player is wanting to add the placeable
     */
     addPlaceable(player: Player, placeableID: string, location: PlaceableLocation): string | undefined {
       // check that player is able to add placeables (could be changed to be password instead of player)

       // check that placeable can get added 
       const conflictingPlacement: Placeable | undefined = this._placeables.find((placeable: Placeable) => placeable.location === location);
       if (conflictingPlacement !== undefined) {
         // this means there was a conflict with placement
         return 'cannot add: placeable already at specified location'
       }

       // add placeable at that location
       // will need to be updated to create the specific object wanted
       const addedPlaceable = new Placeable(placeableID, location)
       this._placeables.push(addedPlaceable)

       // then for all listeners to this room notify them that an placeable was added
        this._listeners.forEach((listener) => listener.onPlaceableAdded(addedPlaceable));
        return undefined
    }

    /**
     * deltes a placeable form this CoveyTown, checking that the player can delete placeables and this placeable can be added. 
     * returns a string that describes why the placeable couldn't be deleted or undefined if it was deleted
     * @param player the player the made the request to delete the placeable
     * @param location the location the player is wanting to delete the placeable from
     */
    deletePlaceable(player: Player, location: PlaceableLocation): string | undefined {
      // check that player is able to delete placeables (could be changed to be password instead of player)

      // check that placeable can be deleted from here 
      const conflictingPlacement: Placeable | undefined = this._placeables.find((placeable: Placeable) => placeable.location === location);
      if (conflictingPlacement === undefined) {
        // this means there was nothing to be deleted from here
        return 'cannot delete: no placeable to delete at specifed location'
      }
      else {
        // removes the placeable from the list of placebles
        this._placeables = this._placeables.filter((placeable: Placeable) => placeable.location !== location);

        // for all listeners notifies them that the object was deleted
        this._listeners.forEach((listener) => listener.onPlaceableDeleted(conflictingPlacement));

        return undefined
      }
    }

    getPlaceableAt(location: PlaceableLocation): PlaceableInfo {
      const conflictingPlacement: Placeable | undefined = this._placeables.find((placeable: Placeable) => placeable.location !== location);
      if (conflictingPlacement === undefined) {
        return {
          coveyTownID: this._coveyTownID,
          placeableID: Placeable.EMPTY_PLACEABLE_ID,
          placeableName: Placeable.EMPTY_PLACEABLE_NAME,
          location: location
        }
      }
      else {
        return {
          coveyTownID: this._coveyTownID,
          placeableID: conflictingPlacement.placeableID,
          placeableName: 'dummy name',
          location: conflictingPlacement.location
        }
      }
     
    }
}
