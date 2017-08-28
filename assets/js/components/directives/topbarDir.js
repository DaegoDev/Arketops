var arketops = angular.module('arketops');

arketops.directive('topbar', function() {
  return {
    restric: 'E',
    templateUrl: 'templates/public/topbar.html',
    controller: 'topbarCtrl'
  }
})

arketops.controller('topbarCtrl', ['$scope', '$cookieStore', '$ngConfirm', 'AuthSvc', '$interval', '$state', function($scope, $cookieStore, $ngConfirm, AuthSvc, $interval, $state) {
  $(document).ready(function() {
    $('.scrollspy').scrollSpy({
      scrollOffset:0
    });
  });

  $scope.user = {};

  // variable que guarda el estilo de la sección de busqueda.
  $scope.searchNavStyle = {};

  // Variable para verificar que el usuario esté autenticado.
  $scope.authenticated = AuthSvc.isAuthenticated();

  $scope.$on('renovateRole', function(evt) {
    $scope.authenticated = AuthSvc.isAuthenticated();
  });

  // Opciones para el select de busqueda.
  $scope.filters = {
    choices: ['Todo', 'Empresa', 'Producto'],
    selected: "Todo"
  }

  // Función para cerrar cesión.
  $scope.signout = function() {
    AuthSvc.signout();
  }

  // Función que despliega la sección de busqueda.
  $scope.openSearchNav = function () {
    $scope.searchNavStyle.height == '20%' ? $scope.searchNavStyle.height = '0%' : $scope.searchNavStyle.height = '20%';
  }

  // Función que oculta la sección de busqueda.
  $scope.closeSearchNav = function () {
    $scope.searchNavStyle = {
      height: '0%'
    }
  }

  // Muestra la vista con los resultados de la busqueda.
  $scope.showResults = function () {
    var searchValue = $scope.searchValue;
    var filter = $scope.filters.selected;
    console.log($scope.filters.selected);
    if (!searchValue) {
      return;
    }
    $scope.closeSearchNav();
    $state.go('showResults', {searchValue: searchValue, filter: filter});
  }

  $scope.openModal = false;

  $scope.modalReady = function () {
    $scope.openModal = true;
    console.log("modalReady");
    console.log($scope.openModal);
  }

  $scope.modalComplete = function () {
    $scope.openModal = false;
    console.log("modalComplete");
    console.log($scope.openModal);
  }

  this.openModal = $scope.openModal;

  // $scope.closeModal = function () {
  //   $scope.openModal = false;
  //   console.log("closeModal");
  //   console.log($scope.openModal);
  // }
  //
  // this.closeModal = $scope.closeModal;


  // $interval(function() {
  //   console.log($scope.openModal);
  //   $scope.openModal = false;
  // } , 5000)


}]);
