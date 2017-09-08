var arketops = angular.module('arketops');
arketops.controller('RecoverPasswordCtrl', ['$scope', '$log', '$state', '$stateParams', 'CompanySvc', 'RecoverPasswordSvc',
  function($scope, $log, $state, $stateParams, CompanySvc, RecoverPasswordSvc) {

    // Función para iniciar el proceso de recuperar la contraseña de una empresa.
    $scope.getToken = function () {
      //Definición de variables.
      var email = null;
      var credentials = null;
      // Validaciones del formulario.
      email = $scope.user.email;
      if (!email) {
        return;
      }
      credentials = {
        email: email
      };
      $scope.sending = true;
      RecoverPasswordSvc.startRecover(credentials)
      .then(function(res) {
        $scope.token = res.data;
        $scope.sending = false;
        $scope.waitingCode = true;
        Materialize.toast('Se envió a su correo el código para cambiar la contraseña.', 6000,'green darken-1 rounded')
      })
      .catch(function(err) {
        Materialize.toast('Error, el correo electrónico ingresado no existe.', 6000,'red darken-1 rounded');
        $scope.sending = false;
      });
    }

    // Función para recuperar contraseña de una empresa.
    $scope.recoverPassword = function () {
      //Definición de variables.
      var code = null;
      var request = null;
      // Validaciones del formulario.
      console.log($scope.user);
      if (!$scope.user) {
        return;
      }
      code = $scope.user.code;
      if (!code) {
        return;
      }

      request = {
        code: code,
      }

      console.log($scope.token);
      $scope.sending = true;
      //Llamado al servicio de recuperar contraseña de una empresa.
      RecoverPasswordSvc.recoverPassword(request, $scope.token)
      .then(function(res) {
        // $state.go('contrasenaReestablecida');
        $scope.sending = false;
      })
      .catch(function(err) {
        Materialize.toast('El codigo ingresado es incorrecto.', 6000,'red darken-1 rounded');
        $scope.sending = false;
      });
    };

  }
]);
