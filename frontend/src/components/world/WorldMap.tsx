import React, { useEffect, useState, Fragment } from 'react';
import ReactDOM from 'react-dom';
import Phaser from 'phaser';
import Player, { UserLocation } from '../../classes/Player';
import Video from '../../classes/Video/Video';
import { TicTacToe } from '../Placeables/TicTacToe';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import Placeable from '../../classes/Placeable';
import TownsServiceClient from '../../classes/TownsServiceClient';
import { FlappyBird } from '../Placeables/FlappyBird';
// import { Constraint } from 'matter';


// https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6
class CoveyGameScene extends Phaser.Scene {
  private player?: {
    sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, label: Phaser.GameObjects.Text
  };

  private id?: string;

  private townId;

  private apiClient: TownsServiceClient;

  private players: Player[] = [];

  private cursors: Phaser.Types.Input.Keyboard.CursorKeys[] = [];

  /*
   * A "captured" key doesn't send events to the browser - they are trapped by Phaser
   * When pausing the game, we uncapture all keys, and when resuming, we re-capture them.
   * This is the list of keys that are currently captured by Phaser.
   */
  private previouslyCapturedKeys: number[] = [];

  private lastLocation?: UserLocation;

  private ready = false;

  private paused = false;

  private playerID?: string;

  private video: Video;

  private emitMovement: (loc: UserLocation) => void;

  // newly added

  private placeable?: {
    sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  };

  private placeables: Placeable[] = [];

  constructor(video: Video, emitMovement: (loc: UserLocation) => void, apiClient: TownsServiceClient, townId: string, playerID: string) {
    super('PlayGame');
    this.video = video;
    this.emitMovement = emitMovement;
    this.apiClient = apiClient;
    this.townId = townId;
    this.playerID = playerID;
  }

  preload() {
    // this.load.image("logo", logoImg);
    this.load.image('tiles', '/assets/tilesets/tuxmon-sample-32px-extruded.png');
    this.load.image('box', '/assets/placeable/treeObject.png');
    this.load.image('tictactoe', '/assets/placeable/tictactoe.png');
    this.load.image('flappy', '/assets/placeable/FlappyBird.png');
    this.load.tilemapTiledJSON('map', '/assets/tilemaps/tuxemon-town.json');
    this.load.atlas('atlas', '/assets/atlas/atlas.png', '/assets/atlas/atlas.json');
    this.load.atlas('placeables', '/assets/placeables/placeable.png', '/assets/placeables/placeable.json');
  }


  initialise(apiClient: TownsServiceClient, townId: string) {

    this.apiClient = apiClient;
    this.townId = townId;
  }

  updatePlayersLocations(players: Player[]) {
    if (!this.ready) {
      this.players = players;
      return;
    }
    players.forEach((p) => {
      this.updatePlayerLocation(p);
    });
    // Remove disconnected players from board
    const disconnectedPlayers = this.players.filter(
      (player) => !players.find((p) => p.id === player.id),
    );
    disconnectedPlayers.forEach((disconnectedPlayer) => {
      if (disconnectedPlayer.sprite) {
        disconnectedPlayer.sprite.destroy();
        disconnectedPlayer.label?.destroy();
      }
    });
    // Remove disconnected players from list
    if (disconnectedPlayers.length) {
      this.players = this.players.filter(
        (player) => !disconnectedPlayers.find(
          (p) => p.id === player.id,
        ),
      );
    }
  }

  updatePlayerLocation(player: Player) {
    let myPlayer = this.players.find((p) => p.id === player.id);
    if (!myPlayer) {
      let { location } = player;
      if (!location) {
        location = {
          rotation: 'back',
          moving: false,
          x: 0,
          y: 0,
        };
      }
      myPlayer = new Player(player.id, player.userName, location);
      this.players.push(myPlayer);
    }
    // eslint-disable-next-line
    console.log('this.id and myPlayer.id values: ', this.id, myPlayer.id);
    if (this.id !== myPlayer.id && this.physics && player.location) {
      let { sprite } = myPlayer;
      if (!sprite) {
        sprite = this.physics.add
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - JB todo
          .sprite(0, 0, 'atlas', 'misa-front')
          .setSize(30, 40)
          .setOffset(0, 24);
        const label = this.add.text(0, 0, myPlayer.userName, {
          font: '18px monospace',
          color: '#000000',
          backgroundColor: '#ffffff',
        });
        myPlayer.label = label;
        myPlayer.sprite = sprite;
      }
      if (!sprite.anims) return;
      sprite.setX(player.location.x);
      sprite.setY(player.location.y);
      myPlayer.label?.setX(player.location.x);
      myPlayer.label?.setY(player.location.y - 20);
      if (player.location.moving) {
        sprite.anims.play(`misa-${player.location.rotation}-walk`, true);
      } else {
        sprite.anims.stop();
        sprite.setTexture('atlas', `misa-${player.location.rotation}`);
      }
    }
  }


  updatePlaceables(placeables: Placeable[]) {

    // eslint-disable-next-line
    console.log('placeable number ', placeables.length);

    if (!this.ready) {
      this.placeables = placeables;
      return;
    }
    placeables.forEach((p) => {
      this.updatePlaceable(p);
    });
    // Remove deleted placeables from board
    const deletedPlaceables = this.placeables.filter(
      (object) => !placeables.find((p) => Placeable.compareLocation(p.location, object.location)),
    );
    deletedPlaceables.forEach((deletedPlaceable) => {
      if (deletedPlaceable.sprite) {
        deletedPlaceable.sprite.destroy();
        deletedPlaceable.label?.destroy();
      }
    });
    // Remove deleted placeables from list
    if (deletedPlaceables.length) {
      this.placeables = this.placeables.filter(
        (object) => !deletedPlaceables.find(
          (p) => Placeable.compareLocation(p.location, object.location),
        ),
      );
    }
  }



  updatePlaceable(placeable: Placeable) {

    let myPlaceable: Placeable | undefined = this.placeables.find((p) => Placeable.compareLocation(p.location, placeable.location));
    if (!myPlaceable) {
      let { location } = placeable;
      if (!location) {
        location = {
          xIndex: 0,
          yIndex: 0,
        };
      }
      myPlaceable = new Placeable(placeable.placeableID, placeable.name, placeable.location);
      this.placeables.push(myPlaceable);
    }
    if (this.id !== myPlaceable.placeableID && this.physics && placeable.location && myPlaceable.placeableID === 'tree') {
      let { sprite } = myPlaceable;
      if (!sprite) {
        sprite = this.physics.add.sprite(myPlaceable.location.xIndex, myPlaceable.location.yIndex, 'box')
          .setScale(0.2)
          .setSize(32, 32)
          .setOffset(0, 24)
          .setDisplaySize(50,50)
          .setImmovable(true)
          .setInteractive();
        myPlaceable.sprite = sprite;

      }
    }
    else if (this.id !== myPlaceable.placeableID && this.physics && placeable.location && myPlaceable.placeableID === 'tictactoe') {
      let { sprite } = myPlaceable;
      if (!sprite) {
        sprite = this.physics.add
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - JB todo
          .sprite(myPlaceable.location.xIndex, myPlaceable.location.yIndex, 'tictactoe')
          .setScale(0.2)
          .setSize(32, 32)
          .setOffset(0, 24)
          .setDisplaySize(50,50)
          .setImmovable(true)
          .setInteractive();
        myPlaceable.sprite = sprite;
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      myPlaceable.sprite.on('pointerdown', () => {
        const isShown = true;
        const toggle = () => {
          ReactDOM.unmountComponentAtNode(document.getElementById('modal-container') as Element)
        };
        ReactDOM.render(<TicTacToe isShown={isShown} hide={toggle} modalContent='game' headerText='TicTacToe'/>, document.getElementById('modal-container'))
      });
    }

    else if (this.id !== myPlaceable.placeableID && this.physics && placeable.location && myPlaceable.placeableID === 'flappy') {
      let { sprite } = myPlaceable;
      if (!sprite) {
        sprite = this.physics.add
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - JB todo
          .sprite(myPlaceable.location.xIndex, myPlaceable.location.yIndex, 'flappy')
          .setScale(0.2)
          .setSize(32, 32)
          .setOffset(0, 24)
          .setDisplaySize(40,40)
          .setImmovable(true)
          .setInteractive();
        myPlaceable.sprite = sprite;
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      myPlaceable.sprite.on('pointerdown', () => {
        const isShown = true;
        const toggle = () => {
          ReactDOM.unmountComponentAtNode(document.getElementById('modal-container') as Element)
        };
        ReactDOM.render(<FlappyBird isShown={isShown} hide={toggle} modalContent='game' headerText='TicTacToe'/>, document.getElementById('modal-container'))
      });
    }
  }

  getNewMovementDirection() {
    if (this.cursors.find(keySet => keySet.left?.isDown)) {
      return 'left';
    }
    if (this.cursors.find(keySet => keySet.right?.isDown)) {
      return 'right';
    }
    if (this.cursors.find(keySet => keySet.down?.isDown)) {
      return 'front';
    }
    if (this.cursors.find(keySet => keySet.up?.isDown)) {
      return 'back';
    }
    return undefined;
  }

  update() {
    if (this.paused) {
      return;
    }
    if (this.player && this.cursors) {
      const speed = 175;
      const prevVelocity = this.player.sprite.body.velocity.clone();
      const body = this.player.sprite.body as Phaser.Physics.Arcade.Body;

      // Stop any previous movement from the last frame
      body.setVelocity(0);

      const primaryDirection = this.getNewMovementDirection();
      switch (primaryDirection) {
        case 'left':
          body.setVelocityX(-speed);
          this.player.sprite.anims.play('misa-left-walk', true);
          break;
        case 'right':
          body.setVelocityX(speed);
          this.player.sprite.anims.play('misa-right-walk', true);
          break;
        case 'front':
          body.setVelocityY(speed);
          this.player.sprite.anims.play('misa-front-walk', true);
          break;
        case 'back':
          body.setVelocityY(-speed);
          this.player.sprite.anims.play('misa-back-walk', true);
          break;
        default:
          // Not moving
          this.player.sprite.anims.stop();
          // If we were moving, pick and idle frame to use
          if (prevVelocity.x < 0) {
            this.player.sprite.setTexture('atlas', 'misa-left');
          } else if (prevVelocity.x > 0) {
            this.player.sprite.setTexture('atlas', 'misa-right');
          } else if (prevVelocity.y < 0) {
            this.player.sprite.setTexture('atlas', 'misa-back');
          } else if (prevVelocity.y > 0) this.player.sprite.setTexture('atlas', 'misa-front');
          break;
      }

      if ((this.cursors.find(keySet => keySet.space?.isDown))) {
        this.player.sprite.setVelocityY(-350);
        this.player.sprite.play('jump', true);
      }

      // Normalize and scale the velocity so that player can't move faster along a diagonal
      this.player.sprite.body.velocity.normalize()
        .scale(speed);

      const isMoving = primaryDirection !== undefined;
      this.player.label.setX(body.x);
      this.player.label.setY(body.y - 20);
      if (!this.lastLocation
        || this.lastLocation.x !== body.x
        || this.lastLocation.y !== body.y
        || (isMoving && this.lastLocation.rotation !== primaryDirection)
        || this.lastLocation.moving !== isMoving) {
        if (!this.lastLocation) {
          this.lastLocation = {
            x: body.x,
            y: body.y,
            rotation: primaryDirection || 'front',
            moving: isMoving,
          };
        }
        this.lastLocation.x = body.x;
        this.lastLocation.y = body.y;
        this.lastLocation.rotation = primaryDirection || 'front';
        this.lastLocation.moving = isMoving;
        this.emitMovement(this.lastLocation);
      }
    }
  }

// This method is where addPlaceable method is called using the apiClient.On clicking the
// yes button, apiClient calls the addPlaceable method in the TownServiceClient.ts file

  placeableAddition(sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) {

    let boxSprite;

    sprite.on('pointerdown', () => {

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const buttonText = this.add.text(this.lastLocation.x-140, this.lastLocation.y, "Which interactive object \nwould you like to create here?", {
        color: '#FFFFFF',
        // backgroundColor: '#F0000',
        backgroundColor: '#003300',
        padding: {
          x: 10,
          y: 7
        },
        align: 'center',
        // strokeThickness: 3,
        // stroke: '#FFFFFF',
        shadow: {
          offsetX: 5,
          offsetY: 5,
          color: 'red',
          blur: 5
        }
      });

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const boxButton = this.add.text(this.lastLocation.x-140, this.lastLocation.y + 43, 'Tree',
        {
          color: '#FFFFFF',
          backgroundColor: '#004d00',
          align: 'center',
          padding: {
            x: 10,
            y: 7
          },
          fixedWidth: 309,
        }
      );
      boxButton.setInteractive();
      boxButton.on('pointerover', () => {
        boxButton.setBackgroundColor('#008000')
      })
      boxButton.on('pointerout', () => {
        boxButton.setBackgroundColor('#004d00')
      })

       // eslint-disable-next-line @typescript-eslint/no-use-before-define
      boxButton.on('pointerdown', async () => {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        destroyText();
        // const {x}  = this.game.input.mousePointer;
        const x  = this.lastLocation?.x
        // eslint-disable-next-line
        console.log('x value: ', x);
        // const {y}  = this.game.input.mousePointer;
        const y  = this.lastLocation?.y
        // eslint-disable-next-line
        console.log('y value: ', y);

        // location values are hardcoded in the  method call for now.
        // await this.apiClient.addPlaceable({coveyTownID: this.townId, coveyTownPassword: 'bn35hyo0bF-c3aEysO5uJ936',placeableID: 'chess',location: { xIndex: x -50 , yIndex: y +450 }});
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await this.apiClient.addPlaceable({coveyTownID: this.townId, playerID: this.playerID, coveyTownPassword: 'bn35hyo0bF-c3aEysO5uJ936',placeableID: 'tree',location: { xIndex: x  + 50 , yIndex: y + 50}});

      });

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const ticTacButton = this.add.text(this.lastLocation.x-140, this.lastLocation.y + 70, 'Tic Tac Toe',
        {
          color: '#FFFFFF',
          backgroundColor: '#004d00',
          align: 'center',
          padding: {
            x: 10,
            y: 7
          },
          fixedWidth: 309,
        }
      );
      ticTacButton.setInteractive();

      ticTacButton.on('pointerover', () => {
        ticTacButton.setBackgroundColor('#008000')
      })
      ticTacButton.on('pointerout', () => {
        ticTacButton.setBackgroundColor('#004d00')
      })
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      ticTacButton.on('pointerdown', async () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        destroyText();
        // const {x}  = this.game.input.mousePointer;
        const x  = this.lastLocation?.x
        // eslint-disable-next-line
        console.log('x value: ', x);
        // const {y}  = this.game.input.mousePointer;
        const y  = this.lastLocation?.y
        // eslint-disable-next-line
        console.log('y value: ', y);

        // location values are hardcoded in the  method call for now.
        // await this.apiClient.addPlaceable({coveyTownID: this.townId, coveyTownPassword: 'bn35hyo0bF-c3aEysO5uJ936',placeableID: 'chess',location: { xIndex: x -50 , yIndex: y +450 }});
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await this.apiClient.addPlaceable({coveyTownID: this.townId, playerID: this.playerID, coveyTownPassword: 'bn35hyo0bF-c3aEysO5uJ936',placeableID: 'tictactoe',location: { xIndex: x  + 50 , yIndex: y + 50 }});
        // tictac.location
      });

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const flappyButton = this.add.text(this.lastLocation.x-140, this.lastLocation.y + 95, 'Flappy Bird',
        {
          color: '#FFFFFF',
          backgroundColor: '#004d00',
          align: 'center',
          padding: {
            x: 10,
            y: 7
          },
          fixedWidth: 309,
        }
      );
      flappyButton.setInteractive();

      flappyButton.on('pointerover', () => {
        flappyButton.setBackgroundColor('#008000')
      })
      flappyButton.on('pointerout', () => {
        flappyButton.setBackgroundColor('#004d00')
      })
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      flappyButton.on('pointerdown', async () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        destroyText();
        // const {x}  = this.game.input.mousePointer;
        const x  = this.lastLocation?.x
        // eslint-disable-next-line
        console.log('x value: ', x);
        // const {y}  = this.game.input.mousePointer;
        const y  = this.lastLocation?.y
        // eslint-disable-next-line
        console.log('y value: ', y);

        // location values are hardcoded in the  method call for now.
        // await this.apiClient.addPlaceable({coveyTownID: this.townId, coveyTownPassword: 'bn35hyo0bF-c3aEysO5uJ936',placeableID: 'chess',location: { xIndex: x -50 , yIndex: y +450 }});
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await this.apiClient.addPlaceable({coveyTownID: this.townId, playerID: this.playerID, coveyTownPassword: 'bn35hyo0bF-c3aEysO5uJ936',placeableID: 'flappy',location: { xIndex: x  + 50 , yIndex: y + 50 }});
        // Flappy.location
      });

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const bannerButton = this.add.text(this.lastLocation.x-140, this.lastLocation.y + 120, 'Banner',
        {
          color: '#FFFFFF',
          backgroundColor: '#004d00',
          align: 'center',
          padding: {
            x: 10,
            y: 7
          },
          fixedWidth: 309,
        }
      );
      bannerButton.setInteractive();
      bannerButton.on('pointerover', () => {
        bannerButton.setBackgroundColor('#008000')
      })
      bannerButton.on('pointerout', () => {
        bannerButton.setBackgroundColor('#004d00')
      })

       // eslint-disable-next-line @typescript-eslint/no-use-before-define
       bannerButton.on('pointerdown', async () => {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        destroyText();
        const x  = this.lastLocation?.x
        // eslint-disable-next-line
        console.log('x value: ', x);
        const y  = this.lastLocation?.y
        // eslint-disable-next-line
        console.log('y value: ', y);

        
        // this.add.dom(x, y, 'div', 'background-color: lime; width: 220px; height: 100px; font: 48px Arial', 'Phaser');
        const form = `<input type="text" placeholder="Enter Banner Text" style="width: 309px; text-align: center; background-color: #008000; color: #ffffff; padding: 7px 10px 7px 10px; "> `;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const inputBannerText = this.add.dom(x, y).createFromHTML(form);
        inputBannerText.setInteractive();
        const submit = `<input type="button" value="Submit" style="width: 309px; text-align: center; background-color: #004d00; color: #ffffff" /> `;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const submitBannerText = this.add.dom(x, y+25).createFromHTML(submit);
        submitBannerText.setInteractive();
        const cancel = `<input type="button" value="Cancel" style="width: 309px; text-align: center; background-color: #004d00; color: #ffffff" /> `;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const cancelBannerText = this.add.dom(x, y+25).createFromHTML(cancel);
        cancelBannerText.setInteractive();
        cancelBannerText.addListener('click');
        cancelBannerText.on('click', {
          destroyText()
        });

        // location values are hardcoded in the  method call for now.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // await this.apiClient.addPlaceable({coveyTownID: this.townId, playerID: this.playerID, coveyTownPassword: 'bn35hyo0bF-c3aEysO5uJ936',placeableID: 'banner',location: { xIndex: x  + 50 , yIndex: y + 50}});

      });

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore

      const cancelButton = this.add.text(this.lastLocation.x-140, this.lastLocation.y + 145, 'Cancel',{
        color: '#FFFFFF',
        backgroundColor: '#004d00',
        align: 'center',
        padding: {
          x: 10,
          y: 7
        },
        fixedWidth: 309,
      });
      cancelButton.setInteractive();

      cancelButton.on('pointerover', () => {
        cancelButton.setBackgroundColor('#008000')
      })
      cancelButton.on('pointerout', () => {
        cancelButton.setBackgroundColor('#004d00')
      })
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      cancelButton.on('pointerdown', () => {destroyText()});

      function destroyText() {
        ticTacButton.destroy();
        cancelButton.destroy();
        buttonText.destroy();
        flappyButton.destroy();
        boxButton.destroy();
        bannerButton.destroy();
      }
      // this.pause();
    });
  }

  create() {
    const map = this.make.tilemap({ key: 'map' });

    /* Parameters are the name you gave the tileset in Tiled and then the key of the
     tileset image in Phaser's cache (i.e. the name you used in preload)
     */
    const tileset = map.addTilesetImage('tuxmon-sample-32px-extruded', 'tiles');

    // Parameters: layer name (or index) from Tiled, tileset, x, y
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const belowLayer = map.createLayer('Below Player', tileset, 0, 0);
    const worldLayer = map.createLayer('World', tileset, 0, 0);
    worldLayer.setCollisionByProperty({ collides: true });
    const aboveLayer = map.createLayer('Above Player', tileset, 0, 0);
    /* By default, everything gets depth sorted on the screen in the order we created things.
     Here, we want the "Above Player" layer to sit on top of the player, so we explicitly give
     it a depth. Higher depths will sit on top of lower depth objects.
     */
    aboveLayer.setDepth(10);

    // Object layers in Tiled let you embed extra info into a map - like a spawn point or custom
    // collision shapes. In the tmx file, there's an object layer with a point named "Spawn Point"
    const spawnPoint = map.findObject('Objects',
      (obj) => obj.name === 'Spawn Point') as unknown as
      Phaser.GameObjects.Components.Transform;


    // Find all of the transporters, add them to the physics engine
    const transporters = map.createFromObjects('Objects',
      { name: 'transporter' })
    this.physics.world.enable(transporters);

    // For each of the transporters (rectangle objects), we need to tweak their location on the scene
    // for reasons that are not obvious to me, but this seems to work. We also set them to be invisible
    // but for debugging, you can comment out that line.
    transporters.forEach(transporter => {
        const sprite = transporter as Phaser.GameObjects.Sprite;
        sprite.y += 2 * sprite.height; // Phaser and Tiled seem to disagree on which corner is y
        sprite.setVisible(false); // Comment this out to see the transporter rectangles drawn on
        // the map

      }
    );

    const labels = map.filterObjects('Objects',(obj)=>obj.name==='label');
    labels.forEach(label => {
      if(label.x && label.y){
        this.add.text(label.x, label.y, label.text.text, {
          color: '#FFFFFF',
          backgroundColor: '#000000',
        })
      }
    });



    const cursorKeys = this.input.keyboard.createCursorKeys();
    this.cursors.push(cursorKeys);
    this.cursors.push(this.input.keyboard.addKeys({
      'up': Phaser.Input.Keyboard.KeyCodes.W,
      'down': Phaser.Input.Keyboard.KeyCodes.S,
      'left': Phaser.Input.Keyboard.KeyCodes.A,
      'right': Phaser.Input.Keyboard.KeyCodes.D
    }, false) as Phaser.Types.Input.Keyboard.CursorKeys);
    this.cursors.push(this.input.keyboard.addKeys({
      'up': Phaser.Input.Keyboard.KeyCodes.H,
      'down': Phaser.Input.Keyboard.KeyCodes.J,
      'left': Phaser.Input.Keyboard.KeyCodes.K,
      'right': Phaser.Input.Keyboard.KeyCodes.L
    }, false) as Phaser.Types.Input.Keyboard.CursorKeys);

    // Create a sprite with physics enabled via the physics system. The image used for the sprite
    // has a bit of whitespace, so I'm using setSize & setOffset to control the size of the
    // player's body.




    const sprite = this.physics.add
      .sprite(spawnPoint.x, spawnPoint.y, 'atlas', 'misa-front')
      .setSize(30, 40)
      .setOffset(0, 24)
      .setInteractive();


    this.placeableAddition(sprite);


    const label = this.add.text(spawnPoint.x, spawnPoint.y - 20, '(You)', {
      font: '18px monospace',
      color: '#000000',
      // padding: {x: 20, y: 10},
      backgroundColor: '#ffffff',
    });
    this.player = {
      sprite,
      label
    };

    /* Player and box object should collide. Blocks path of the player */
    // if(boxImage){
    //   this.physics.add.collider(sprite, boxImage);
    // }

    /* Configure physics overlap behavior for when the player steps into
    a transporter area. If you enter a transporter and press 'space', you'll
    transport to the location on the map that is referenced by the 'target' property
    of the transporter.
     */
    this.physics.add.overlap(sprite, transporters,
      (overlappingObject, transporter)=>{
        if(cursorKeys.space.isDown && this.player){
          // In the tiled editor, set the 'target' to be an *object* pointer
          // Here, we'll see just the ID, then find the object by ID
          const transportTargetID = transporter.getData('target') as number;
          const target = map.findObject('Objects', obj => (obj as unknown as Phaser.Types.Tilemaps.TiledObject).id === transportTargetID);
          if(target && target.x && target.y && this.lastLocation){
            // Move the player to the target, update lastLocation and send it to other players
            this.player.sprite.x = target.x;
            this.player.sprite.y = target.y;
            this.lastLocation.x = target.x;
            this.lastLocation.y = target.y;
            this.emitMovement(this.lastLocation);
          }
          else{
            throw new Error(`Unable to find target object ${target}`);
          }
        }
      })

    this.emitMovement({
      rotation: 'front',
      moving: false,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - JB todo
      x: spawnPoint.x,
      y: spawnPoint.y,
    });

    // Watch the player and worldLayer for collisions, for the duration of the scene:
    this.physics.add.collider(sprite, worldLayer);

    // Create the player's walking animations from the texture atlas. These are stored in the global
    // animation manager so any sprite can access them.
    const { anims } = this;
    anims.create({
      key: 'misa-left-walk',
      frames: anims.generateFrameNames('atlas', {
        prefix: 'misa-left-walk.',
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: 'misa-right-walk',
      frames: anims.generateFrameNames('atlas', {
        prefix: 'misa-right-walk.',
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: 'misa-front-walk',
      frames: anims.generateFrameNames('atlas', {
        prefix: 'misa-front-walk.',
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: 'misa-back-walk',
      frames: anims.generateFrameNames('atlas', {
        prefix: 'misa-back-walk.',
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    const camera = this.cameras.main;
    camera.startFollow(this.player.sprite);
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);



    // Help text that has a "fixed" position on the screen
    this.add
      .text(16, 16, `Arrow keys to move, space to transport\nCurrent town: ${this.video.townFriendlyName} (${this.video.coveyTownID})`, {
        font: '18px monospace',
        color: '#000000',
        padding: {
          x: 20,
          y: 10
        },
        backgroundColor: '#ffffff',
      })
      .setScrollFactor(0)
      .setDepth(30);

    this.ready = true;
    if (this.players.length) {
      // Some players got added to the queue before we were ready, make sure that they have
      // sprites....
      this.players.forEach((p) => this.updatePlayerLocation(p));
    }

  }



  pause() {
    this.paused = true;
    this.previouslyCapturedKeys = this.input.keyboard.getCaptures();
    this.input.keyboard.clearCaptures();
  }

  resume() {
    this.paused = false;
    this.input.keyboard.addCapture(this.previouslyCapturedKeys);
    this.previouslyCapturedKeys = [];
  }
}

export default function WorldMap(): JSX.Element {
  const video = Video.instance();
  const {
    emitMovement, players,
    // newly added
    placeables, currentTownID, apiClient, myPlayerID
  } = useCoveyAppState();
  const [gameScene, setGameScene] = useState<CoveyGameScene>();
  const [modal, setModal] = useState(false);

  const [isShown, setIsShown] = useState<boolean>(true);
  const toggle = () => setIsShown(!isShown);


  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      parent: 'map-container',
      minWidth: 800,
      minHeight: 600,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 }, // Top down game, so no gravity
        },
      },
      dom: {
        createContainer: true
      } 
    };

    const game = new Phaser.Game(config);
    if (video) {
      const newGameScene = new CoveyGameScene(video, emitMovement, apiClient, currentTownID, myPlayerID);
      setGameScene(newGameScene);
      game.scene.add('coveyBoard', newGameScene, true);
      video.pauseGame = () => {
        newGameScene.pause();
      }
      video.unPauseGame = () => {
        newGameScene.resume();
      }
    }
    return () => {
      game.destroy(true);
    };
  }, [video, emitMovement,apiClient, currentTownID, myPlayerID]);

  const deepPlayers = JSON.stringify(players);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('players: ', players);
    gameScene?.initialise(apiClient, currentTownID);
    gameScene?.updatePlayersLocations(players);
    if(placeables) {
      gameScene?.updatePlaceables(placeables);
    }

  }, [players, deepPlayers, gameScene, apiClient, currentTownID]); // newly added placeableObjects

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('placeables: ', placeables);
    gameScene?.updatePlaceables(placeables); // newly added this fun call
  }, [placeables, gameScene]); // newly added placeableObjects

  return (
    <div>
      <div id="map-container"/>
      <div id="modal-container"/>
    </div>

  );
}
