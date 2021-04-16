# changes to back end

In order to support both our Placeables and Permisions features we made many changes and addition to the backend code.

## towns

Added a list of placeables to the townController to allow each town to have a reference to all the placeables that have been created in it.
It represents the definitive list of all placeables that a room has.
Placeables are current assumed to be unique based on position (since they are currently both stationary and no two placeables can occupy the same location)
and so reference to specific placeables are found from their location.
This feature could be changed by assigning placeables all a unique ID to allow for potential future advancement

## Placeables class

We created a placeable class that represents a placeable object in the town.
This class currently stores information that the placeable needs to know
placeableID, name, townID, InputInformation, and location
and has defined constants of how to represent the empty Placeable (what is assumed to be in every tile there is currently nothing)

this class was designed in a way to be easily extendable both in functionality and fields, ....

## players

in order to support permissions players now have an added field 'canPlace' that is used to store if a specific player canPlace or delete placeables.
We hope this design of making permissions part of the players themselves will make it easy to both track and extend
track: once a programmer has a reference to the player on the backend they will already have a reference to all of those players permissions
extend off of: such as wanting a permission to updateTown could be added as well.

# api Methods

## addPlaceable

path: POST /placeables/:townID
data: placeableID, location, inputInformation, townPassword, playerSessionToken
adds the placeable (created form the provided information) to the town with the given townID. Is only sucessful if either the player provides the correct password associated with that town or provides a sessionToken that references a player that has permissions to add placeables in that town.
will return a fail status if there is already a placeable in the town at the provided location

## deletePlaceable

path: DELETE /placeables/:townID
data: location, townPassword, playerSessionToken
adds the placeable from the provided location with in the the town associated with thegiven townID. Is only sucessful if either the player provides the correct password associated with that town or provides a sessionToken that references a player that has permissions to add placeables in that town.
will return a fail status if there is nothing to delete in the town at the provided location

## getPlaceable

path: GET /placeables/:townID
data: location
get the information of the placeable in the town associated with the provided id at the given location.
If there is no placeable at the provided location it will return the information assocaited with the empty placable at that location

## getPlayersPermission

path: GET /towns/:townID/permissions/:playerID
gets if the provided player (from playerID) in the provided town (from townID) has permissions to add/delete Placables.
Will return a fail status if there the there is no town or associated with the given townID or playerID respectively.

## updatePlayerPermissions

path: POST /towns/:townID/permissions
data: list of tuples of playerIDs and booleans, townPassword
updates if all players provides have the permission to add/delete placeables, if their id is provided with a false they will not have permission and if provided with true they will have permission.
will return a fail status and not update any values if:

- There is no town associated with the provided id
- The password provided does not match the update password of the town
- A players ID is duplicated in the list
- The list contains a players ID that does not exist in the town

# Sockets

two sockets emits have been created for placeables that are both sent from the server to all players.

## placeableAdded

a socket connection sent from the sever to every player when a placeable has successfully been added - including the player that made the request to add.
contains the information of the placeable that was just added so players can add them

## placeableDeleted

a socket connection sent from the sever to every player when a placeable has successfully been deleted - including the player that made the request to add.
contains the information of where the placeable was deleted from so players can remove the placeable they have at that location

# changes to front end

## coveyAppState

## WorldMap

## PermisionsButton

## Placeable Images

## Placable Components

# UI Changes
