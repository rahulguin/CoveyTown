import { nanoid } from 'nanoid';
import { PlaceableLocation, UserLocation } from '../CoveyTypes';


export default class Placeable {
    private readonly _placeableID: string;
    private _location: PlaceableLocation
    static readonly EMPTY_TILE_ID: string = 'empty';
    static readonly EMPTY_TILE_NAME: string = 'empty space';

    constructor (placeableID: string, location: PlaceableLocation) {
        this._placeableID = placeableID
        this._location = location
    }

    get location(): PlaceableLocation {
        return this._location 
    }

    set location(newLocation: PlaceableLocation){
        this._location = newLocation
    }

    get placeableID(): string {
        return this._placeableID 
    }

    get EMPTY_TILE_ID(): string {
        return this.EMPTY_TILE_ID
    }

    get EMPTY_TILE_NAME(): string {
        return this.EMPTY_TILE_ID
    }


}