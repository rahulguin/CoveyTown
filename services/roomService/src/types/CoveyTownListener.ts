import { PlaceableLocation } from '../CoveyTypes';
import Placeable from './Placeable';
import Player from './Player';

/**
 * A listener for player-related events in each town
 */
export default interface CoveyTownListener {
  /**
   * Called when a player joins a town
   * @param newPlayer the new player
   */
  onPlayerJoined(newPlayer: Player): void;

  /**
   * Called when a player's location changes
   * @param movedPlayer the player that moved
   */
  onPlayerMoved(movedPlayer: Player): void;

  /**
   * Called when a player disconnects from the town
   * @param removedPlayer the player that disconnected
   */
  onPlayerDisconnected(removedPlayer: Player): void;

  /**
   * Called when a town is destroyed, causing all players to disconnect
   */
  onTownDestroyed(): void;

  /**
   * Called when an object gets added to the town
   */
  onPlaceableAdded(addedPlaceable: Placeable): void;

  /**
   * Called when an object gets deleted from the town
   */
  onPlaceableDeleted(placeableDeleted: Placeable): void;

  /**
   * called when a placeable add attempt was made that failed (from lack of permission, or conflict at position)
   */
  onPlaceableAddFailed(attemptedPlaceable: Placeable): void;

  /**
   * called when a placeable delete attempt was made that failed (from lack of permission, or nothing to delete at location)
   */
   onPlaceableDeleteFailed(attemptedPlaceable: Placeable): void;
}
