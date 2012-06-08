
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

var count = 5;

exports.index = function(req, res){
   res.send(users);
};

//exports.new = function(req, res){
//   res.send('new user');
//};

exports.create = function(req, res) {
   var body = req.body, c = ++count, key = 'user'+count;
   var newUser = {
      fname: body.fname,
      lname: body.lname,
      counter: 1,
      id: c
   };
   users[key] = newUser;
   res.send(newUser);
};

exports.show = function(req, res){
   res.send(users['user'+req.params.user]);
};

//exports.edit = function(req, res){
//   var user = users['user'+req.params.user];
//   res.send({s: true, user: user});
//};

exports.update = function(req, res){
   var user = users['user'+req.params.user];
   user.fname = req.body.fname;
   user.lname = req.body.lname;
   user.counter++;
   res.send({s: true, user: user});
};

exports.destroy = function(req, res){
   delete users['user'+req.params.user];
   res.send({s: true, user: req.params.user});
};
