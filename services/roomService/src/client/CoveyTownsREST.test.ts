import assert from 'assert';
import CORS from 'cors';
import { randomInt } from 'crypto';
import Express from 'express';
import http from 'http';
import { nanoid } from 'nanoid';
import { AddressInfo } from 'net';
import addTownRoutes from '../router/towns';
import Placeable from '../types/Placeable';
import TownsServiceClient, {
  PlaceableInfo,
  PlaceableLocation,
  TownListResponse,
} from './TownsServiceClient';

type TestTownData = {
  friendlyName: string;
  coveyTownID: string;
  isPubliclyListed: boolean;
  townUpdatePassword: string;
};

function expectTownListMatches(towns: TownListResponse, town: TestTownData) {
  const matching = towns.towns.find(townInfo => townInfo.coveyTownID === town.coveyTownID);
  if (town.isPubliclyListed) {
    expect(matching).toBeDefined();
    assert(matching);
    expect(matching.friendlyName).toBe(town.friendlyName);
  } else {
    expect(matching).toBeUndefined();
  }
}

describe('TownsServiceAPIREST', () => {
  let server: http.Server;
  let apiClient: TownsServiceClient;

  async function createTownForTesting(
    friendlyNameToUse?: string,
    isPublic = false,
  ): Promise<TestTownData> {
    const friendlyName =
      friendlyNameToUse !== undefined
        ? friendlyNameToUse
        : `${isPublic ? 'Public' : 'Private'}TestingTown=${nanoid()}`;
    const ret = await apiClient.createTown({
      friendlyName,
      isPubliclyListed: isPublic,
    });
    return {
      friendlyName,
      isPubliclyListed: isPublic,
      coveyTownID: ret.coveyTownID,
      townUpdatePassword: ret.coveyTownPassword,
    };
  }

  beforeAll(async () => {
    const app = Express();
    app.use(CORS());
    server = http.createServer(app);

    addTownRoutes(server, app);
    await server.listen();
    const address = server.address() as AddressInfo;

    apiClient = new TownsServiceClient(`http://127.0.0.1:${address.port}`);
  });
  afterAll(async () => {
    await server.close();
  });
  describe('CoveyTownCreateAPI', () => {
    it('Allows for multiple towns with the same friendlyName', async () => {
      const firstTown = await createTownForTesting();
      const secondTown = await createTownForTesting(firstTown.friendlyName);
      expect(firstTown.coveyTownID).not.toBe(secondTown.coveyTownID);
    });
    it('Prohibits a blank friendlyName', async () => {
      try {
        await createTownForTesting('');
        fail('createTown should throw an error if friendly name is empty string');
      } catch (err) {
        // OK
      }
    });
  });

  describe('CoveyTownListAPI', () => {
    it('Lists public towns, but not private towns', async () => {
      const pubTown1 = await createTownForTesting(undefined, true);
      const privTown1 = await createTownForTesting(undefined, false);
      const pubTown2 = await createTownForTesting(undefined, true);
      const privTown2 = await createTownForTesting(undefined, false);

      const towns = await apiClient.listTowns();
      expectTownListMatches(towns, pubTown1);
      expectTownListMatches(towns, pubTown2);
      expectTownListMatches(towns, privTown1);
      expectTownListMatches(towns, privTown2);
    });
    it('Allows for multiple towns with the same friendlyName', async () => {
      const pubTown1 = await createTownForTesting(undefined, true);
      const privTown1 = await createTownForTesting(pubTown1.friendlyName, false);
      const pubTown2 = await createTownForTesting(pubTown1.friendlyName, true);
      const privTown2 = await createTownForTesting(pubTown1.friendlyName, false);

      const towns = await apiClient.listTowns();
      expectTownListMatches(towns, pubTown1);
      expectTownListMatches(towns, pubTown2);
      expectTownListMatches(towns, privTown1);
      expectTownListMatches(towns, privTown2);
    });
  });

  describe('CoveyTownDeleteAPI', () => {
    it('Throws an error if the password is invalid', async () => {
      const { coveyTownID } = await createTownForTesting(undefined, true);
      try {
        await apiClient.deleteTown({
          coveyTownID,
          coveyTownPassword: nanoid(),
        });
        fail('Expected deleteTown to throw an error');
      } catch (e) {
        // Expected error
      }
    });
    it('Throws an error if the townID is invalid', async () => {
      const { townUpdatePassword } = await createTownForTesting(undefined, true);
      try {
        await apiClient.deleteTown({
          coveyTownID: nanoid(),
          coveyTownPassword: townUpdatePassword,
        });
        fail('Expected deleteTown to throw an error');
      } catch (e) {
        // Expected error
      }
    });
    it('Deletes a town if given a valid password and town, no longer allowing it to be joined or listed', async () => {
      const { coveyTownID, townUpdatePassword } = await createTownForTesting(undefined, true);
      await apiClient.deleteTown({
        coveyTownID,
        coveyTownPassword: townUpdatePassword,
      });
      try {
        await apiClient.joinTown({
          userName: nanoid(),
          coveyTownID,
        });
        fail('Expected joinTown to throw an error');
      } catch (e) {
        // Expected
      }
      const listedTowns = await apiClient.listTowns();
      if (listedTowns.towns.find(r => r.coveyTownID === coveyTownID)) {
        fail('Expected the deleted town to no longer be listed');
      }
    });
  });
  describe('CoveyTownUpdateAPI', () => {
    it('Checks the password before updating any values', async () => {
      const pubTown1 = await createTownForTesting(undefined, true);
      expectTownListMatches(await apiClient.listTowns(), pubTown1);
      try {
        await apiClient.updateTown({
          coveyTownID: pubTown1.coveyTownID,
          coveyTownPassword: `${pubTown1.townUpdatePassword}*`,
          friendlyName: 'broken',
          isPubliclyListed: false,
        });
        fail('updateTown with an invalid password should throw an error');
      } catch (err) {
        // err expected
        // TODO this should really check to make sure it's the *right* error, but we didn't specify
        // the format of the exception :(
      }

      // Make sure name or vis didn't change
      expectTownListMatches(await apiClient.listTowns(), pubTown1);
    });
    it('Updates the friendlyName and visbility as requested', async () => {
      const pubTown1 = await createTownForTesting(undefined, false);
      expectTownListMatches(await apiClient.listTowns(), pubTown1);
      await apiClient.updateTown({
        coveyTownID: pubTown1.coveyTownID,
        coveyTownPassword: pubTown1.townUpdatePassword,
        friendlyName: 'newName',
        isPubliclyListed: true,
      });
      pubTown1.friendlyName = 'newName';
      pubTown1.isPubliclyListed = true;
      expectTownListMatches(await apiClient.listTowns(), pubTown1);
    });
    it('Does not update the visibility if visibility is undefined', async () => {
      const pubTown1 = await createTownForTesting(undefined, true);
      expectTownListMatches(await apiClient.listTowns(), pubTown1);
      await apiClient.updateTown({
        coveyTownID: pubTown1.coveyTownID,
        coveyTownPassword: pubTown1.townUpdatePassword,
        friendlyName: 'newName2',
      });
      pubTown1.friendlyName = 'newName2';
      expectTownListMatches(await apiClient.listTowns(), pubTown1);
    });
  });

  describe('CoveyMemberAPI', () => {
    it('Throws an error if the town does not exist', async () => {
      await createTownForTesting(undefined, true);
      try {
        await apiClient.joinTown({
          userName: nanoid(),
          coveyTownID: nanoid(),
        });
        fail('Expected an error to be thrown by joinTown but none thrown');
      } catch (err) {
        // OK, expected an error
        // TODO this should really check to make sure it's the *right* error, but we didn't specify
        // the format of the exception :(
      }
    });
    it('Admits a user to a valid public or private town', async () => {
      const pubTown1 = await createTownForTesting(undefined, true);
      const privTown1 = await createTownForTesting(undefined, false);
      const res = await apiClient.joinTown({
        userName: nanoid(),
        coveyTownID: pubTown1.coveyTownID,
      });
      expect(res.coveySessionToken).toBeDefined();
      expect(res.coveyUserID).toBeDefined();

      const res2 = await apiClient.joinTown({
        userName: nanoid(),
        coveyTownID: privTown1.coveyTownID,
      });
      expect(res2.coveySessionToken).toBeDefined();
      expect(res2.coveyUserID).toBeDefined();
    });
  });
  describe('CoveyTownAddPlaceableAPI', () => {
    let placeableID: string;
    beforeEach(() => {
      placeableID = nanoid();
    });

    it('Throws an error if the town does not exist', async () => {
      const pubTown1 = await createTownForTesting(undefined, true);
      expectTownListMatches(await apiClient.listTowns(), pubTown1);
      try {
        await apiClient.addPlaceable({
          coveyTownPassword: pubTown1.townUpdatePassword,
          coveyTownID: nanoid(),
          placeableID,
          location: { xIndex: 0, yIndex: 0 },
        });
        fail('Expected an error to be thrown by addPlaceable when given incorrect id');
      } catch (err) {
        // OK, expected an error
        // TODO this should really check to make sure it's the *right* error, but we didn't specify
        // the format of the exception :(
      }
    });
    it('Throws an error if the password is incorrect', async () => {
      const pubTown1 = await createTownForTesting(undefined, true);
      expectTownListMatches(await apiClient.listTowns(), pubTown1);
      try {
        await apiClient.addPlaceable({
          coveyTownPassword: `${pubTown1.townUpdatePassword}*`,
          coveyTownID: pubTown1.coveyTownID,
          placeableID,
          location: { xIndex: 0, yIndex: 0 },
        });
        fail('Expected an error to be thrown by addPlaceable when given incorrect password');
      } catch (err) {
        // OK, expected an error
        // TODO this should really check to make sure it's the *right* error, but we didn't specify
        // the format of the exception :(
      }
    });
    it('Returns expected placeableInfo when succesfully added', async () => {
      const pubTown1 = await createTownForTesting(undefined, true);
      expectTownListMatches(await apiClient.listTowns(), pubTown1);
      const placedLocation = { xIndex: 0, yIndex: 0 };
      const placeable: Placeable = new Placeable(placeableID, placedLocation);
      const addResponce: PlaceableInfo = await apiClient.addPlaceable({
        coveyTownPassword: pubTown1.townUpdatePassword,
        coveyTownID: pubTown1.coveyTownID,
        placeableID,
        location: placedLocation,
      });
      const placedInfo: PlaceableInfo = {
        coveyTownID: pubTown1.coveyTownID,
        placeableID: placeable.placeableID,
        placeableName: placeable.name,
        location: placeable.location,
      };
      expect(addResponce).toStrictEqual(placedInfo);
    });
    it('Throws an error when addPlacaeable is called at a location that already has a placeable', async () => {
      const pubTown1 = await createTownForTesting(undefined, true);
      const placedLocation = { xIndex: 0, yIndex: 0 };
      expectTownListMatches(await apiClient.listTowns(), pubTown1);
      await apiClient.addPlaceable({
        coveyTownPassword: pubTown1.townUpdatePassword,
        coveyTownID: pubTown1.coveyTownID,
        placeableID,
        location: placedLocation,
      });
      try {
        await apiClient.addPlaceable({
          coveyTownPassword: pubTown1.townUpdatePassword,
          coveyTownID: pubTown1.coveyTownID,
          placeableID: `${placeableID}*`,
          location: placedLocation,
        });
        fail(
          'Expected an error to be thrown by addPlaceable when called where there was already a placeable',
        );
      } catch (err) {
        // OK, expected an error
        // TODO this should really check to make sure it's the *right* error, but we didn't specify
        // the format of the exception :(
      }
    });
    it('allows multiple placeables with the same ID at different locations', async () => {
      const pubTown1 = await createTownForTesting(undefined, true);
      expectTownListMatches(await apiClient.listTowns(), pubTown1);
      const firstPlacedLocation = { xIndex: 10, yIndex: 10 };
      const firstPlaceable: Placeable = new Placeable(placeableID, firstPlacedLocation);
      const secondPlacedLocation = { xIndex: 0, yIndex: 0 };
      const secondPlaceable: Placeable = new Placeable(placeableID, secondPlacedLocation);
      const firstAdd = await apiClient.addPlaceable({
        coveyTownPassword: pubTown1.townUpdatePassword,
        coveyTownID: pubTown1.coveyTownID,
        placeableID,
        location: firstPlacedLocation,
      });
      const firstPlacedInfo: PlaceableInfo = {
        coveyTownID: pubTown1.coveyTownID,
        placeableID: firstPlaceable.placeableID,
        placeableName: firstPlaceable.name,
        location: firstPlaceable.location,
      };
      expect(firstAdd).toStrictEqual(firstPlacedInfo);

      const secondAdd = await apiClient.addPlaceable({
        coveyTownPassword: pubTown1.townUpdatePassword,
        coveyTownID: pubTown1.coveyTownID,
        placeableID,
        location: secondPlacedLocation,
      });
      const secondPlacedInfo: PlaceableInfo = {
        coveyTownID: pubTown1.coveyTownID,
        placeableID: secondPlaceable.placeableID,
        placeableName: secondPlaceable.name,
        location: secondPlaceable.location,
      };
      expect(secondAdd).toStrictEqual(secondPlacedInfo);
      expect(firstAdd).not.toStrictEqual(secondPlacedInfo);
    });
  });
  describe('CoveyTownDeletePlaceableAPI', () => {
    let placeableID: string;
    beforeEach(() => {
      placeableID = nanoid();
    });
    it('Throws an error if the town does not exist', async () => {
      const pubTown1 = await createTownForTesting(undefined, true);
      expectTownListMatches(await apiClient.listTowns(), pubTown1);
      try {
        await apiClient.deletePlaceable({
          coveyTownPassword: pubTown1.townUpdatePassword,
          coveyTownID: nanoid(),
          location: { xIndex: 0, yIndex: 0 },
        });
        fail('Expected an error to be thrown by addPlaceable when given incorrect id');
      } catch (err) {
        // OK, expected an error
        // TODO this should really check to make sure it's the *right* error, but we didn't specify
        // the format of the exception :(
      }
    });
    it('Throws an error if the password is incorrect', async () => {
      const pubTown1 = await createTownForTesting(undefined, true);
      expectTownListMatches(await apiClient.listTowns(), pubTown1);
      const placedLocation: PlaceableLocation = { xIndex: 0, yIndex: 0 };
      await apiClient.addPlaceable({
        coveyTownPassword: pubTown1.townUpdatePassword,
        coveyTownID: pubTown1.coveyTownID,
        placeableID,
        location: placedLocation,
      });
      try {
        await apiClient.deletePlaceable({
          coveyTownPassword: `${pubTown1.townUpdatePassword}*`,
          coveyTownID: pubTown1.coveyTownID,
          location: placedLocation,
        });
        fail('Expected an error to be thrown by addPlaceable when given incorrect password');
      } catch (err) {
        // OK, expected an error
        // TODO this should really check to make sure it's the *right* error, but we didn't specify
        // the format of the exception :(
      }
    });
    it('Should return the empty placeableInfo on successful delete', async () => {
      const pubTown1 = await createTownForTesting(undefined, true);
      expectTownListMatches(await apiClient.listTowns(), pubTown1);
      const placedLocation = { xIndex: 0, yIndex: 0 };
      const placeable: Placeable = new Placeable(placeableID, placedLocation);

      const addResponce: PlaceableInfo = await apiClient.addPlaceable({
        coveyTownPassword: pubTown1.townUpdatePassword,
        coveyTownID: pubTown1.coveyTownID,
        placeableID,
        location: placedLocation,
      });
      const placedInfo: PlaceableInfo = {
        coveyTownID: pubTown1.coveyTownID,
        placeableID: placeable.placeableID,
        placeableName: placeable.name,
        location: placeable.location,
      };
      expect(addResponce).toStrictEqual(placedInfo);

      const deleteResponce: PlaceableInfo = await apiClient.deletePlaceable({
        coveyTownPassword: pubTown1.townUpdatePassword,
        coveyTownID: pubTown1.coveyTownID,
        location: placedLocation,
      });
      const deletedInfo: PlaceableInfo = {
        coveyTownID: pubTown1.coveyTownID,
        placeableID: Placeable.EMPTY_PLACEABLE_ID,
        placeableName: Placeable.EMPTY_PLACEABLE_NAME,
        location: placeable.location,
      };
      expect(deleteResponce).toStrictEqual(deletedInfo);
    });
    it('should throw an error if there is nothing to delete', async () => {
      const pubTown1 = await createTownForTesting(undefined, true);
      expectTownListMatches(await apiClient.listTowns(), pubTown1);
      try {
        await apiClient.deletePlaceable({
          coveyTownPassword: pubTown1.townUpdatePassword,
          coveyTownID: pubTown1.coveyTownID,
          location: { xIndex: 0, yIndex: 0 },
        });
        fail('Expected an error to be thrown by addPlaceable when given incorrect password');
      } catch (err) {
        // OK, expected an error
        // TODO this should really check to make sure it's the *right* error, but we didn't specify
        // the format of the exception :(
      }
    });
  });

  async function addPlaceableToTown(
    town: TestTownData,
    placedLocation: PlaceableLocation,
  ): Promise<PlaceableInfo> {
    const placeableID = nanoid();
    const placeable: Placeable = new Placeable(placeableID, placedLocation);
    await apiClient.addPlaceable({
      coveyTownPassword: town.townUpdatePassword,
      coveyTownID: town.coveyTownID,
      placeableID,
      location: placedLocation,
    });
    const placedInfo: PlaceableInfo = {
      coveyTownID: town.coveyTownID,
      placeableID: placeable.placeableID,
      placeableName: placeable.name,
      location: placeable.location,
    };

    return placedInfo;
  }
  describe('CoveyTownGetPlaceableAPI', () => {
    it('Throws an error if the town does not exist', async () => {
      try {
        await apiClient.getPlaceable({
          coveyTownID: nanoid(),
          location: { xIndex: 0, yIndex: 0 },
        });
        fail('Expected an error to be thrown by addPlaceable when given incorrect id');
      } catch (err) {
        // OK, expected an error
        // TODO this should really check to make sure it's the *right* error, but we didn't specify
        // the format of the exception :(
      }
    });
    it('should be able to get placeable info for a public town', async () => {
      const placedLocation: PlaceableLocation = { xIndex: randomInt(100), yIndex: randomInt(100) };
      const pubTown1 = await createTownForTesting(undefined, true);
      expectTownListMatches(await apiClient.listTowns(), pubTown1);
      const addedPlacableInfo = addPlaceableToTown(pubTown1, placedLocation);

      const getResponce = await apiClient.getPlaceable({
        coveyTownID: pubTown1.coveyTownID,
        location: placedLocation,
      });
      expect(getResponce).toStrictEqual(addedPlacableInfo);
    });
    it('should be able to get placeable info for a private town', async () => {
      const placedLocation: PlaceableLocation = { xIndex: randomInt(100), yIndex: randomInt(100) };
      const pubTown1 = await createTownForTesting(undefined, false);
      expectTownListMatches(await apiClient.listTowns(), pubTown1);
      const addedPlacableInfo = addPlaceableToTown(pubTown1, placedLocation);

      const getResponce = await apiClient.getPlaceable({
        coveyTownID: pubTown1.coveyTownID,
        location: placedLocation,
      });
      expect(getResponce).toStrictEqual(addedPlacableInfo);
    });
    it('should return the default placeable if nothing has been added there', async () => {
      const placedLocation: PlaceableLocation = { xIndex: randomInt(100), yIndex: randomInt(100) };
      const pubTown1 = await createTownForTesting(undefined, true);
      expectTownListMatches(await apiClient.listTowns(), pubTown1);
      const emptyPlaceableInfo: PlaceableInfo = {
        coveyTownID: pubTown1.coveyTownID,
        placeableID: Placeable.EMPTY_PLACEABLE_ID,
        placeableName: Placeable.EMPTY_PLACEABLE_NAME,
        location: placedLocation,
      };

      const getResponce = await apiClient.getPlaceable({
        coveyTownID: pubTown1.coveyTownID,
        location: placedLocation,
      });
      expect(getResponce).toStrictEqual(emptyPlaceableInfo);
    });
    it('should return the default placeable after a sucessful delete', async () => {
      const placedLocation: PlaceableLocation = { xIndex: randomInt(100), yIndex: randomInt(100) };
      const pubTown1 = await createTownForTesting(undefined, true);
      expectTownListMatches(await apiClient.listTowns(), pubTown1);
      const addedPlacableInfo = addPlaceableToTown(pubTown1, placedLocation);

      const firstGetResponce = await apiClient.getPlaceable({
        coveyTownID: pubTown1.coveyTownID,
        location: placedLocation,
      });
      expect(firstGetResponce).toStrictEqual(addedPlacableInfo);

      await apiClient.deletePlaceable({
        coveyTownID: pubTown1.coveyTownID,
        coveyTownPassword: pubTown1.townUpdatePassword,
        location: placedLocation,
      });

      const secondGetResponce = await apiClient.getPlaceable({
        coveyTownID: pubTown1.coveyTownID,
        location: placedLocation,
      });

      const emptyPlaceableInfo: PlaceableInfo = {
        coveyTownID: pubTown1.coveyTownID,
        placeableID: Placeable.EMPTY_PLACEABLE_ID,
        placeableName: Placeable.EMPTY_PLACEABLE_NAME,
        location: placedLocation,
      };

      expect(secondGetResponce).toStrictEqual(emptyPlaceableInfo);
    });
    it('should return the same thing after repeated calls with no modifiers called inbetween', async () => {
      const placedLocation: PlaceableLocation = { xIndex: randomInt(100), yIndex: randomInt(100) };
      const pubTown1 = await createTownForTesting(undefined, true);
      expectTownListMatches(await apiClient.listTowns(), pubTown1);
      const addedPlacableInfo = addPlaceableToTown(pubTown1, placedLocation);

      const firstGetResponce = await apiClient.getPlaceable({
        coveyTownID: pubTown1.coveyTownID,
        location: placedLocation,
      });
      expect(firstGetResponce).toStrictEqual(addedPlacableInfo);

      const secondGetResponce = await apiClient.getPlaceable({
        coveyTownID: pubTown1.coveyTownID,
        location: placedLocation,
      });

      expect(secondGetResponce).toStrictEqual(addedPlacableInfo);
      expect(secondGetResponce).toStrictEqual(firstGetResponce);
    });
  });
});
