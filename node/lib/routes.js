
var Resource = require('express-resource');

module.exports = function(conf) {
   var app = conf.app;

   app.options('*', function( request, response ){
      // When dealing with CORS (Cross-Origin Resource Sharing)
      // requests, the client should pass-through its origin (the
      // requesting domain). We should either echo that or use *
      // if the origin was not passed.
      var origin = (request.headers.origin || "*");

      // Echo back the Origin (calling domain) so that the
      // client is granted access to make subsequent requests
      // to the API.
      response.send(
            '',
            {
               "access-control-allow-origin": origin,
               "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
               "access-control-allow-headers": "content-type, accept",
               "access-control-max-age": 10, // Seconds.
               "content-length": 0
            },
            204
      );

      // End the response - we're not sending back any content.
      return( response.end() );

   });

   app.all('*', function( request, response, next ){
      // When dealing with CORS (Cross-Origin Resource Sharing)
      // requests, the client should pass-through its origin (the
      // requesting domain). We should either echo that or use *
      // if the origin was not passed.
      var origin = (request.headers.origin || "*");

      // Echo back the Origin (calling domain) so that the
      // client is granted access to make subsequent requests
      // to the API.
      response.header("access-control-allow-origin", origin);

      console.log('method: '+request.method);//debug

      // continue processing request
      next();
   });

   if( conf.devmode ) {
      console.log('is dev');
      app.resource('test/user', require('./test/user')(conf));
      app.resource('test/ping', require('./test/ping')(conf));
   }

   app.get('/', function(req, res){
      res.send(conf.instance+' v'+conf.version);
   });

};