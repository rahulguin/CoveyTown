# Added Features

This addition to the Covey.Town Codebase allows users to interact with a two new features "Placeables" and "player Permissions"

## Placeables

Placeables allow players to interact with the world and players around them beyond the already implemented movement and video chat functionality of Covey.town. Allowing users to now place objects onto that map that can either be interactable or non-interactable.
interactable placeables provide users with some additional function such as allowing them to play tic-tac-toe.

### Adding placeables

To add placeables to your town

1. make sure that you have permission to perform this actions (if you do not see [giving a removing player permissions](#giving-and-removing-player-positions))
2. cick on your user in the town
3. select which of the placeables you would like to add
4. the placeable will automatically get added next to you

### Deleting placeabels

To Delete a placeable from your town

1. make sure the placeable you want to delete is in view on your screen
2. make sure that you have permission to perform this actions (if you do not see [giving a removing player permissions](#giving-and-removing-player-positions))
3. right click on the placeable you would like to delete
4. then hit delete

### Current placeables

|  Placeable  |                                  Icon                                  | number of players | Blocks path | Placeable ID |
| :---------: | :--------------------------------------------------------------------: | :---------------: | :---------: | :----------: |
|    Tree     | <img src="frontend/public/assets/placeable/treeSprite.png" width="32"> | non interactable  |    true     |     tree     |
|   Flowers   |  <img src="frontend/public/assets/placeable/flowers.png" width="32">   | non interactable  |    false    |   flowers    |
|   banner    |   <img src="frontend/public/assets/placeable/banner.png" width="32">   |     infinite      |    true     |    banner    |
| Chess board |   <img src="frontend/public/assets/placeable/chess.png" width="32">    |         1         |    true     |    chess     |
| tic-tac-toe | <img src="frontend/public/assets/placeable/tictactoe.png" width="32">  |         1         |    true     |  tictactoe   |
| Flappy Bird | <img src="frontend/public/assets/placeable/FlappyBird.png" width="32"> |         1         |    true     |    flappy    |

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
