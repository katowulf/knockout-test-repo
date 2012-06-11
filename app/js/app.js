(function($) {

   /*************************
    * Control Logic
    *************************/

   var submodels = {
      ajax: new AjaxViewModel()
   };

   var mainModel = new MainViewModel();
   ko.applyBindings(mainModel);


   /*************************
    * Models
    *************************/

   function MainViewModel() {
      var self = this;

      self.viewPort = ko.observable("welcome");

      self.getTime = function() {
         return moment().format('HH:mm:ss');
      };

      $.each(['home', 'ajax', 'grid', 'base', 'components'], function(i, k) {
          Path.map('#'+k).to(function() { _navRoute(k, self); });
      });

      Path.rescue(function() {
         alert('Did not find that route');
      });

      Path.root('#home');

      Path.listen();

      //todo path google analytics

   }

   function AjaxViewModel() {
      var self = this, apiUrl = 'http://localhost:3000';
      this.users = ko.observableArray();
      this.serverData = ko.observable('loading...');

      $.ajax({
         url: apiUrl+'/test/user/',
         dataType: 'json'
      })
      .then(
         function(json){ // success
            // do stuff with json (in this case an array)
            var mappedUsers = $.map(json, function(user) { return new User(user); });
            self.users(mappedUsers);
            self.updateServerData(json);
         },
         function(e){ // failure
            console.error(e);
         }
      );

      self.removeUser = function(user) {
         self.users.remove(user);
         if( user.id() ) { // new records don't have a user id
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
               function(e){ // failure
                  console.error(e);
               }
            );
         }
      };

      self.addUserForm = function(form) {
         var $form = $(form), $first = $form.find('input[name="fname"]'), $last = $form.find('input[name="lname"]');
         var user = new User($.extend({id: null, counter: 0}, {fname: $first.val(), lname: $last.val()}));
         self.addUser(user);
         $.ajax({
            url: apiUrl+'/test/user/',
            data: ko.toJS(user),
            type: 'POST',
            dataType: 'json'
         })
         .then(
         function(json){ // success
            // do stuff with json (in this case an array)
            if( json.s === 1 ) {
               $.each(['id', 'fname', 'lname', 'counter'], function(i, k) {
                  user[k](json.user[k]);
               });
            }
            else { console.error(json.m); }
         },
         function(e){ // failure
            console.error(e);
         });
         return false;
      };

      self.addUser = function(user) {
         self.users.push(user);
      };

      self.updateServerData = function(json) {
         self.serverData(JSON.stringify(json, null, 2));
      }

   }

   function User(data) {
      var self = this;
      self.id = ko.observable(data.id);
      self.fname = ko.observable(data.fname);
      self.lname = ko.observable(data.lname);
      self.counter = ko.observable(data.counter);
      self.fullName = ko.computed(function() { return self.fname() + ' ' + self.lname() })

      self.createNameForm = function(user) {

      }

      self.updateName = function(form) {
         var $form = $(form), $first = $form.find('input[name="fname"]'), $last = $form.find('input[name="lname"]');
         var user = self;
         //todo combine with AjaxViewModel::addUserForm
         $.ajax({
            url: apiUrl+'/test/user/',
            data: ko.toJS(user),
            type: 'PUT',
            dataType: 'json'
         })
            .then(
            function(json){ // success
               // do stuff with json (in this case an array)
               if( json.s === 1 ) {
                  $.each(['id', 'fname', 'lname', 'counter'], function(i, k) {
                     user[k](json.user[k]);
                  });
               }
               else { console.error(json.m); }
            },
            function(e){ // failure
               console.error(e);
            });
         return false;
      }

   }

   /*************************
    * Custom Bindings
    *************************/

   /**
    * Renders first/last name form for updating a user account
    */
   ko.bindingsHandler.editUserForm = {
      init: function() {
         return { 'controlsDescendantBindings': true };
      },
      update: function(element, viewModelAccessor, allBindingsAccessor) {
         var $e = $(element), form = $e.data('updateUserForm'), viewModel = viewModelAccessor(), allBindings = allBindingsAccessor();

         if( !form ) {
            //todo templateEngine = new ko.nativeTemplateEngine();
            //todo ko.renderTemplate(...)
         }

      }
   }

   /*************************
    * Utility Functions
    *************************/

   function _navRoute(view, mainModel) {
      console.log('mapped to ', view);
      var model = view in submodels? submodels[view] : mainModel;
      mainModel.viewPort(view);
      $('#viewPort').load('partials/'+view+'.html', function() {
         ko.applyBindings(model, this);
      });
   }


      window.now.ping = function(text) {
         console.log('pinged!', text);
         setTimeout(function() {
            console.log('ack');
            _ack(text);
         }, 100);
      };

      function _ack(text) {
         console.log('acking!');
         window.now.ack(text);
      }

   window.now.update = function(data) {
      console.log('update received from server');
      submodels.ajax.updateServerData(data);
   };

})(jQuery);