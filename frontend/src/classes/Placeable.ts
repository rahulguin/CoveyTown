


export default class Placeable {

    private readonly _placeableID: string;
    private _location: PlaceableLocation
    private readonly _name: string

    public sprite?: Phaser.GameObjects.Sprite;

    public label?: Phaser.GameObjects.Text;

    constructor (townID: string, placeableID: string, placeableName: string, location: PlaceableLocation) {
        this._placeableID = placeableID
        this._location = location
        this._name = placeableName
    }

    static fromServerPlaceable(serverPlaceable: ServerPlaceable): Placeable {
        return new Placeable(serverPlaceable._townId, serverPlaceable._placeableID, serverPlaceable._placeableName, serverPlaceable.location)
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

    get name(): string {
        return this._name
    }


}

export type PlaceableLocation = { xIndex: number, yIndex: number }

export type ServerPlaceable = { _townId: string, _placeableID: string, _placeableName: string, location: PlaceableLocation }