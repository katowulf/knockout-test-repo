
module.exports = function(conf) {

   var everyone = conf.everyone;

   everyone.now.ack = function(json) {
      console.log('ack', json)
   };

   everyone.now.sendPing = function(message) {
      everyone.now.ping(message);
   }

   return {
      index: function(req, res) {
         var m = req.query.m;
         if( everyone.now.ping ) {
            console.log('ping sent', m);
            everyone.now.ping(m);
            res.end('ping sent');
         }
         else {
            res.end('could not ping');
         }
      }
   }

};
