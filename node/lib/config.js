
var util = require('util')
      , fs = require('fs');

module.exports = function(express, conf) {
   var app = conf.app;

   app.configure(function(){
      // ws config variables
   //   app.set('ws', wsConfigVars);

         // application settings
         //app.set('views', dir + '/views');
         //app.set('view engine', 'html');
         //app.set('view options', {layout: false});
         //app.set('ws-instance', 'node-a2');
         app.set('servername', conf.host);
         //app.register('.html', require('jqtpl').express);
      console.log('appyling methodOverride');
      app.use(express.bodyParser());
      app.use(express.methodOverride());
      app.use(express.cookieParser());
   //   if( process.env.NOREDIS ) {
         console.warn('Redis sessions disabled');
         app.use(express.session({ secret: 'B~4Q!*dj5atuB/IkTur5&j_NU' }));
   //   }
   //   else {
   //      app.use(express.session({ store: new RedisStore, secret: 'D21vaIVDFGvFYjQa6XyZ81ArcRPcGuB4Qdj5atuBIkTur5jNU' }));
   //   }
         //app.use(passport.initialize()); //todo-auth
         //app.use(passport.session()); //todo-auth
         app.enable('jsonp callback');
   });

   app.configure('development', function(){
      //todo something with app.logger()?
//      app.use(express.static('./public'));
      app.use(app.router);
      app.use(express.logger({
         format: 'default',
         buffer: false
      }));
      // you must turn this off to create custom 404 and 500 error pages
      app.use(express.errorHandler({ showMessage: true, dumpExceptions: true, showStack: true }));
   });

   app.configure('production', function(){
      io.set('log level', 2);
      var age = 86400000; //one hour  //31557600000; //one year
      util.format('static pages are cached for %s hour(s)', age/1000/60/60);
//      app.use(express.static('./public', { maxAge: age }));
      app.use(app.router);
      app.use(express.logger({
         format: 'default',
         buffer: true,
         stream: fs.createWriteStream('access.log', {flags: 'a'})
      }));
      app.use(express.errorHandler({showMessage: true, showStack: false }));
   });

};