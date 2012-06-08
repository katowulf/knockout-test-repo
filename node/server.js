var express = require('express')
   , Resource = require('express-resource')
   , app = express.createServer()
   , os = require('os')
   , io = require('socket.io').listen(app);

app.configure(function(){
   // ws config variables
//   app.set('ws', wsConfigVars);

   // application settings
   //app.set('views', dir + '/views');
   //app.set('view engine', 'html');
   //app.set('view options', {layout: false});
   //app.set('ws-instance', 'node-a2');
   app.set('servername', os.hostname());
   //app.register('.html', require('jqtpl').express);
   //app.use(express.logger(logConfig));
   app.use(express.bodyParser());
   app.use(express.methodOverride());
   app.use(express.cookieParser());
//   if( process.env.NOREDIS ) {
      io.log.warn('Redis sessions disabled');
      app.use(express.session({ secret: 'B~4Q!*dj5atuB/IkTur5&j_NU' }));
//   }
//   else {
//      app.use(express.session({ store: new RedisStore, secret: 'D21vaIVDFGvFYjQa6XyZ81ArcRPcGuB4Qdj5atuBIkTur5jNU' }));
//   }
   //app.use(passport.initialize()); //todo-auth
   //app.use(passport.session()); //todo-auth
});

app.configure('development', function(){
   io.set('log level', 2);
   app.use(express.static(global.appDir + '/public'));
   app.use(app.router);
   // you must turn this off to create custom 404 and 500 error pages
   app.use(express.errorHandler({ showMessage: true, dumpExceptions: true, showStack: true }));

   require('reloader')({
      watchModules: true,
      onStart: function () {
         console.log('Started on port: 3000');
      },
      onReload: function () {
         app.listen(3000);
      }});
});

app.configure('production', function(){
   io.set('log level', 2);
   var age = 86400000; //one hour  //31557600000; //one year
   io.log.info('static pages are cached for '+(age/1000/60/60)+' hour(s)');
   app.use(express.static(global.appDir + '/public', { maxAge: age }));
   app.use(app.router);
   app.use(express.errorHandler({showMessage: true, showStack: false }));

   app.listen(3000);
});

app.resource('test/user', require('./test/user'));

app.get('/', function(req, res){
   res.send('hello world');
});

//app.listen(3000);