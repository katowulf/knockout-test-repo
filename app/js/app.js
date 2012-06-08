
function MainViewModel() {
   var self = this;

   self.viewPort = ko.observable("welcome");

   Sammy(function() {
      this.get('#:view', function() {
         var view = this.params.view;
         var model = view in submodels? submodels[view] : mainModel;
         self.viewPort(view);
         $('#viewPort').load('partials/'+view+'.html', function() {
            ko.applyBindings(model, this);
         });
      });

      this.get('', function() { this.app.runRoute('get', '#welcome') });
   }).run();

}

function AjaxViewModel() {
   var self = this;
   this.users = ko.observableArray();
   $.get(url+'/user/', function() {
      //todo
      //todo
      //todo
      //todo
   });
}

var submodels = {
   ajax: new AjaxViewModel()
};

function _ucFirst(txt) {
   return txt.substr(0,1).toUpperCase()+txt.substr(1);
}

var mainModel = new MainViewModel();
ko.applyBindings(mainModel);
