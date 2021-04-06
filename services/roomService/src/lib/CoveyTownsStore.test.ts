import { randomInt } from 'crypto';
import { nanoid } from 'nanoid';
import { randomPlaceablesFromAllowedPlaceables } from '../client/TestUtils';
import { PlaceableLocation } from '../CoveyTypes';
import { PlaceableInfo } from '../requestHandlers/CoveyTownRequestHandlers';
import CoveyTownListener from '../types/CoveyTownListener';
import Placeable from '../types/Placeable';
import Player from '../types/Player';
import CoveyTownController from './CoveyTownController';
import CoveyTownsStore from './CoveyTownsStore';

const mockCoveyListenerTownDestroyed = jest.fn();
const mockCoveyListenerOtherFns = jest.fn();

function mockCoveyListener(): CoveyTownListener {
  return {
    onPlayerDisconnected(removedPlayer: Player): void {
      mockCoveyListenerOtherFns(removedPlayer);
    },
    onPlayerMoved(movedPlayer: Player): void {
      mockCoveyListenerOtherFns(movedPlayer);
    },
    onTownDestroyed() {
      mockCoveyListenerTownDestroyed();
    },
    onPlayerJoined(newPlayer: Player) {
      mockCoveyListenerOtherFns(newPlayer);
    },
    onPlaceableAdded(addedPlaceable: Placeable) {
      mockCoveyListenerOtherFns(addedPlaceable);
    },
    onPlaceableDeleted(deletedPlaceable: Placeable) {
      mockCoveyListenerOtherFns(deletedPlaceable);
    },
  };
}

function createTownForTesting(friendlyNameToUse?: string, isPublic = false) {
  const friendlyName =
    friendlyNameToUse !== undefined
      ? friendlyNameToUse
      : `${isPublic ? 'Public' : 'Private'}TestingTown=${nanoid()}`;
  return CoveyTownsStore.getInstance().createTown(friendlyName, isPublic);
}

describe('CoveyTownsStore', () => {
  beforeEach(() => {
    mockCoveyListenerTownDestroyed.mockClear();
    mockCoveyListenerOtherFns.mockClear();
  });
  it('should be a singleton', () => {
    const store1 = CoveyTownsStore.getInstance();
    const store2 = CoveyTownsStore.getInstance();
    expect(store1).toBe(store2);
  });

  describe('createTown', () => {
    it('Should allow multiple towns with the same friendlyName', () => {
      const firstTown = createTownForTesting();
      const secondTown = createTownForTesting(firstTown.friendlyName);
      expect(firstTown).not.toBe(secondTown);
      expect(firstTown.friendlyName).toBe(secondTown.friendlyName);
      expect(firstTown.coveyTownID).not.toBe(secondTown.coveyTownID);
    });
  });

  describe('getControllerForTown', () => {
    it('Should return the same controller on repeated calls', async () => {
      const firstTown = createTownForTesting();
      expect(firstTown).toBe(
        CoveyTownsStore.getInstance().getControllerForTown(firstTown.coveyTownID),
      );
      expect(firstTown).toBe(
        CoveyTownsStore.getInstance().getControllerForTown(firstTown.coveyTownID),
      );
    });
  });

  describe('updateTown', () => {
    it('Should check the password before updating any value', () => {
      const town = createTownForTesting();
      const { friendlyName } = town;
      const res = CoveyTownsStore.getInstance().updateTown(
        town.coveyTownID,
        'abcd',
        'newName',
        true,
      );
      expect(res).toBe(false);
      expect(town.friendlyName).toBe(friendlyName);
      expect(town.isPubliclyListed).toBe(false);
    });
    it('Should fail if the townID does not exist', async () => {
      const town = createTownForTesting();
      const { friendlyName } = town;

      const res = CoveyTownsStore.getInstance().updateTown(
        'abcdef',
        town.townUpdatePassword,
        'newName',
        true,
      );
      expect(res).toBe(false);
      expect(town.friendlyName).toBe(friendlyName);
      expect(town.isPubliclyListed).toBe(false);
    });
    it('Should update the town parameters', async () => {
      // First try with just a visiblity change
      const town = createTownForTesting();
      const { friendlyName } = town;
      const res = CoveyTownsStore.getInstance().updateTown(
        town.coveyTownID,
        town.townUpdatePassword,
        undefined,
        true,
      );
      expect(res).toBe(true);
      expect(town.isPubliclyListed).toBe(true);
      expect(town.friendlyName).toBe(friendlyName);

      // Now try with just a name change
      const newFriendlyName = nanoid();
      const res2 = CoveyTownsStore.getInstance().updateTown(
        town.coveyTownID,
        town.townUpdatePassword,
        newFriendlyName,
        undefined,
      );
      expect(res2).toBe(true);
      expect(town.isPubliclyListed).toBe(true);
      expect(town.friendlyName).toBe(newFriendlyName);

      // Now try to change both
      const res3 = CoveyTownsStore.getInstance().updateTown(
        town.coveyTownID,
        town.townUpdatePassword,
        friendlyName,
        false,
      );
      expect(res3).toBe(true);
      expect(town.isPubliclyListed).toBe(false);
      expect(town.friendlyName).toBe(friendlyName);
    });
  });

  describe('deleteTown', () => {
    it('Should check the password before deleting the town', () => {
      const town = createTownForTesting();
      const res = CoveyTownsStore.getInstance().deleteTown(
        town.coveyTownID,
        `${town.townUpdatePassword}*`,
      );
      expect(res).toBe(false);
    });
    it('Should fail if the townID does not exist', async () => {
      const res = CoveyTownsStore.getInstance().deleteTown('abcdef', 'efg');
      expect(res).toBe(false);
    });
    it('Should disconnect all players', async () => {
      const town = createTownForTesting();
      town.addTownListener(mockCoveyListener());
      town.addTownListener(mockCoveyListener());
      town.addTownListener(mockCoveyListener());
      town.addTownListener(mockCoveyListener());
      town.disconnectAllPlayers();

      expect(mockCoveyListenerOtherFns.mock.calls.length).toBe(0);
      expect(mockCoveyListenerTownDestroyed.mock.calls.length).toBe(4);
    });
  });

  describe('listTowns', () => {
    it('Should include public towns', async () => {
      const town = createTownForTesting(undefined, true);
      const towns = CoveyTownsStore.getInstance().getTowns();
      const entry = towns.filter(townInfo => townInfo.coveyTownID === town.coveyTownID);
      expect(entry.length).toBe(1);
      expect(entry[0].friendlyName).toBe(town.friendlyName);
      expect(entry[0].coveyTownID).toBe(town.coveyTownID);
    });
    it('Should include each CoveyTownID if there are multiple towns with the same friendlyName', async () => {
      const town = createTownForTesting(undefined, true);
      const secondTown = createTownForTesting(town.friendlyName, true);
      const towns = CoveyTownsStore.getInstance()
        .getTowns()
        .filter(townInfo => townInfo.friendlyName === town.friendlyName);
      expect(towns.length).toBe(2);
      expect(towns[0].friendlyName).toBe(town.friendlyName);
      expect(towns[1].friendlyName).toBe(town.friendlyName);

      if (towns[0].coveyTownID === town.coveyTownID) {
        expect(towns[1].coveyTownID).toBe(secondTown.coveyTownID);
      } else if (towns[1].coveyTownID === town.coveyTownID) {
        expect(towns[0].coveyTownID).toBe(town.coveyTownID);
      } else {
        fail('Expected the coveyTownIDs to match the towns that were created');
      }
    });
    it('Should not include private towns', async () => {
      const town = createTownForTesting(undefined, false);
      const towns = CoveyTownsStore.getInstance()
        .getTowns()
        .filter(
          townInfo =>
            townInfo.friendlyName === town.friendlyName ||
            townInfo.coveyTownID === town.coveyTownID,
        );
      expect(towns.length).toBe(0);
    });
    it('Should not include private towns, even if there is a public town of same name', async () => {
      const town = createTownForTesting(undefined, false);
      const town2 = createTownForTesting(town.friendlyName, true);
      const towns = CoveyTownsStore.getInstance()
        .getTowns()
        .filter(
          townInfo =>
            townInfo.friendlyName === town.friendlyName ||
            townInfo.coveyTownID === town.coveyTownID,
        );
      expect(towns.length).toBe(1);
      expect(towns[0].coveyTownID).toBe(town2.coveyTownID);
      expect(towns[0].friendlyName).toBe(town2.friendlyName);
    });
    it('Should not include deleted towns', async () => {
      const town = createTownForTesting(undefined, true);
      const towns = CoveyTownsStore.getInstance()
        .getTowns()
        .filter(
          townInfo =>
            townInfo.friendlyName === town.friendlyName ||
            townInfo.coveyTownID === town.coveyTownID,
        );
      expect(towns.length).toBe(1);
      const res = CoveyTownsStore.getInstance().deleteTown(
        town.coveyTownID,
        town.townUpdatePassword,
      );
      expect(res).toBe(true);
      const townsPostDelete = CoveyTownsStore.getInstance()
        .getTowns()
        .filter(
          townInfo =>
            townInfo.friendlyName === town.friendlyName ||
            townInfo.coveyTownID === town.coveyTownID,
        );
      expect(townsPostDelete.length).toBe(0);
    });
  });
  describe('placeables', () => {
    let town: CoveyTownController;
    let store: CoveyTownsStore;
    let placeableID: string;
    let location: PlaceableLocation;
    let player: Player;

    beforeEach(() => {
      town = createTownForTesting();
      store = CoveyTownsStore.getInstance();
      player = new Player('test player');
      player.canPlace = true;
      town.addPlayer(player);
      [placeableID] = randomPlaceablesFromAllowedPlaceables();
      const xIndex = randomInt(100);
      const yIndex = randomInt(100);
      location = { xIndex, yIndex };
    });
    describe('addPlaceable', () => {
      it('Should fail if townID does not exist, and pass back error string', async () => {
        const responce = store.addPlaceable(
          nanoid(),
          town.townUpdatePassword,
          player.id,
          placeableID,
          location,
        );
        expect(responce).not.toBe(undefined);
        expect(responce?.length).toBeGreaterThan(0);
      });
      it('Should check the password and permission before adding placeable, and pass back error string - player doesnt have permission', async () => {
        player.canPlace = false;
        const responce = store.addPlaceable(
          town.coveyTownID,
          nanoid(),
          player.id,
          placeableID,
          location,
        );
        expect(responce).not.toBe(undefined);
        expect(responce?.length).toBeGreaterThan(0);
      });
      it('Should check the password before adding placeable, and pass back error string - player id does not exist', async () => {
        const responce = store.addPlaceable(
          town.coveyTownID,
          nanoid(),
          nanoid(),
          placeableID,
          location,
        );
        expect(responce).not.toBe(undefined);
        expect(responce?.length).toBeGreaterThan(0);
      });
      it('Should return undefined on a succesful addition - correct password', () => {
        player.canPlace = false;
        const responce = store.addPlaceable(
          town.coveyTownID,
          town.townUpdatePassword,
          player.id,
          placeableID,
          location,
        );
        expect(responce).toBe(undefined);
      });
      it('Should return undefined on a succesful addition - has permission to place', () => {
        const responce = store.addPlaceable(
          town.coveyTownID,
          nanoid(),
          player.id,
          placeableID,
          location,
        );
        expect(responce).toBe(undefined);
      });
      it('Should fail if there is already a placeable at the given location, and pass back error string', async () => {
        const firstResponce = store.addPlaceable(
          town.coveyTownID,
          town.townUpdatePassword,
          player.id,
          placeableID,
          location,
        );
        expect(firstResponce).toBe(undefined);
        const secondResponce = store.addPlaceable(
          town.coveyTownID,
          town.townUpdatePassword,
          player.id,
          placeableID,
          location,
        );
        expect(secondResponce).not.toBe(undefined);
        expect(secondResponce?.length).toBeGreaterThan(0);
      });
      it('Should fail if given a plaeable Id that does not exist', async () => {
        const secondResponce = store.addPlaceable(
          town.coveyTownID,
          town.townUpdatePassword,
          player.id,
          nanoid(),
          location,
        );
        expect(secondResponce).not.toBe(undefined);
        expect(secondResponce?.length).toBeGreaterThan(0);
      });
    });
    describe('deletePlaceable', () => {
      it('Should fail if townID does not exist', async () => {
        const addResponce = store.addPlaceable(
          town.coveyTownID,
          town.townUpdatePassword,
          player.id,
          placeableID,
          location,
        );
        expect(addResponce).toBe(undefined);

        const responce = store.deletePlaceable(
          nanoid(),
          town.townUpdatePassword,
          player.id,
          location,
        );
        expect(responce).not.toBe(undefined);
        expect(responce?.length).toBeGreaterThan(0);
      });
      it('Should check the password and permission before deleting placeable - player doesnt have permission', async () => {
        player.canPlace = false;
        const addResponce = store.addPlaceable(
          town.coveyTownID,
          town.townUpdatePassword,
          player.id,
          placeableID,
          location,
        );
        expect(addResponce).toBe(undefined);

        const responce = store.deletePlaceable(town.coveyTownID, nanoid(), player.id, location);
        expect(responce).not.toBe(undefined);
        expect(responce?.length).toBeGreaterThan(0);
      });
      it('Should check the password and permission before deleting placeable - player id doesnt exist', async () => {
        const addResponce = store.addPlaceable(
          town.coveyTownID,
          town.townUpdatePassword,
          player.id,
          placeableID,
          location,
        );
        expect(addResponce).toBe(undefined);

        const responce = store.deletePlaceable(town.coveyTownID, nanoid(), nanoid(), location);
        expect(responce).not.toBe(undefined);
        expect(responce?.length).toBeGreaterThan(0);
      });
      it('Should fail if there is not a placeable at the given location, and pass back error string', async () => {
        const responce = store.deletePlaceable(
          town.coveyTownID,
          town.townUpdatePassword,
          player.id,
          location,
        );
        expect(responce).not.toBe(undefined);
        expect(responce?.length).toBeGreaterThan(0);
      });
      it('Should return undefined on a succesful deletion - correct password', async () => {
        player.canPlace = false;
        const addResponce = store.addPlaceable(
          town.coveyTownID,
          town.townUpdatePassword,
          player.id,
          placeableID,
          location,
        );
        expect(addResponce).toBe(undefined);

        const responce = store.deletePlaceable(
          town.coveyTownID,
          town.townUpdatePassword,
          player.id,
          location,
        );
        expect(responce).toBe(undefined);
      });
      it('Should return undefined on a succesful deletion - player has permission', async () => {
        const addResponce = store.addPlaceable(
          town.coveyTownID,
          nanoid(),
          player.id,
          placeableID,
          location,
        );
        expect(addResponce).toBe(undefined);

        const responce = store.deletePlaceable(
          town.coveyTownID,
          town.townUpdatePassword,
          player.id,
          location,
        );
        expect(responce).toBe(undefined);
      });
      it('Should fail after repeated calls of deletion', async () => {
        const addResponce = store.addPlaceable(
          town.coveyTownID,
          town.townUpdatePassword,
          player.id,
          placeableID,
          location,
        );
        expect(addResponce).toBe(undefined);

        const firstResponce = store.deletePlaceable(
          town.coveyTownID,
          town.townUpdatePassword,
          player.id,
          location,
        );
        expect(firstResponce).toBe(undefined);

        const secondResponce = store.deletePlaceable(
          town.coveyTownID,
          town.townUpdatePassword,
          player.id,
          location,
        );
        expect(secondResponce).not.toBe(undefined);
        expect(secondResponce?.length).toBeGreaterThan(0);
      });
    });
    describe('getPlaceable', () => {
      let placeableInfo: PlaceableInfo;
      let emptyInfo: PlaceableInfo;
      beforeEach(() => {
        const placeable = new Placeable(placeableID, location);
        placeableInfo = {
          coveyTownID: town.coveyTownID,
          placeableID: placeable.placeableID,
          placeableName: placeable.name,
          location: placeable.location,
        };
        emptyInfo = {
          coveyTownID: town.coveyTownID,
          placeableID: Placeable.EMPTY_PLACEABLE_ID,
          placeableName: Placeable.EMPTY_PLACEABLE_NAME,
          location,
        };
      });
      it('Should fail if townID does not exist', async () => {
        const addResponce = store.addPlaceable(
          town.coveyTownID,
          town.townUpdatePassword,
          player.id,
          placeableID,
          location,
        );
        expect(addResponce).toBe(undefined);

        const getResponce = store.getPlaceable(nanoid(), location);
        expect(getResponce).toStrictEqual(undefined);
      });
      it('Should return the same placeable that was just added if succesful', async () => {
        const addResponce = store.addPlaceable(
          town.coveyTownID,
          town.townUpdatePassword,
          player.id,
          placeableID,
          location,
        );
        expect(addResponce).toBe(undefined);

        const getResponce = store.getPlaceable(town.coveyTownID, location);
        expect(getResponce).toStrictEqual(placeableInfo);
      });
      it('Should return the same placeable on repeated calls with no modifiers called', async () => {
        const addResponce = store.addPlaceable(
          town.coveyTownID,
          town.townUpdatePassword,
          player.id,
          placeableID,
          location,
        );
        expect(addResponce).toBe(undefined);

        const firstResponce = store.getPlaceable(town.coveyTownID, location);
        expect(firstResponce).toStrictEqual(placeableInfo);
        const secondResponce = store.getPlaceable(town.coveyTownID, location);
        expect(secondResponce).toStrictEqual(placeableInfo);
        expect(firstResponce).toStrictEqual(secondResponce);
      });
      it('Should return the default placeable if no placable has been added at the location', async () => {
        const getResponce = store.getPlaceable(town.coveyTownID, location);
        expect(getResponce).toStrictEqual(emptyInfo);
      });
      it('Should return the original placeable if a failed added was called', async () => {
        const addResponce = store.addPlaceable(
          town.coveyTownID,
          town.townUpdatePassword,
          player.id,
          placeableID,
          location,
        );
        expect(addResponce).toBe(undefined);

        const secondAddResponce = store.addPlaceable(
          town.coveyTownID,
          town.townUpdatePassword,
          player.id,
          placeableID,
          location,
        );
        expect(secondAddResponce).not.toBe(undefined);

        const getResponce = store.getPlaceable(town.coveyTownID, location);
        expect(getResponce).toStrictEqual(placeableInfo);
      });
      it('Should return the default placeable that was just deleted if succesful', async () => {
        const addResponce = store.addPlaceable(
          town.coveyTownID,
          town.townUpdatePassword,
          player.id,
          placeableID,
          location,
        );
        expect(addResponce).toBe(undefined);

        const secondAddResponce = store.deletePlaceable(
          town.coveyTownID,
          town.townUpdatePassword,
          player.id,
          location,
        );
        expect(secondAddResponce).toBe(undefined);

        const getResponce = store.getPlaceable(town.coveyTownID, location);
        expect(getResponce).toStrictEqual(emptyInfo);
      });
      it('Should return the original placeable if a failed delete was called - wrong password', async () => {
        const addResponce = store.addPlaceable(
          town.coveyTownID,
          town.townUpdatePassword,
          player.id,
          placeableID,
          location,
        );
        expect(addResponce).toBe(undefined);

        const secondAddResponce = store.deletePlaceable(
          town.coveyTownID,
          nanoid(),
          player.id,
          location,
        );
        expect(secondAddResponce).not.toBe(undefined);

        const getResponce = store.getPlaceable(town.coveyTownID, location);
        expect(getResponce).toStrictEqual(placeableInfo);
      });
      it('Should return the original placeable if a failed delete was called - wrong id', async () => {
        const addResponce = store.addPlaceable(
          town.coveyTownID,
          town.townUpdatePassword,
          player.id,
          placeableID,
          location,
        );
        expect(addResponce).toBe(undefined);

        const secondAddResponce = store.deletePlaceable(
          nanoid(),
          town.townUpdatePassword,
          player.id,
          location,
        );
        expect(secondAddResponce).not.toBe(undefined);

        const getResponce = store.getPlaceable(town.coveyTownID, location);
        expect(getResponce).toStrictEqual(placeableInfo);
      });
    });
  });
});
