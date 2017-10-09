(function() {
  var arketops = angular.module('arketops');

  arketops.controller('HomeCtrl', ['$scope', '$log', '$sce', 'GeographicSvc', 'CompanySvc', '$ngConfirm', 'AuthSvc', 'orderByFilter',
    function($scope, $log, $sce, GeographicSvc, CompanySvc, $ngConfirm, AuthSvc, orderBy) {

      $scope.termsAndConditions = false;
      $scope.user = {};
      $scope.countries = {};
      $scope.departments = {};
      $scope.cities = {};
      $scope.countryCode = null;

      $scope.forms = {};

      // Se obtiene los paises del mundo.
      GeographicSvc.getCountriesByContinent()
        .then((res) => {
          $scope.countries = {
            choices: res.data,
            selected: res.data[51]
          };
          $scope.getDepartments($scope.countries.selected.alpha2Code);
        })

      // Se obtiene las primeras divisiones administrativas de un país.
      $scope.getDepartments = function(countryCode) {
        $scope.countryCode = countryCode;
        GeographicSvc.getDepartmentsByCountry({
            country: countryCode,
            featureCode: 'ADM1',
            land: 'es',
            username: 'jonnatan328'
          })
          .then((res) => {
            var departments = orderBy(res.data.geonames, 'adminName1');
            departments.unshift({
              adminName1: 'Seleccione...',
              adminCode1: -1
            });
            $scope.departments = {
              choices: departments,
              selected: departments[0]
            }
          })
      }

      // Se obtienen las segundas divisiones administrativas de un país.
      $scope.getCities = function(adminCode1) {
        GeographicSvc.getCitiesByDepartment({
            country: $scope.countryCode,
            featureCode: 'ADM2',
            adminCode1: adminCode1,
            username: 'jonnatan328'
          })
          .then((res) => {
            var cities = orderBy(res.data.geonames, 'name');
            $scope.cities = {
              choices: cities,
              selected: cities[0]
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
        $scope.imgAvatarStyle = {
          'background-image': 'none'
        };
        $scope.user.imageDataURI = 'data:' + fileObj.filetype + ';base64,' + fileObj.base64;
      };


      // Función que cambia el valor del checkbox de terminos y condiciones.
      $scope.switchValueCheckbox = function() {
        $scope.termsAndConditions = !$scope.termsAndConditions;
      }


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
        department = $scope.departments.selected;
        city = $scope.cities.selected;
        nomenclature = $scope.user.nomenclature;
        phonenumber = $scope.user.phonenumber;
        contact = $scope.user.contact;
        contactPhonenumber = $scope.user.contactPhonenumber;
        termsAndConditions = $scope.termsAndConditions;
        imageFile = $scope.user.imageFile;
        imageDataURI = $scope.user.imageDataURI;

        // Validación de los datos ingresados.
        if (!name || !nit || !businessOverview || !email || !password || !rePassword || !country ||
          department.adminCode1 == -1 || !city || !nomenclature || !phonenumber || !contact || !contactPhonenumber) {
          Materialize.toast('Verifique que todos los datos se hayan ingresado correctamente.', 4000, 'red darken-1 rounded')
          return;
        }

        if (!termsAndConditions) {
          Materialize.toast('Debe aceptar terminos y condiciones.', 4000, 'red darken-1 rounded')
          return;
        }

        city = city.name;
        department = department.adminName1;

        if (password.length < 6 || password !== rePassword) {
          Materialize.toast('Verifique la contraseña y confirmela.', 4000, 'red darken-1 rounded')
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
            $scope.signingUp = false;
            $scope.forms.formSignup.$setPristine();
            $scope.forms.formSignup.$setUntouched();
            $ngConfirm({
              title: 'Registro exitoso',
              content: 'Se ha enviado un correo de bienvenida a tu correo electronico.',
              type: 'green',
              typeAnimated: true,
              boxWidth: '40%',
              columnClass: 'medium',
              buttons: {
                accept: {
                  text: 'Aceptar',
                  btnClass: 'btn-green',
                  action: function() {
                    $scope.user = {};
                    $scope.switchValueCheckbox();
                    $scope.user.imageDataURI = '';
                    $scope.imgAvatarStyle = {
                      'background-image': '../../../images/no-image.jpg'
                    };
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
          })


      }


    }
  ]);
})();
