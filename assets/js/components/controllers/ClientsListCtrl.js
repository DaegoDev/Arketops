var arketops = angular.module('arketops');
arketops.controller('ClientsListCtrl', ['$scope', '$log', '$state', '$stateParams',
  '$ngConfirm', 'CompanySvc', 'StorageSvc',
  function($scope, $log, $state, $stateParams, $ngConfirm, CompanySvc, StorageSvc) {
    // Variables needed
    $scope.clients = [];

    CompanySvc.getClients()
    .then((res) => {
      $scope.clients = res.data;
      console.log(res.data);
    })
    .catch((err) => {
      console.log(err);
    })

    $scope.showDetails = function (client) {
      var clientToSend = JSON.stringify(client);
      StorageSvc.set('clientSelected', clientToSend, 'session');
      $state.go('clientDetails');
    }
  }
]);
