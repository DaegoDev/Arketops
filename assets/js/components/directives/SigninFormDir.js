var arketops = angular.module('arketops');

arketops.directive('signinForm', function() {
  return {
    restric: 'E',
    // require: '^topbar',
    templateUrl: 'templates/public/signin.html',
    controller: 'signinCtrl',
    // link: function(scope, element, attrs, parentCtrl) {
    //
    // }
  }
})

arketops.controller('signinCtrl', ['$scope', '$state', '$cookieStore', '$log', 'AuthSvc',
  function($scope, $state, $cookieStore, $log, AuthSvc) {

  $scope.user = {};

  $scope.toFormRecoverPws = function () {
    $scope.closeModal();
    $state.go('recoverPassword')
  }

  // Función para el inicio de sesión de un usuario.
  $scope.signinUser = function() {
    //Definición de variables.
    var email = null;
    var password = null;
    var credentials = null;

    // Validaciones del formulario.
    if (!$scope.user) {
      return;
    }

    email = $scope.user.email;
    if (!email) {
      return;
    }

    password = $scope.user.password;
    if (!password) {
      return;
    }
    //Inicialización de las credenciales de inicio de sesión.
    credentials = {
      email: email,
      password: password
    };

    $scope.signing = true;

    //Llamado al servicio de signin de usuario.
    AuthSvc.signinUser(credentials)
      .then(function(result) {
        $scope.signing = false;
        $scope.closeModal();
        $scope.user = {};
        console.log($scope.closeModal);
        // $state.go('home');
      })
      .catch(function(err) {
        Materialize.toast('No se ha podido iniciar sesión, verifique su nombre de usuario o contraseña.', 4000,'rounded')
        $scope.signing = false;
        $scope.user.password = '';
        //$scope.closeModal();
        // $scope.signing = false;
        // $scope.loginError = true;
        // $scope.errorMessage = "No se ha podido iniciar sesión, verifique su nombre de usuario o contraseña.";
      });
  };

  // switch flag
  $scope.switchError = function(value) {
    $scope[value] = !$scope[value];
  };
}]);
