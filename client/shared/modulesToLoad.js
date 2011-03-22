/*  The list of modules you want to load on the server & client
    An example of the basic requirements to exposes data to both the 
    client and the server.  You can add your own modules to this list
    to include them on both the client and the server.
*/
var list = [
    'auth',
    'matchmaker',
    'gameaction'
]

/*
Below is just the standard shared class pattern to expose the list
to both the client and server
*/

/*  if the client includes us, we need to return the list, the
    function name is the same as the file name, we can use
      var modulesToLoad = modulesToLoad()
    on the client to get at the data client-side
*/
function modulesToLoad() {
  return list;
}
/*  if the server includes us, we also need to return the list
    set the node.js standard module.exports to the data so we can use
      var modulesToLoad = require('/path/to/this/file')
    on the server to get at the data server-side
*/
if (typeof exports != 'undefined') {
  module.exports = list;
}