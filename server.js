var log = require('logging');

var game = require('generalGameServer').createServer({
  server: {
    /*  STRING
        Path to where all the front-end code lives (html/css/js)
        relative to the ./, without leading or trailing /
        default: 'client'
        Unused if you are not using gGS to serve http
    */
    clientDir: 'client',
    /*
        BOOL
        If the generalGameServer should serve http requests.  You 
        can replace the generalGameServer http server with
        Any other nodejs http server (express, etc) and point the 
        webroot to ./client
        default: true
    */
    serveHttp: true,
    server: {} //if serveHttp is false must be an instance of http.createServer that socket.io can bind to
  },
  game: {
    //maximum number of instances of the gamestate (# or infinate)
    instances: 'infinite',
    //if the user creates instances of the game
    userCreated: true,
    //the minimum number of players for a game to start and continue going 
    //(0 means it will always run and persist even if everyone disconnects)
    minPlayers: 2,
    //# or infinite - maximum number of players a single instance of the gamestate can handle
    maxPlayers: 2,
    //TODO: allow a user to be in multiple games at once (this is a bitch to impliment)
    multiGame: false 
  }
});

//log(game);


/*
game.modules                all instantiated module objects

game.gamestateTemplate      the constructor used to create new gamestate instances, call with
                                var g = new obj.gamestateTemplate inside of any module

game.httpServer             either the server object created by the framework, or just 
                            the same instance that was pased in    as server.server
                            
game.socket                 instance of socket.io that is attached to game.httpServer



game.modules.auth.init({
  type: ['anonymous', 'anonymous/named', 'authenticated'],
  callback: function() { console.log('auth init') }
})
game.modules.matchmaker.init({
  callback: function() { console.log('matchmaker init') }
})
game.modules.gameevent.init({
  callback: function() { console.log('gameevent init') }
})
*/