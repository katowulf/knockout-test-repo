
var count = 5
   , out = exports
   , everyone
   , users
   , _u = require('underscore');

out.index = function(req, res){
    console.info('requested user data');
   res.json(_data());
};

//out.new = function(req, res){
//   res.send('new user');
//};

out.create = function(req, res) {
   var body = req.body, c = ++count, key = 'user'+count;
   console.log('body', body);
   var newUser = {
      fname: body.fname,
      lname: body.lname,
      counter: 1,
      id: c
   };
   users[key] = newUser;
   res.json({s: 1, a: 'c', id: newUser.id});
   _update({a: 'c', user: newUser});
};

out.show = function(req, res){
   res.json(users['user'+req.params.user]);
};

//out.edit = function(req, res){
//   var user = users['user'+req.params.user];
//   res.send({s: true, user: user});
//};

out.update = function(req, res){
   var user = users['user'+req.params.user];
   user.fname = req.body.fname;
   user.lname = req.body.lname;
   user.counter++;
   res.json({s: 1, a: 'u', id: user.id});
   _update({a: 'u', user: user})
};

out.destroy = function(req, res){
   var id = req.params.user, u = users['user'+id];
   console.log('deleting user '+id);
   delete users['user'+id];
   res.json({s: 1, a: 'd', id: id});
   _update({a: 'd', user: u});
};

module.exports = function(conf) {
   everyone = conf.everyone;
   users = conf.fixtures.users;
//   everyone = require('now').initialize(conf.app);
   return out;
};

function _data() {
   var data = [];
   for(key in users) {
      data.push(users[key]);
   }
   return data;
}

function _update(data) {
   if( everyone.now.serverUpdate ) {
      everyone.now.serverUpdate(users);
   }
   else {
      console.error('now.serverUpdate was not declared on client?');
   }
      if( everyone.now.update ) {
         console.log('sending user update', data);
         everyone.now.update(data);
      }
      else {
         console.error('now.update was not declared on client?');
      }
}