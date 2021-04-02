export type Direction = 'front' | 'back' | 'left' | 'right';
export type UserLocation = {
  x: number;
  y: number;
  rotation: Direction;
  moving: boolean;
};
export type CoveyTownList = {
  friendlyName: string;
  coveyTownID: string;
  currentOccupancy: number;
  maximumOccupancy: number;
}[];

export type PlaceableLocation = { xIndex: number; yIndex: number };

export type PlaceableSpecification = { placeableID: string; placeableLocation: PlaceableLocation };

export interface PlaceableInfo {
  coveyTownID: string;
  placeableID: string;
  placeableName: string;
  location: PlaceableLocation;
}
