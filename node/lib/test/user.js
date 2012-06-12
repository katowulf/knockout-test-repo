
var count = 5
      , out = exports
      , everyone;

var users = {
   'user1': {
      fname: 'Jack',
      lname: 'Campbell',
      id: 1,
      counter: 1
   },
   'user2': {
      fname: 'Sara',
      lname: 'Connors',
      id: 2,
      counter: 1
   },
   'user3': {
      fname: 'Bill',
      lname: 'Brown',
      id: 3,
      counter: 1
   },
   'user4': {
      fname: 'Casey',
      lname: 'Wayne',
      id: 4,
      counter: 1
   },
   'user5': {
      fname: 'Sara',
      lname: 'Mitchel',
      id: 5,
      counter: 1
   }
};

out.index = function(req, res){
   res.json(users);
};

//out.new = function(req, res){
//   res.send('new user');
//};

out.create = function(req, res) {
   var body = req.body, c = ++count, key = 'user'+count;
   var newUser = {
      fname: body.fname,
      lname: body.lname,
      counter: 1,
      id: c
   };
   users[key] = newUser;
   res.json({s: 1, a: 'c', user: newUser});
   everyone.now.update(users);
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
   res.json({s: 1, a: 'u', user: user});
   everyone.now.update(users);
};

out.destroy = function(req, res){
   var id = req.params.user;
   console.log('deleting user '+id);
   delete users['user'+id];
   res.json({s: 1, a: 'd', user: id});
   everyone.now.update(users);
};

module.exports = function(conf) {
   everyone = conf.everyone;
//   everyone = require('now').initialize(conf.app);
   return out;
};