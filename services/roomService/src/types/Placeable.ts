import { nanoid } from 'nanoid';
import { PlaceableLocation, UserLocation } from '../CoveyTypes';


export default class Placeable {
    private readonly _placeableID: string;
    private _location: PlaceableLocation

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

    get placeable(): string {
        return this._placeableID 
    }


}