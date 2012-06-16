var express = require('express')
   , _u = require('underscore')
   , app = express.createServer()
   , os = require('os')
   , uuid = require('node-uuid')
   , conf = {
         app: app,
         host: os.hostname(),
         port: 4001,
         instance: 'dev-local-wsnode',
         version: '0.1-alpha',
         devmode: app.settings.env !== 'production',
         everyone: require('now').initialize(app),
         fixtures: require('./lib/test/fixtures')
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

var everyone = conf.everyone;

//todo move to chat.js
everyone.now.distribute = function(message){
   console.log('chat message', message);
   // this.now exposes caller's scope
   everyone.now.receive(this.now.name, message);
};