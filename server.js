var log = require('logging');

var game = require('generalGameServer').createServer({
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
  serveHttp: true
});
/*
game.modules.auth.init({
  type: ['anonymous', 'anonymous/named', 'authenticated'],
  callback: function() { console.log('auth init') }
})
game.modules.matchmaker.init({
  type: ['random', 'private', 'single-world', 'multiple-world'],
  callback: function() { console.log('matchmaker init') }
})
game.modules.gameevent.init({
  callback: function() { console.log('gameevent init') }
})
*/