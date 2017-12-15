var arketops = angular.module('arketops');

arketops.directive('onFinishRender', ['$timeout', function($timeout) {
  return {
    restric: 'A',
    link: function(scope, element, attr) {
      if (scope.$last === true) {
        $timeout(function() {
          $('.materialize-textarea').trigger('autoresize');
        });
      }
    }
  }
}]);
