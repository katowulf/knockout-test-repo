var express = require('express')
   , app = express.createServer()
   , os = require('os')
   , conf = {
         app: app,
         host: os.hostname(),
         port: 3000,
         instance: 'dev-local-wsnode',
         version: '0.1-alpha',
         devmode: app.settings.env !== 'production',
         everyone: require('now').initialize(app)
      };

conf.everyone.now.ack = function(json) {
   console.log('ack', json)
};

require('./lib/config')(express, conf);

require('./lib/routes')(conf);

if( conf.devmode ) {
   require('reloader')({
      watchModules: true,
      onStart: function () {
         console.info('%s listening in dev mode on port %d', conf.instance, conf.port);
      },
      onReload: function () {
         app.listen(conf.port);
      }});
}
else {
   app.listen(conf.port);
}

