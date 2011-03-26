/*
Gamestate class that is used by the gameaction module
This is an example of a 2-player Tic-Tac-Toe game
*/

function gamestate() {
  
  /*Set the Required Gamestate Options*/
  //todo accept vals passed in from createServer call
  this.type = 'multipleWorld'; //we want multiple tic-tac-toe games
  this.timing = 'turnBased'; //tic-tac-toe is turn based
  this.endable = true; //and the games can end 
  this.minPlayers = 2; //the minimum number of players for a game is 2
  
  this.maxTurns = 12;
  this.numPlacements = 1;
  this.numGenerations = 5;
   
  var boardWidth = 50;
  var boardHeight = 50;
  
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
    this.numGenerations = 10 * (this.turnNumber*this.turnNumber)
    //tell all players the current board state after the last evolution cycle
    this.sendAllPlayers({type: 'boardUpdate', args: {board: this.board}}, obj.socket);
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
          game.board[Number(placement.y)+ydelta][Number(placement.x)+xdelta].circuit = {
            owner: player
          }
        });
      });
    });
    this.energizeCircuits(obj);
    this.sendAllPlayers({type: 'boardUpdate', args: {board: this.board}}, obj.socket);
    console.log('evolving');
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
