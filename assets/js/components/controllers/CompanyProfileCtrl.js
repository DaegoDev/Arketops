var arketops = angular.module('arketops');
arketops.controller('CompanyProfileCtrl', ['$scope', '$log', '$state', '$stateParams', 'CompanySvc', 'GeographicSvc', 'orderByFilter', '$ngConfirm',

  function($scope, $log, $state, $stateParams, CompanySvc, GeographicSvc, orderBy, $ngConfirm) {

    $scope.user = {};
    $scope.forms = {};

    $scope.imgAvatarStyle = {
      'background-image': 'url("../../../images/no-image.jpg")',
      'background-size': '200px 200px',
      'z-index': 2
    }

    CompanySvc.getProfile()
      .then((res) => {
        $scope.user = res.data;
        $scope.useWatch = false;
        console.log($scope.user);
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
              var indexDepartment = null;
              departments.unshift({
                adminName1: 'Seleccione...',
                adminCode1: -1
              });
              departments.forEach(function(department, index, departmentList) {
                if (department.adminName1 == $scope.user.Headquarters[0].department) {
                  indexDepartment = index;
                }
              })
              $scope.departments = {
                choices: departments,
                selected: departments[indexDepartment]
              }
              $scope.getCities($scope.departments.selected.adminCode1);
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
              var indexCity = null;
              cities.forEach(function(city, index, citiesList) {
                if (city.name == $scope.user.Headquarters[0].city) {
                  indexCity = index;
                }
              })
              $scope.cities = {
                choices: cities,
                selected: cities[indexCity]
              }
            })
        }
      })

    // Función que se llama cuando la imagen se carga.
    $scope.onLoad = function(e, reader, file, fileList, fileOjects, fileObj) {
      $scope.useWatch = true;
      $scope.imgAvatarStyle = {
        'background-image': 'none'
      };
      $scope.user.imageURI = 'data:' + fileObj.filetype + ';base64,' + fileObj.base64;
    };

    $scope.$watch('user.imageURI', function(newValue, oldValue) {
      if ($scope.useWatch) {
        CompanySvc.updateImageProfile({
          imageDataURI: newValue
        })
        .then((res) => {
          Materialize.toast('Se actualizó la imagen correctamente.', 4000, 'green darken-1 rounded')
        })
        .catch((err) => {
          Materialize.toast('No se pudo cambiar la imagen.', 4000, 'red darken-1 rounded');
        })
      }
    });



    // Función que llama el servicio para cambiar la contraseña.
    $scope.changePassword = function() {
      // Declaración de variables.
      var oldPassword = null;
      var newPassword = null;
      var reNewPassword = null;

      //Definición de las variables.
      oldPassword = $scope.user.oldPassword;
      newPassword = $scope.user.newPassword;
      reNewPassword = $scope.user.reNewPassword;

      if (!oldPassword || !newPassword || !reNewPassword || (newPassword < 6) ||
        (reNewPassword < 6) || (newPassword != reNewPassword)) {
        return;
      }

      //Parametros que se envian.
      var paramsChangePws = {
        currentPassword: oldPassword,
        newPassword: newPassword
      }

      CompanySvc.updatePassword(paramsChangePws)
        .then((res) => {
          $ngConfirm('Se cambió la contraseña');
          $scope.user.currentPassword = "";
          $scope.user.newPassword = "";
          $scope.user.reNewPassword = "";
        })
        .catch((err) => {
          Materialize.toast('No se pudo cambiar la contraseña.', 4000, 'red darken-1 rounded');
          console.log(err);
        })


    }

    // Función que llama el servicio para actualizar los datos de un usuario.
    $scope.updateData = function() {
      //Declaración de variables
      var name = null;
      var nit = null;
      var businessOverview = null;
      var website = null;
      var email = null;
      var country = null;
      var department = null;
      var city = null;
      var nomenclature = null;
      var phonenumber = null;
      var contact = null;
      var contactPhonenumber = null;

      // Definición de las variables.
      name = $scope.user.name;
      nit = $scope.user.nit;
      businessOverview = $scope.user.businessOverview;
      website = $scope.user.website;
      email = $scope.user.User.email;
      country = $scope.countries.selected.name;
      department = $scope.departments.selected.adminName1;
      city = $scope.cities.selected.name;
      nomenclature = $scope.user.Headquarters[0].nomenclature;
      phonenumber = $scope.user.Headquarters[0].phonenumber;
      contact = $scope.user.Headquarters[0].contact;
      contactPhonenumber = $scope.user.Headquarters[0].contactPhonenumber;

      // Validación de los datos ingresados.
      if (!name || !nit || !businessOverview || !email || !country ||
        !nomenclature || !phonenumber || !contact || !contactPhonenumber) {
        Materialize.toast('Verifique que todos los datos se hayan ingresado correctamente.', 4000, 'red darken-1 rounded')
        return;
      }

      // Parametros que se enviarán para la actualización del usuario.
      var paramsToUpdate = {
        name: name,
        nit: nit,
        businessOverview: businessOverview,
        website: website,
        email: email,
        country: country,
        department: department,
        city: city,
        nomenclature: nomenclature,
        phonenumber: phonenumber,
        contact: contact,
        contactPhonenumber: contactPhonenumber,
      }

      // Llama al servicio que actualiza los datos del cliente.
      CompanySvc.updateData(paramsToUpdate)
        .then((res) => {
          console.log(res.data);
          Materialize.toast('Se actualizó correctamente.', 4000, 'green darken-1 rounded')
        })
        .catch((err) => {
          console.log(err);
        })

    }


  }
]);
