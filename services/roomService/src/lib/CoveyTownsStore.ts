import CoveyTownController from './CoveyTownController';
import { CoveyTownList, PlaceableLocation } from '../CoveyTypes';
import { PlaceableInfo } from '../requestHandlers/CoveyTownRequestHandlers';
import Player from '../types/Player';

function passwordMatches(provided: string, expected: string): boolean {
  if (provided === expected) {
    return true;
  }
  if (process.env.MASTER_TOWN_PASSWORD && process.env.MASTER_TOWN_PASWORD === provided) {
    return true;
  }
  return false;
}

export default class CoveyTownsStore {
  private static _instance: CoveyTownsStore;

  private _towns: CoveyTownController[] = [];

  static getInstance(): CoveyTownsStore {
    if (CoveyTownsStore._instance === undefined) {
      CoveyTownsStore._instance = new CoveyTownsStore();
    }
    return CoveyTownsStore._instance;
  }

  getControllerForTown(coveyTownID: string): CoveyTownController | undefined {
    return this._towns.find(town => town.coveyTownID === coveyTownID);
  }

  getTowns(): CoveyTownList {
    return this._towns.filter(townController => townController.isPubliclyListed)
      .map(townController => ({
        coveyTownID: townController.coveyTownID,
        friendlyName: townController.friendlyName,
        currentOccupancy: townController.occupancy,
        maximumOccupancy: townController.capacity,
      }));
  }

  createTown(friendlyName: string, isPubliclyListed: boolean): CoveyTownController {
    const newTown = new CoveyTownController(friendlyName, isPubliclyListed);
    this._towns.push(newTown);
    return newTown;
  }

  updateTown(coveyTownID: string, coveyTownPassword: string, friendlyName?: string, makePublic?: boolean): boolean {
    const existingTown = this.getControllerForTown(coveyTownID);
    if (existingTown && passwordMatches(coveyTownPassword, existingTown.townUpdatePassword)) {
      if (friendlyName !== undefined) {
        if (friendlyName.length === 0) {
          return false;
        }
        existingTown.friendlyName = friendlyName;
      }
      if (makePublic !== undefined) {
        existingTown.isPubliclyListed = makePublic;
      }
      return true;
    }
    return false;
  }

  deleteTown(coveyTownID: string, coveyTownPassword: string): boolean {
    const existingTown = this.getControllerForTown(coveyTownID);
    if (existingTown && passwordMatches(coveyTownPassword, existingTown.townUpdatePassword)) {
      this._towns = this._towns.filter(town => town !== existingTown);
      existingTown.disconnectAllPlayers();
      return true;
    }
    return false;
  }

  addPlaceable(coveyTownID: string, coveyTownPassword: string, placeableID: string, placeableLocation: PlaceableLocation): string | undefined {
    const existingTown = this.getControllerForTown(coveyTownID);
    if (existingTown && passwordMatches(coveyTownPassword, existingTown.townUpdatePassword)) {
      // currently provides a dummy player that can then later be swapped out for permissions funciton
      const addResponce = existingTown.addPlaceable(new Player('dummy'), placeableID, placeableLocation)
      return addResponce;
    }
    return 'Invalid room information: Double check that the room exists and password is correct';
  }

  deletePlaceable(coveyTownID: string, coveyTownPassword: string, placeableLocation: PlaceableLocation): string | undefined {
    const existingTown = this.getControllerForTown(coveyTownID);
    if (existingTown && passwordMatches(coveyTownPassword, existingTown.townUpdatePassword)) {
      // currently provides a dummy player that can then later be swapped out for permissions funciton
      const deleteResponce = existingTown.deletePlaceable(new Player('dummy'), placeableLocation)
      return deleteResponce;
    }
    return 'Invalid room information: Double check that the room exists and password is correct';
  }

  getPlaceable(coveyTownID: string, placeableLocation: PlaceableLocation): PlaceableInfo | undefined {
    const existingTown = this.getControllerForTown(coveyTownID);
    if (existingTown) {
      const deleteResponce = existingTown.getPlaceableAt(placeableLocation)
      return deleteResponce;
    }
    return undefined;
  }

}
