var arketops = angular.module('arketops');

arketops.directive('alertMessage', function() {
  return {
    restric: 'EA',
    templateUrl: 'templates/public/alert-message.html',
    scope: {
      options: '=',
    },
    controller: 'alertMessageCtrl'
  }
})

// Function to close the alert.
arketops.controller('alertMessageCtrl', ['$scope', '$log', function($scope, $log) {
  $scope.close = function() {
    $scope.options.showMessage = false;
  }
}]);
