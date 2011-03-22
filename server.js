var log = require('logging');

var game = require('generalGameServer').createServer({
  server: {
    /*  STRING
        Path to where all the front-end code lives (html/css/js)
        relative to the ./, without leading or trailing /
        default: 'client'
    */
    clientDir: 'client',
    /*
        BOOL
        If the generalGameServer should serve http requests.  You 
        can replace the generalGameServer http server with
        Any other http server (express, apache, nginx) and point the 
        webroot to ./client
        default: true
    */
    serveHttp: true,
  },
  game: {
    //# or infinite
    instances: 'infinite',
    userCreated: true,
    //# or infinite
    minPlayers: 2,
    //# or infinite
    maxPlayers: 2 
  }
});

/*
game.modules                all instantiated module objects
game.gamestateTemplate      the constructor used to create new gamestates, call with
                                var g = new obj.gamestateTemplate inside of any module



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