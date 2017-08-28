var arketops = angular.module('arketops');

arketops.directive('signinForm', function() {
  return {
    restric: 'E',
    require: '^topbar',
    templateUrl: 'templates/public/signin.html',
    controller: 'signinCtrl',
    link: function(scope, element, attrs, parentCtrl) {
      // scope.closeModal = parentCtrl.closeModal;
      scope.openModal = parentCtrl.openModal;
    }
  }
})

arketops.controller('signinCtrl', ['$scope', '$cookieStore', '$log', 'AuthSvc',
  function($scope,  $cookieStore, $log, AuthSvc) {
  $scope.user = {};

  // $scope.closeModalF = function () {
  //   $scope.closeModal();
  // }

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
        $scope.openModal = false;
        // $scope.closeModalF()
        console.log(result.data);
        // $scope.signing = false;
        // $scope.user = {};
        // $scope.loginError = false;
        // $state.go('home');
        // role = AuthService.getRole().toUpperCase();
        // if (role === "ADMINISTRADOR") {
        //   $state.go('admin');
        // } else if (role === "DESPACHADOR") {
        //   $state.go('despachador');
        // } else if (role === "CLIENTE") {
        //   $state.go('clientRole');
        // }
      })
      .catch(function(err) {
        // $scope.openModal = false;
        // $scope.closeModalF()
        $scope.user.password = '';
        $scope.signing = false;
        $scope.loginError = true;
        $scope.errorMessage = "No se ha podido iniciar sesión, verifique su nombre de usuario o contraseña.";
      });
  };

  // switch flag
  $scope.switchError = function(value) {
    $scope[value] = !$scope[value];
  };
}]);
