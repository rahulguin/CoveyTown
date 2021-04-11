# Added Features

This addition to the Covey.Town Codebase allows users to interact with a two new features "Placeables" and "player Permissions"

## Placeables

Placeables allow players to interact with the world and players around them beyond the already implemented movement and video chat functionality of Covey.town. Allowing users to now place objects onto that map that can either be interactable or non-interactable.
interactable placeables provide users with some additional function such as allowing them to play tic-tac-toe.

### Adding placeables

To add placeables to your town

1. cick on your user in the town
2. select which of the placeables you would like to add
3. the placeable will automatically get added next to you

### Deleting placeabels

### Current placeables

|  Placeable  |                                  Icon                                  | number of players | Blocks path | Placeable ID |
| :---------: | :--------------------------------------------------------------------: | :---------------: | :---------: | :----------: |
|    Tree     |   <img src="frontend/public/assets/placeables/tree.png" width="32">    | non interactable  |    true     |     tree     |
|   Flowers   |  <img src="frontend/public/assets/placeables/flowers.png" width="32">  | non interactable  |    false    |   flowers    |
|   speaker   |  <img src="frontend/public/assets/placeables/speaker.png" width="32">  | non interactable  |    true     |   speaker    |
| Chess board |   <img src="frontend/public/assets/placeables/chess.png" width="32">   |         1         |    true     |    chess     |
| tic-tac-toe | <img src="frontend/public/assets/placeables/tictactoe.png" width="32"> |         1         |    true     |  tictactoe   |

### How to interact with placables

To interact with a placeable

1. make sure that you can see the placeable on screen and that it is interactable (see Current placeable number of player column to determine if a placeable is interactable)
2. click on the placeable you would like to interact
3. a pop up should appear on your screen and you are now ready to go
4. when you want to stop interacting for any reason you can hit the X in the top right corner to return back to the map

## Players Permissions

In order to prevent other user from running amock in your town and planting forests everywhere, users who know the town update password can pick and choose who are able to add placeables through the player permissions functionality. By default all players including the creater of the town do not have permission to create things and so will be unable to add placeables unless the know the password. If you would like to make it so someone in the room can modify placeables but don't what to give them the password to the town then assigning them permission would all for this.

### Giving and removing player permissions

To give or remove player permissions.

1. click on the permissions button that is part of the bar in the bottom right
2. type in the town update password in the provided space
3. find the player(s) you want to change the permission of in the list of players
4. modify the check box next to their name and id (checked means they have permission, unchecked means they do not have permission)
5. hit submit
   if at any point you do not want to modify anyone's permission you can hit the cancel button to close the popup.
