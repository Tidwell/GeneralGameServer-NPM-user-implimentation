/*
Gamestate class that is used by the gameaction module
This is an example of a 2-player Tic-Tac-Toe game
*/
var log = require('logging');

function gamestate() {
  
  /*Set the Required Gamestate Options*/
  //todo accept vals passed in from createServer call
  this.type = 'multipleWorld'; //we want multiple tic-tac-toe games
  this.timing = 'turnBased'; //tic-tac-toe is turn based
  this.endable = true; //and the games can end 
  this.minPlayers = 2; //the minimum number of players for a game is 2
  
  this.maxTurns = 12;
  this.numPlacements = 1;
  this.numGenerations = 1;
   
  var boardWidth = 50;
  var boardHeight = 25;
  
  this.board = []
  
  //generate the board
  var i = 0;
  while (i< boardHeight) {
    this.board[i] = [];
    var q = 0;
    while (q < boardWidth) {
      this.board[i][q] = {
        circuit: null
      };
      q++;
    }
    i++;
  }
  
  /*Stuff specific to this gamestate*/
  this.players = [];
  this.turnNumber = 0;
  
  
  /*
  * Called at the start of the game
  * Tells the players the player names
  * sets the active player ranomly and tells the players
  *
  *@arg obj.
  *         client         client object
  *         socket         the socket object
  *         connectedUsers connectedUsers obj, keyed by sessionId
  */
  this.startGame = function(obj) {
    this.started = true;
    var colors = ['r', 'g', 'b']

    var playerNames = [];
    var i = 0;

    this.players.forEach(function(player) {
      player.color = colors[i];
      i++;
      var name = (obj.connectedUsers[player.sessionId].name) ? obj.connectedUsers[player.sessionId].name : 'Anonymous'
      playerNames.push(name);
    });

    this.sendAllPlayers({type: 'gameStart', args: {players: this.players}}, obj.socket);
    this.sendAllPlayers({type: 'playerNames', args: {players: playerNames}}, obj.socket);
    this.sendAllPlayers({type: 'maxTurns', args: {maxTurns: this.maxTurns}}, obj.socket);
    
    this.doTurn(obj);
  }
  
  this.doTurn = function(obj) {
    this.players.forEach(function(player) {
      player.placements = null;
    });
    this.turnNumber++;
    this.numGenerations = 100;
    if (this.turnNumber == 1) {
      //tell all players the current board state after the last evolution cycle
      this.sendAllPlayers({type: 'boardUpdate', args: {board: this.board}}, obj.socket);
    }
    //request placements from players, telling them how many they need
    this.sendAllPlayers({type: 'requestPlacement', args: {
      placements: this.numPlacements, 
      generations: this.numGenerations,
      turn: this.turnNumber}}, obj.socket);
  }
  
  this.makePlacements = function(obj) {
    var allPlaced = true;
    this.players.forEach(function(player) {
      if (player.sessionId == obj.client.sessionId) {
        player.placements = obj.args.placements;
      }
      if (player.placements == null) {
        allPlaced = false;
      }
    });
    if (allPlaced) {
      this.placeNewCircuits(obj);
    }
  }
  
  this.placeNewCircuits = function(obj) {
    var game = this;
    this.players.forEach(function(player) {
      player.placements.forEach(function(placement) {
        placement.circuit.forEach(function(item) {
          var xdelta = Number(item[0]);
          var ydelta = Number(item[1]);
          game.board[Number(placement.y)-ydelta][Number(placement.x)+xdelta].circuit = {
            owner: player
          }
        });
      }); 
    });
    //log(this.board);
    this.energizeCircuits(obj);
    //log('energized');
    //log(this.board);
    
    //log('clashes');
    //log(this.board);
    var i=0;
    while (i<this.numGenerations) {
      this.destroyClashingEnergy(obj);
      var changes = this.moveEnergy(obj);
      if (changes.length > 0) {
        this.sendAllPlayers({type: 'boardChanges', args: {changes: changes}}, obj.socket);
      }
      i++;
    }
    //log('moving');
    //log(this.board);
    this.sendAllPlayers({type: 'boardUpdate', args: {board: this.board}}, obj.socket);
    this.doTurn(obj);
  }
  
  this.energizeCircuits = function(obj) {
    this.board.forEach(function(row) {
      row.forEach(function(cell) {
        if (cell.circuit) {
          if (!cell.energy) {
            cell.energy = []
          }
          cell.energy.push({
            owner: cell.circuit.owner
          });
        }
      });
    });
  }
  
  this.moveEnergy = function(obj) {
    var game = this;
    //standard game of life implimentation
    var y = 0;
    var changes = [];
    this.board.forEach(function(row) {
      var x = 0;
      row.forEach(function(cell) {
        //==For a space that is 'populated':
        if (cell.energy && cell.energy.length > 0) {
          var neighbors = game.numberOfNeighbors(x,y,cell.energy[0]);
          //Each cell with one or no neighbors dies, as if by loneliness. 
          if (neighbors == 0 || neighbors == 1) {
            var change = {
              y: y,
              x: x,
              energy: []
            }
            changes.push(change);
          }
          //Each cell with four or more neighbors dies, as if by overpopulation. 
          if (neighbors == 4) {
            changes.push({
              y: y,
              x: x,
              energy: []
            });
          }
          //Each cell with two or three neighbors survives. 
        }
        //==For a space that is 'empty' or 'unpopulated'
        else {
          game.players.forEach(function(player) {
            var energy = {owner: player}
            //if (!energy) log('no energy fuck', energy);
            var neighbors = game.numberOfNeighbors(x,y,energy);
            //Each cell with three neighbors becomes populated.            
            //if (neighbors > 2) log('neighbors',x,y,neighbors);
            if (neighbors == 3) {
              if (!game.board[y][x].energy) game.board[y][x].energy = [];
              changes.push({
                y: y,
                x: x,
                energy: game.board[y][x].energy.concat([{owner: player}]) //concat in case there is energy there
              });
            }
          });
        }
        x++;
      });
      y++;
    });
    changes.forEach(function(change) {
      game.board[change.y][change.x].energy = change.energy;
    });
    return changes;
  }
  
  this.numberOfNeighbors = function(x, y, energy) {
    var n = 0;
    if (this.isCellEnergized(x-1, y-1, energy))	n++;
    if (this.isCellEnergized(x-1, y, energy))	n++;
    if (this.isCellEnergized(x-1, y+1, energy))	n++;
    if (this.isCellEnergized(x, y-1, energy))	n++;
    if (this.isCellEnergized(x, y+1, energy))	n++;
    if (this.isCellEnergized(x+1, y-1, energy))	n++;
    if (this.isCellEnergized(x+1, y, energy))	n++;
    if (this.isCellEnergized(x+1, y+1, energy))	n++;
    //if (n!=0) console.log(n);
    return n;
	}
  
  this.isCellEnergized = function(x,y,energy) {
    if (!energy) {
      return false;
    }
    if (x<0 || y <0 || x>boardWidth-1 || y>boardHeight-1) {
      return false;
    }
    if (this.board[y][x].energy && this.board[y][x].energy[0] && this.board[y][x].energy[0].owner.color == energy.owner.color) {
      return true;
    }
    return false;
  }

  
  this.destroyClashingEnergy = function(obj) {
    this.board.forEach(function(row) {
      row.forEach(function(cell) {
        var singleOwner = true;
        var prevPlayer;
        if (cell.energy && cell.energy.length > 0) {
          //check if they are all owned by the same player
          cell.energy.forEach(function(energy) {
            if(prevPlayer) {
              if (energy.owner != prevPlayer) {
                singleOwner = false;
              }
            }
            prevPlayer = energy.owner;
          });
          if (!singleOwner) {
            cell.energy = [];
          }
          else if (singleOwner) {
            //console.log('singleowner');
            //we just want one energy, so merge all the single players multiples down
            cell.energy = [cell.energy[0]];
          }
        }
      });
    });
  }
  
   
  this.checkGameEnd = function(obj) {
    var gameOver = false;
    var winner = null;
    var players = this.players;
    
    //check if we no longer have enough players, and there are players left
    if (players.length < this.minPlayers && players.length > 0) {
      gameOver = true;
      winner = players;
    }
    //check if we have 0 players left in this game
    if (players.length == 0) {
      gameOver = true;
      winner = 'allPlayerDisconnect';
    }
    
    //check num turns if num == maxturns, resolve winner
    
    if (gameOver != false) {
      //otherwise someone won
      obj.winner = winner
      this.gameOver(obj);
    }
    return gameOver;
  }
}
exports.gamestate = gamestate
