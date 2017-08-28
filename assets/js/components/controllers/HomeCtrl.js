(function() {
  var arketops = angular.module('arketops');

  arketops.controller('HomeCtrl', ['$scope', '$log', '$sce', 'GeographicSvc', 'CompanySvc', '$ngConfirm', 'AuthSvc',
    function($scope, $log, $sce, GeographicSvc, CompanySvc, $ngConfirm, AuthSvc) {

      $scope.termsAndConditions = 'NO';
      $scope.user = {};
      $scope.countries = {};
      $scope.departments = {};
      $scope.cities = {};
      $scope.countryCode = null;

      GeographicSvc.getCountriesByContinent()
      .then((res) => {
        $scope.countries = {
          choices: res.data,
          selected: res.data[0]
        };
      })

      $scope.getDepartments = function (countryCode) {
        $scope.countryCode = countryCode;
        GeographicSvc.getDepartmentsByCountry({
          country: countryCode,
          featureCode: 'ADM1',
          land: 'es',
          username: 'jonnatan328'
        })
        .then((res) => {
          $scope.departments = {
            choices: res.data.geonames,
            selected: res.data.geonames[0]
          }
        })
      }

      $scope.getCities = function (adminCode1) {
        GeographicSvc.getCitiesByDepartment({
          country: $scope.countryCode,
          featureCode: 'ADM2',
          adminCode1: adminCode1,
          username: 'jonnatan328'
        })
        .then((res) => {
          $scope.cities = {
            choices: res.data.geonames,
            selected: res.data.geonames[0]
          }
        })
      }

      // Verifica si el usuario está autenticado.
      $scope.authenticated = AuthSvc.isAuthenticated();

      $scope.$on('renovateRole', function(evt) {
        $scope.authenticated = AuthSvc.isAuthenticated();
      });

      // Función que se llama cuanto la imagen se carga.
      $scope.onLoad = function(e, reader, file, fileList, fileOjects, fileObj) {
        $scope.imgAvatarStyle = {'background-image': 'none'};
        $scope.fileObject = fileObj;
        $scope.user.imageDataURI = 'data:' + fileObj.filetype + ';base64,' + fileObj.base64;
      };

      // Error control variables.
      $scope.infoMsgOptions = {
        showMessage: false,
        message: '',
        type: 'error',
        title: ''
      }

      $scope.infoErrorMsg = '';

      // Función para registrar un usuario en el sistema.
      $scope.registerUser = function() {
        // Declaración de variables.
        var name = null;
        var nit = null;
        var businessOverview = null;
        var website = null;
        var email = null;
        var password = null;
        var rePassword = null;
        var country = null;
        var department = null;
        var city = null;
        var nomenclature = null;
        var phonenumber = null;
        var contact = null;
        var contactPhonenumber = null;
        var termsAndConditions = null;
        var imageFile = null;
        var imageDataURI = null;

        // Definición de variables.
        name = $scope.user.name;
        nit = $scope.user.nit;
        businessOverview = $scope.user.businessOverview;
        website = $scope.user.website;
        email = $scope.user.email;
        password = $scope.user.password;
        rePassword = $scope.user.rePassword
        country = $scope.countries.selected.name;
        department = $scope.departments.selected.adminName1;
        city = $scope.cities.selected.name;
        nomenclature = $scope.user.nomenclature;
        phonenumber = $scope.user.phonenumber;
        contact = $scope.user.contact;
        contactPhonenumber = $scope.user.contactPhonenumber;
        termsAndConditions = $scope.termsAndConditions;
        imageFile = $scope.user.imageFile;
        imageDataURI = $scope.user.imageDataURI;

        console.log($scope.termsAndConditions);


        // Validación de los datos ingresados.
        if (!name || !nit || !businessOverview || !email || !password || !rePassword || !country ||
          !department || !city || !nomenclature || !phonenumber || !contact || !contactPhonenumber ) {
            // || !termsAndConditions
          $scope.infoMsgOptions.message = 'Verifique que todos los datos se hayan ingresado correctamente.';
          $scope.infoMsgOptions.showMessage = true;
          return;
        }

        if (password.length < 6 || password !== rePassword) {
          $scope.infoMsgOptions.message = 'Verifique la contraseña y confirmela.';
          $scope.infoMsgOptions.showMessage = true;
          return;
        }

        // Credenciales para el registro de un usuario.
        var userCredentials = {
          name: name,
          nit: nit,
          businessOverview: businessOverview,
          website: website,
          email: email,
          password: password,
          country: country,
          department: department,
          city: city,
          nomenclature: nomenclature,
          phonenumber: phonenumber,
          contact: contact,
          contactPhonenumber: contactPhonenumber,
          imageDataURI: imageDataURI
        }

        $scope.signinup = true;
        CompanySvc.signup(userCredentials)
          .then(function(res) {

            // $scope.signingUp = false;
            // $scope.signupError = false;
            // $scope.signup.$setPristine();
            // $scope.signup.$setUntouched();
            console.log(res.data);
            $ngConfirm({
              title: 'Registro exitoso',
              content: 'Se ha enviado un correo de bienvenida a tu correo electronico.',
              type: 'green',
              typeAnimated: true,
              columnClass: 'medium',
              buttons: {
                accept: {
                  text: 'Aceptar',
                  btnClass: 'btn-green',
                  action: function() {
                    $scope.user= {};
                    $scope.formSignup.$setPristine();
                    $scope.formSignup.$setUntouched();
                    $scope.$apply();
                  }
                }
              }
            });
          })
          .catch(function(err) {
            console.log(err);
            if (err.status === 409) {
              $scope.alertMessage = "Error, el nombre de usuario ya está registrado."
            } else {
              $scope.alertMessage = "No se ha podido crear el empleado.";
            }
            $scope.signingUp = false;
            $scope.signupError = true;
            $scope.showAlert = true;
          })


      }


    }
  ]);
})();
