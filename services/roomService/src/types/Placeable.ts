import { nanoid } from 'nanoid';
import { PlaceableLocation, UserLocation } from '../CoveyTypes';


export default class Placeable {
    private readonly _placeableID: string;
    private _location: PlaceableLocation
    static readonly EMPTY_PLACEABLE_ID: string = 'empty';
    static readonly EMPTY_PLACEABLE_NAME: string = 'empty space';

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

    get EMPTY_PLACEABLE_ID(): string {
        return this.EMPTY_PLACEABLE_ID
    }

    get EMPTY_PLACEABLE_NAME(): string {
        return this.EMPTY_PLACEABLE_ID
    }


}