/*
Module for a gamestate commands
*/
function gameaction(obj) {
  var gameaction = this;
  
  obj.client.on('makePlacements', function(obj) {
    gameaction.makePlacements(obj)
  });
  
 /*
  *Called when a user sends a set of placements to make
  *
  *@arg obj.
  *         client         the client object that sent the command
  *         socket         the socket object
  *         args           the arguments the user sent with the message, [] of objects with
  *             .x          {x,y} position they want to place at
  *             .y
  *         connectedUsers object of connected users, indexed by session id
  *         games          array of all games
  *         game           the game that the player is in that sent the command
  */
  this.makePlacements = function(obj) {
    if (obj.game) {
      obj.game.makePlacements(obj);
    }
    else {
      //add a debug check to all these throws
      throw new Error('makePlacements called without game');
    }
  }
}

module.exports = gameaction