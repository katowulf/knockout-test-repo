
jQuery.support.cors = true;

(function($, now) {

   /**************************
    * Config
    **************************/
   var apiUrl = 'http://ko.wordspot.org:4001';

   var navRoutes = ['home', 'ajax', 'chat', 'grid', 'base', 'prettify', 'components', 'ko-group', 'awesome'];

   var fruits = [
      {
         name: "Apple",
         shape: "Round",
         color: "Green"},
      {
         name: "Orange",
         shape: "Round",
         color: "Orange"},
      {
         name: "Satsuma",
         shape: "Round",
         color: "Orange"},
      {
         name: "Bananna",
         shape: "Weird",
         color: "Yellow"}
   ];

   /*************************
    * Control Logic
    *************************/

   var submodels = {
      ajax: new AjaxViewModel(),
      chat: new ChatViewModel(),
      "ko-group": new BasketViewModel(fruits)
   };

   var mainModel = new MainViewModel();

   ko.applyBindings(mainModel);

   /*************************
    * Data Models
    *************************/

   // ajax.html
   function UserDataModel(data) {
      console.log('creating user', data);
      var self = this;
      self.id = ko.observable(data.id);
      self.fname = ko.observable(data.fname);
      self.lname = ko.observable(data.lname);
      self.counter = ko.observable(data.counter);
      self.fullName = ko.computed(function() { return self.fname() + ' ' + self.lname() });
      self.editMode = ko.observable(false);
      self.update = function(json) {
         var k, opts = {id: 1, fname: 1, lname: 1, counter: 1};
         for(k in json) {
            if( json.hasOwnProperty(k) && k in opts ) {
               self[k](json[k]);
            }
         }
      }
   }

   /*************************
    * View Models
    *************************/

   // index.html
   function MainViewModel() {
      var self = this;

      self.viewPort = ko.observable("welcome");

      self.getTime = function() {
         return moment().format('HH:mm:ss');
      };

      self.sendPing = function(form) {
         $(form).closest('.modal').modal('hide');
         now.sendPing(form.message.value);
      }

      $.each(navRoutes, function(i, k) {
         Path.map('#'+k).to(function() { _navRoute(k, self); });
      });

      Path.rescue(function() {
         console.log('did not find route', this.current );
         return true;
      });

      Path.map("#tables").to(function(){}).enter(function(){return false;});

      Path.root('#home');

      jQuery(function() {
         Path.listen();
      });

      //todo path google analytics

   }

   // ajax.html
   function AjaxViewModel() {
      var self = this;
      self.users = ko.mapping.fromJS([], {
            key: function(data) { return ko.utils.unwrapObservable(data.id); },
            create: function(options) {
               return new UserDataModel(options.data);
            }
      });
      self.serverData = ko.observable('loading...');

      self.removeUser = function(user) {
         self.users.mappedRemove(user);
         if( user.id() ) { // new records don't have a user id
            console.log('removing user '+user.id());
            $.ajax({
               url: apiUrl+'/test/user/'+user.id(),
               //data: JSON.stringify({"_method": 'DELETE'}),
               type: 'DELETE',
               dataType: 'json'
            })
            .then(
               function(json){ // success
                  // do stuff with json (in this case an array)
                  if( json.s === 1 ) { console.log('deleted from server'); }
                  else { console.error(json.m); }
               },
               _ajaxErr
            );
         }
      };

      self.addUserForm = function(form) {
         var $form = $(form), $first = $form.find('input[name="fname"]'), $last = $form.find('input[name="lname"]');
         var user = new UserDataModel($.extend({id: null, counter: 0}, {fname: $first.val(), lname: $last.val()}));
         self.addUser(user);
         console.log('adding user');
         $.ajax({
            url: apiUrl+'/test/user/',
            data: ko.toJS(user),
            type: 'POST',
            dataType: 'json'
         })
         .then(
         function(json){ // success
            var u = json.user;
            // do stuff with json (in this case an array)
            if( json.s === 1 ) {
               console.log('server acknowledged add');
               // we have to manually update the id before we can use the mapping functions
               user.id(json.id);
            }
            else { console.error(json.m); }
         },
         _ajaxErr);
         return false;
      };

      self.addUser = function(user) {
         self.users.push(user);
      };

      self.toggleEditMode = function(user) {
         user.editMode( !user.editMode() );
      };

      self.updateUser = function(form) {
         var user = this;
         self.toggleEditMode(user);
         console.log('updating user');
         $.ajax({
            url: apiUrl+'/test/user/'+user.id(),
            data: $.extend(ko.toJS(user), {_method: 'PUT'}),
            type: 'POST',
            dataType: 'json'
//            ,contentType: 'application/json',
//            xhrFields: {
//               withCredentials: true
//            }
         })
            .then(
            function(json){ // success
               if( json.s === 1 ) {
                  console.log('server acknowledged update');
               }
               else { console.error(json.m); }
            },
            _ajaxErr
         );
         return false;
      };

      self.userUpdated = function(json) {
         var i, u;
         switch(json.a) {
            case 'u': // update
               i = self.users.mappedIndexOf(json.user);
               if( i >= 0 ) {
                  console.log('updating user', json.user.id);
                  self.users()[i].update(json.user);
               }
               break;
            case 'c': // added
               //todo this only works if the socket update comes after the http reply, which isn't a very safe
               //todo assumption; we use a timeout for now to make it visually noticeable, and a side effect of
               //todo that is that this also works. A real environment should be pure ajax or pure nowjs
               //todo alternately, we could use a tempId and include uuid on the client
               console.log('creating ', json.user);
               i = self.users.mappedIndexOf(json.user);
               if( i < 0 ) {
                  self.users.mappedCreate(json.user);
               }
               else {
                  // we created it, so just update the data
                  self.users()[i].update(json.user);
               }
               break;
            case 'd': // destroyed
               self.users.mappedRemove(json.user);
               break;
            default:
               console.error('Invalid user update action (u, a, or d required)', json);
         }
      };

      console.log('fetching users');
      $.ajax({
         url: apiUrl+'/test/user/',
         dataType: 'json'
      })
         .then(
         function(json){ // success
            // do stuff with json (in this case an array)
            self.updateServerData(json);
            self.syncDataModel(json);
         },
         function(e, status, msg) { // failure
            if( e instanceof Error || typeof(status) !== 'string' ) {
               console.error(e);
            }
            else {
               console.error(status, ' ', msg);
            }
         }
      );

      self.updateServerData = function(json) {
         self.serverData(JSON.stringify(json, null, 2));
      }

      self.syncDataModel = function(json) {
         ko.mapping.fromJS(json, self.users);
      }
   }

   // chat.html
   function ChatViewModel() {
      var self = this;
      self.userName = ko.observable();
      self.sendMessage = function(form) {
         now.distribute(form.message.value);
      };
      self.setName = function(form) {
         var n = form.userName.value;
         self.userName(n);
         now.name = n;
      }
   }

   // ko-group.html
   function BasketViewModel(fruits) {
      var self = this;
      self.fruits = ko.mapping.fromJS(fruits);
      self.groupBy = ko.observable('color');

      self.groupedFruits = ko.computed(function() {
         var grouping = self.groupBy();
         var results = [];
         ko.utils.arrayForEach(this.fruits(), function(item) {
            var group = $.grep(results, function(e, i){
               return e.name==item[grouping]();
            })[0];

            if(group==null)
            {
               results.push({name:item[grouping](), items:[item]});
               return;
            }
            group.items.push(item);
         });
         return results;
      },self);

   }

   /*************************
    * Custom Bindings
    *************************/



   /*************************
    * Utility Functions
    *************************/

   function _ajaxErr(e, status, msg) {
      console.error('ajax request failed');
      if( e instanceof Error || typeof(status) !== 'string' ) {
         console.error(e);
      }
      else {
         console.error(status, ' ', msg);
      }
   }

   function _navRoute(view, mainModel) {
      console.log('mapped to ', view);
      var model = view in submodels? submodels[view] : mainModel;
      mainModel.viewPort(view);
      $('#viewPort').load('partials/'+view+'.html', function() {
         ko.applyBindings(model, this);
      });
   }

   function _ack(text) {
      console.log('sending ack');
      now.ack(text);
   }

   function _ajax(url, data, method, thenFx) {
      var dat = { url: apiUrl+url, dataType: 'json' };
      if( data ) { dat.data = data; }
      switch(method) {
         case 'GET':
            dat.url = _url(dat.url, data);
            break;
         case 'POST':
            dat.type = 'POST';
            break;;
         case 'DELETE': // fall through
         case 'PUT':
            dat.type = 'POST';
            dat.data = $.extend({}, data, {_method: method});
         default:
            console.error('invalid method', method);
      }

      $.ajax(dat)
      .then(
         (thenFx || function() { console.log('success'); }),
         function(e, status, msg) { // failure
            if( e instanceof Error || typeof(status) !== 'string' ) {
               console.error(e);
            }
            else {
               console.error(status, ' ', msg);
            }
         }
      );
   }

   function _url(url, data) {
      //todo
      //todo
      //todo
      //todo
   }

   /***************************
    * Persistence (nowjs calls)
    ***************************/

   /** index.html **/

   // ping test
   now.ping = function(message) {
      console.log('ping received', message);
      var $alert = $('<div class="alert alert-info"></div>').text(message).prepend('<button class="close" data-dismiss="alert">×</button>').hide().prependTo('#pingbox').slideDown(500);
      _ack(message);

      setTimeout(function() {
         $alert.slideUp(1000);
      }, 5000);
   };

   /** chat.html **/

   // chat message received
   now.receive = function(name, msg) {
      $('#messages').append('<p>'+name+': '+$('<span />').text(msg).html()+'</p>');
   }

   /** ajax.html **/

   // change a user record
   now.update = function(json) {
      submodels.ajax.userUpdated(json);
   }

   // sync all user records
   now.syncUsers = function(json) {
      submodels.ajax.syncDataModel(json);
   }

   // sync server data about users (for comparison)
   now.serverUpdate = function(data) {
      console.log('update received from server');
      submodels.ajax.updateServerData(data);
   };

})(jQuery, window.now);