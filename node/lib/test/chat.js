
module.exports = function(conf) {

   console.log('chat test initialized');

   var everyone = conf.everyone;

//   everyone.now.distribute = function(message){
//      console.log('chat message', message);
//      // this.now exposes caller's scope
//      everyone.now.receive(this.now.name, message);
//   };

   return {}
}
