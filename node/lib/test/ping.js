
module.exports = function(conf) {

   var everyone = conf.everyone;

//   everyone.now.ack = function(json) {
//      console.log('ack', json)
//   };

   return {
      index: function(req, res) {
         var json = req.query;
         if( everyone.now.ping ) {
            console.log('ping sent');
            everyone.now.ping(json);
            res.end('ping sent');
         }
         else {
            res.end('could not ping');
         }
      }
   }

};
