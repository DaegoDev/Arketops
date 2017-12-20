var arketops = angular.module('arketops');
arketops.controller('RecoverPasswordCtrl', ['$scope', '$log', '$ngConfirm', '$state', '$stateParams', 'CompanySvc', 'RecoverPasswordSvc',
  function($scope, $log, $ngConfirm, $state, $stateParams, CompanySvc, RecoverPasswordSvc) {

    // Función para iniciar el proceso de recuperar la contraseña de una empresa.
    $scope.getToken = function() {
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
      $scope.user.isRequesting = true;
      RecoverPasswordSvc.startRecover(credentials)
        .then(function(res) {
          $scope.token = res.data;
          $scope.user.isRequesting = false;
          $scope.waitingCode = true;
          $scope.user = {};
          Materialize.toast('Se envió a su correo el código para cambiar la contraseña.', 6000, 'green darken-1 rounded')
        })
        .catch(function(err) {
          $scope.user.isRequesting = false;
          Materialize.toast('Error, el correo electrónico ingresado no existe.', 6000, 'red darken-1 rounded');
        });
    }

    // Función para recuperar contraseña de una empresa.
    $scope.recoverPassword = function() {
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
      $scope.user.isRequesting = true;
      //Llamado al servicio de recuperar contraseña de una empresa.
      RecoverPasswordSvc.recoverPassword(request, $scope.token)
        .then(function(res) {
          $scope.user.isRequesting = false;
          $state.go('home');
          $ngConfirm({
            title: 'Se recuperó la contraseña.',
            content: "Se ha enviado la nueva contraseña a su correo electronico.",
            boxWidth: '30%',
            useBootstrap: false,
            type: 'green',
            typeAnimated: true,
            theme: 'light',
          });
          $scope.user = {};
          $scope.sending = false;
        })
        .catch(function(err) {
          $scope.user.isRequesting = false;
          Materialize.toast('El codigo ingresado es incorrecto.', 6000, 'red darken-1 rounded');
        });
    };

  }
]);
