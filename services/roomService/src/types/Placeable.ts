/* eslint-disable @typescript-eslint/indent */
import { PlaceableLocation } from '../CoveyTypes';

export default class Placeable {
  private readonly _placeableID: string;

  private _location: PlaceableLocation;

  private readonly _name: string;

  private _placeableInformation?: {
    bannerText?: string
  };

  static readonly EMPTY_PLACEABLE_ID: string = 'empty';

  static readonly EMPTY_PLACEABLE_NAME: string = 'empty space';

  static initializeSet(): Set<string> {
    return new Set<string>().add('speaker').add('tree').add('tictactoe').add('flappy').add('banner').add('youtube');
  }

  static readonly ALLOWED_PLACEABLES: Set<string> = Placeable.initializeSet();

  constructor(placeableID: string, location: PlaceableLocation, placeableInformation?: { bannerText?: string }, _name = 'dummy name') {
    this._placeableID = placeableID;
    this._location = location;
    this._name = _name;
    this._placeableInformation = placeableInformation;
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

  get placeableInformation(): { bannerText?: string } | undefined {
    return this._placeableInformation;
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
    return this.ALLOWED_PLACEABLES.has(placeableID);
  }

  static constructEmptyPlaceable(location: PlaceableLocation): Placeable {
    return new Placeable(this.EMPTY_PLACEABLE_ID, location, {}, this.EMPTY_PLACEABLE_NAME);
  }
}
