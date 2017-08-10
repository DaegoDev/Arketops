var arketops = angular.module('arketops');

arketops.directive('topbar', function() {
  return {
    restric: 'E',
    // transclude: true,
    templateUrl: 'templates/public/topbar.html',
    // scope: {
    //   toggle: '='
    // },
    controller: 'topbarCtrl'
  }
})

arketops.controller('topbarCtrl', ['$scope', '$cookieStore', '$ngConfirm', function($scope, $cookieStore, $ngConfirm) {
  $(document).ready(function() {
    $('.scrollspy').scrollSpy({
      scrollOffset:0
    });
  });

  $scope.formSignin = function () {
    $ngConfirm({
      title: 'Inicio de sesión',
      contentUrl: 'templates/public/signin.html',
      scope: $scope,
      theme: 'modern',
      // columnClass: 'medium',
      backgroundDismiss: true,
      useBootstrap: false,
      boxWidth: '40%',
      buttons: {
        signin: {
          text: 'Iniciar sesión',
          btnClass: 'btn-blue',
          keys: ['enter'],
          action: signin()
        },
        // Cancelar: function () {
        //
        // }
      }
    })
  };

  function signin() {

  }
  // var viewport = 992;
  // $scope.toggle = false;
  //
  // $scope.$watch($scope.getWidth, function(newValue, oldValue) {
  //   if (angular.isDefined($cookieStore.get('toggle'))) {
  //     $scope.toggle = !$cookieStore.get('toggle') ? false : true;
  //   } else {
  //     $scope.toggle = true;
  //   }
  // });
  // $scope.toggleSidebar = function() {
  //   $scope.toggle = !$scope.toggle;
  //   $cookieStore.put('toggle', $scope.toggle);
  // }
  // this.toggleSidebar = $scope.toggleSidebar;
  //
  // window.onresize = function() {
  //   $scope.$apply();
  // }
  //
  // $scope.role = AuthService.getRole();
  //
  // $scope.$on('renovateRole', function(evt) {
  //   $scope.role = AuthService.getRole();
  // });
  //
  // $scope.isClient = function() {
  //   return $scope.role === "CLIENTE";
  // };
  //
  // $scope.isAdmin = function() {
  //   return $scope.role === "ADMINISTRADOR";
  // };
  //
  // $scope.isEmployee = function() {
  //   if ($scope.role === "DESPACHADOR" || $scope.role === "ADMINISTRADOR") {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // };
  //
  // $scope.isDespachador = function() {
  //   return $scope.role === "DESPACHADOR";
  // };
}]);
