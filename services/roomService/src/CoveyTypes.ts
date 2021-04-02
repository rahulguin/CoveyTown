export type Direction = 'front' | 'back' | 'left' | 'right';
export type UserLocation = {
  x: number;
  y: number;
  rotation: Direction;
  moving: boolean;
};
export type CoveyTownList = { friendlyName: string; coveyTownID: string; currentOccupancy: number; maximumOccupancy: number; placeableArray: placeableArray }[];

export type PlaceableLocation = { xIndex: number, yIndex: number };

export type PlaceableSpecification = { placeableID: string, placeableLocation: PlaceableLocation };

