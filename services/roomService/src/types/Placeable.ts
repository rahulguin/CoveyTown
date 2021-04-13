/* eslint-disable @typescript-eslint/indent */
import { PlaceableLocation } from '../CoveyTypes';

export default class Placeable {
  private readonly _placeableID: string;

  private _location: PlaceableLocation;

  private readonly _name: string;

  private _objectInformation: Map<string, string> | undefined;

  static readonly EMPTY_PLACEABLE_ID: string = 'empty';

  static readonly EMPTY_PLACEABLE_NAME: string = 'empty space';

  static initializeSet(): Set<string> {
    return new Set<string>().add('speaker').add('box').add('banner');
  }

  static readonly ALLOWED_PLACEABLES: Set<string> = Placeable.initializeSet();

  constructor(placeableID: string, location: PlaceableLocation, objectInformation?: Map<string, string>, _name = 'dummy name') {
    this._placeableID = placeableID;
    this._location = location;
    this._name = _name;
    this._objectInformation = objectInformation
  }

  get location(): PlaceableLocation {
    return this._location;
  }

  set location(newLocation: PlaceableLocation) {
    this._location = newLocation;
  }

  get placeableID(): string {
    return this._placeableID;
  }

  get EMPTY_PLACEABLE_ID(): string {
    return this.EMPTY_PLACEABLE_ID;
  }

  get EMPTY_PLACEABLE_NAME(): string {
    return this.EMPTY_PLACEABLE_ID;
  }

  get name(): string {
    return this._name;
  }

  static isAllowedPlaceable(placeableID: string): boolean {

     this.ALLOWED_PLACEABLES.add('tree');
     this.ALLOWED_PLACEABLES.add('tictactoe');
    this.ALLOWED_PLACEABLES.add('flappy');
     return this.ALLOWED_PLACEABLES.has(placeableID);
  }

  static constructEmptyPlaceable(location: PlaceableLocation): Placeable {
    return new Placeable(this.EMPTY_PLACEABLE_ID, location, new Map(), this.EMPTY_PLACEABLE_NAME);
  }
}
