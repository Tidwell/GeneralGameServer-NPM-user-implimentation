/*
Module for gamestate events, (aka gameaction)
A new instance of this object is created when the module is loaded
All DOM event bindings inside this object will be bound
*/

function gameaction() {
  //to avoid this confusion
  var game = this;
  
  this.gameShow = function() {
    $('#gamestate').fadeIn();
  }
  
  /*
  *Called when a new game has begun
  *@arg     args           the arguments the server sent with the message
  *             .players   the players in the game
  */
  this.gameStart = function(args) {
    //remove any existing player information and reset the board
    $('#gamestate td').html(' ');
    $('#gamestate ul li').remove();
    //add the new player info
    args.players.forEach(function(player) {
      $('#gamestate ul.players').append('<li rel="'+player.sessionId+'" class="'+player.color+'">'+player+'</li>');
    });
  }

  /*
  *Called when the server tells the players names
  *@arg     args           the arguments the server sent with the message
  *             .players   names of players in the game
  */
  
  this.playerNames = function(args) {
    var i = 0;
    $('#gamestate ul.players li').each(function() {
      $(this).html(args.players[i]);
      i++;
    });
  }
  
  /*
  *Called when the server tells the players names
  *@arg     args           the arguments the server sent with the message
  *             .name      The name the player changed to
  *             .id        The unique id used to identify the user
  */
  this.playerNameChange = function(args) {
    $('#gamestate ul.players li').each(function() {
      if ($(this).attr('rel') == args.id) {
        $(this).html(args.name);
      }
    });
  }
  
  
  var waitingChanges = [];
  this.boardChanges = function(args) {
    console.log('updated');
    waitingChanges.push(args);
    updateChanges();
    
    function updateChanges() {
      if (waitingChanges.length > 0) {
        setTimeout(renderBoardChanges,500);
      }
    }
    
    function renderBoardChanges() {
      var args = waitingChanges[0];
      if (!args) return;
      args.changes.forEach(function(change) {
        var token = (change.circuit) ? (change.circuit.owner.color) : '';
        var energyTokens = '';
        if (change.energy) {
          change.energy.forEach(function(energy) {
            energyTokens += '<span class="'+energy.owner.color+' energy"></span>'
          });
        }
        $('td[rel=x'+change.x+'y'+change.y+']').removeClass('r').removeClass('g').html('').addClass(token).html(energyTokens);
      });
      waitingChanges.remove(0);
      updateChanges();
    }
  }
   
  
  
  var waitingUpdates = [];
  this.boardUpdate = function(args) {
    waitingUpdates.push(args);
    updateBoard();
    
    function updateBoard() {
      if (waitingUpdates.length > 0) {
        setTimeout(renderBoardUpdate,500);
      }
    }
    
    function renderBoardUpdate() {
      var args = waitingUpdates[0];
      if (!args) return;
      var board = $('#gamestate .board');
      board.html('');
      var boardHeight = args.board.length;
      var boardWidth = args.board[0].length;
      
      var boardHtml = '';
      var i = 0;
      while (i< boardHeight) {
        boardHtml += '<tr>';
        var q = 0;
        while (q < boardWidth) {
          if (args.board[i][q]) {
            //console.log(args.board[i][q]);
          }
          var token = (args.board[i][q].circuit) ? (args.board[i][q].circuit.owner.color) : '';
          var energyTokens = '';
          if (args.board[i][q].energy) {
            args.board[i][q].energy.forEach(function(energy) {
              energyTokens += '<span class="'+energy.owner.color+' energy"></span>'
            });
          }
          boardHtml += '<td rel="x'+q+'y'+i+'" class="'+token+'">'+energyTokens+'</td>';
          q++;
        }
        boardHtml += '</tr>';
        i++;
      }
      board.html(boardHtml);
      waitingUpdates.remove(0);
      updateBoard();
    }
  }
  
  this.requestPlacement = function(args) {
    if (waitingUpdates.length > 0 || waitingChanges.length > 0) {
      setTimeout(function() {
        game.requestPlacement(args)
      }, 2000);
    }
    else {
      $('.placements span').html(args.placements);
      $('.evolutions span').html(args.generations);
      $('.turns .current').html(args.turn);
      bindPlacements(args);
      alert('Please make '+args.placements+' placements');
    }
  }
  
  var bindPlacements = function(args) {
    var placements = [];
    $('.board td').unbind().click(function() {
      var rel = $(this).attr('rel');
      var split = rel.split('y');
      var x = split[0].replace('x', '');
      var y = split[1];
      
      
      var circuit = [
        [-1,-1],
        [0,-1],    
        [1,-1],
        [0,1],
        [1,0],
      ];
      
      if (isValidPlacement(x,y)) {
        placements.push({x:x,y:y,circuit: circuit});
        $(this).addClass('placing');
      }
      if (placements.length == args.placements) {
        $('.board td').unbind();
        socket.send({type: 'makePlacements', args: {placements: placements}});
      }
    });
  }
  
  var isValidPlacement = function(x,y) {
    return true;
  }
  
  
  this.maxTurns = function(args) {
    $('.turns .max').html(args.maxTurns);
  }
  
  this.gameOver = function(args) {
    if (args.winner == 'tie') {
      modules.matchmaker.endGame('tie');
    }
    else {
      //console.log(args.winner.winner, socket.transport.sessionid);
      if (args.winner.length != undefined) args.winner = args.winner[0];
      if (Number(socket.transport.sessionid) == args.winner.sessionId) { 
        modules.matchmaker.endGame('win');
      }
      else {
        modules.matchmaker.endGame('lost');
      }
    }
  }
  
  this.opponentDisconnect = function(args) {
    alert('Your opponent has disconnected');
  }
  

  //bind dom events to send commands to server
  
}
// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};
modules.gameaction = new gameaction;
