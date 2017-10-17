var arketops = angular.module('arketops');
arketops.controller('CompanyProfileCtrl', ['$scope', '$timeout', '$log', '$state', '$stateParams',
  'CompanySvc', 'GeographicSvc', 'orderByFilter', '$ngConfirm', 'HeadquartersSvc', 'AuthSvc',

  function($scope, $timeout, $log, $state, $stateParams, CompanySvc, GeographicSvc, orderBy,
    $ngConfirm, HeadquartersSvc, AuthSvc) {

    $scope.user = {};
    $scope.forms = {};
    $scope.departmentsHeadquarters = {};
    $scope.citiesHeadquarters = {};

    $scope.imgAvatarStyle = {
      'background-image': 'url("../../../images/no-image.jpg")',
      'background-size': '200px 200px',
      'z-index': 2
    }

    CompanySvc.getProfile()
      .then((res) => {
        $scope.user = res.data;
        // Flag to activate the function to update profile image.
        $scope.useWatch = false;
        // Save the rest of the company's headquarters.
        $scope.otherHeadquarters = [];
        // Verify what headquarters have the mark true in main field.
        $scope.user.Headquarters.forEach((headquarters, index, headquartersList) => {
          if (headquarters.main) {
            // Save de main headquarters.
            $scope.mainHeadquarters = headquarters;
          } else {
            $scope.otherHeadquarters.push(headquarters);
          }
        })

        // Flag to know if the modal with de form about headquarters is opened.
        $scope.formHeadquarters = false;

        // Get the countries of the world.
        $scope.getCountries = function() {
          GeographicSvc.getCountriesByContinent()
            .then((res) => {
              if ($scope.formHeadquarters) {
                $scope.countriesHeadquarters = {
                  choices: res.data,
                  selected: res.data[51]
                };
              } else {
                $scope.countries = {
                  choices: res.data,
                  selected: res.data[51]
                };
              }
              $scope.getDepartments($scope.countries.selected.alpha2Code);
            })
        }

        $scope.getCountries();

        // Get the first administratives divisions of a country.
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
              if ($scope.formHeadquarters) {
                if ($scope.headquartersToUpdate) {
                  console.log('why');
                  var n = departments.length
                  for (var i = 0; i < n; i++) {
                    if (departments[i].adminName1 == $scope.headquartersToUpdate.department) {
                      $scope.departmentsHeadquarters = {
                        choices: departments,
                        selected: departments[i]
                      }
                      break;
                    }
                  }
                  $scope.getCities($scope.departmentsHeadquarters.selected.adminCode1);
                } else {
                  $scope.departmentsHeadquarters = {
                    choices: departments,
                    selected: departments[0]
                  }
                }
              } else {
                departments.forEach(function(department, index, departmentList) {
                  if (department.adminName1 == $scope.mainHeadquarters.department) {
                    indexDepartment = index;
                  }
                })
                $scope.departments = {
                  choices: departments,
                  selected: departments[indexDepartment]
                }
                $scope.getCities($scope.departments.selected.adminCode1);
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
              var indexCity = null;
              if ($scope.formHeadquarters) {
                if ($scope.headquartersToUpdate) {
                  var n = cities.length
                  for (var i = 0; i < n; i++) {
                    if (cities[i].name == $scope.headquartersToUpdate.city) {
                      $scope.citiesHeadquarters = {
                        choices: cities,
                        selected: cities[i]
                      }
                      break;
                    }
                  }
                } else {
                  $scope.citiesHeadquarters = {
                    choices: cities,
                    selected: cities[0]
                  }
                }
              } else {
                cities.forEach(function(city, index, citiesList) {
                  if (city.name == $scope.mainHeadquarters.city) {
                    indexCity = index;
                  }
                })
                $scope.cities = {
                  choices: cities,
                  selected: cities[indexCity ? indexCity : 0]
                }
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

    $scope.confirmDeleteAccount = function () {
      $ngConfirm({
        title: 'Confirmación',
        content: '¿Realmente desea eliminar la cuenta?',
        type: 'red',
        boxWidth: '30%',
        useBootstrap: false,
        buttons: {
          cancel: {
            text: 'Cancelar',
            btnClass:'btn-red',
            action: function (scope, button) {

            }
          },
          confirm: {
            text: 'Confirmar',
            btnClass: 'btn-yellow',
            action: function (scope, button) {
              CompanySvc.deactivateAccount()
              .then((res) => {
                $ngConfirm({
                  title: 'Proceso exitoso',
                  content: 'Su cuenta se eliminó correctamente.',
                  boxWidth: '30%',
                  useBootstrap: false,
                  type: 'green',
                })
                AuthSvc.signout()
                $state.go('home');
              })
              .catch((err) => {
                $ngConfirm({
                  title: 'Error',
                  content: 'No se pudo eliminar la cuenta.',
                  boxWidth: '30%',
                  useBootstrap: false,
                })
              })
            }
          }
        }
      })
    }

    $scope.openFormHeadquarters = function(headquarters, indexInList) {
      $scope.formHeadquarters = true;
      if (headquarters) {
        $scope.headquartersToUpdate = headquarters;
        $scope.headquarters = headquarters;
      } else {
        $scope.headquarters = {};
      }
      $scope.getCountries();
      var modal = $ngConfirm({
        title: 'Formulario sede',
        contentUrl: 'templates/private/company/update-create-headquarters.html',
        type: 'orange',
        scope: $scope,
        onOpen: function(scope) {
          if (!headquarters) {
            this.buttons.update.setShow(false)
          } else {
            this.buttons.accept.setShow(false)
          }
        },
        buttons: {
          cancel: {
            text: 'Cancelar',
            btnClass: 'btn-red',
            action: function(scope, button) {
              $scope.formHeadquarters = false;
              $scope.headquartersToUpdate = false;
              $scope.citiesHeadquarters = {};
            }
          },
          accept: {
            text: 'Aceptar',
            btnClass: 'btn-yellow',
            keys: ['enter'],
            action: function(scope, button) {
              return createHeadquarters();
            }
          },
          update: {
            text: 'Actualizar',
            btnClass: 'btn-yellow',
            keys: ['enter'],
            action: function(scope, button) {
              return updateHeadquarters(headquarters.id, indexInList);
            }
          }
        }
      })

    }

    function createHeadquarters() {
      // Fields of headquarters.
      var countryHeadquarters = $scope.countriesHeadquarters.selected.name;
      var departmentHeadquarters = $scope.departmentsHeadquarters.selected;
      var cityHeadquarters = $scope.citiesHeadquarters;
      var nomenclatureHeadquarters = $scope.headquarters.nomenclature;
      var phonenumberHeadquarters = $scope.headquarters.phonenumber;
      var contactHeadquarters = $scope.headquarters.contact;
      var contactPhonenumberHeadquarters = $scope.headquarters.contactPhonenumber;

      var headquartersParams = {};

      // Validations to fields of headquarters.
      if (!countryHeadquarters || departmentHeadquarters.adminCode1 == -1 || !cityHeadquarters ||
        !nomenclatureHeadquarters || !phonenumberHeadquarters || !contactHeadquarters || !contactPhonenumberHeadquarters) {
        $ngConfirm('Debe ingresar los datos de la sede');
        return false;
      }
      $scope.formHeadquarters = false;

      cityHeadquarters = cityHeadquarters.selected.name;
      departmentHeadquarters = departmentHeadquarters.adminName1;

      headquartersParams = {
        country: countryHeadquarters,
        department: departmentHeadquarters,
        city: cityHeadquarters,
        nomenclature: nomenclatureHeadquarters,
        phonenumber: phonenumberHeadquarters,
        contact: contactHeadquarters,
        contactPhonenumber: contactPhonenumberHeadquarters,
      }

      HeadquartersSvc.create(headquartersParams)
        .then((res) => {
          console.log(res.data);
          $scope.otherHeadquarters.push(res.data)
        })
        .catch((err) => {

        })
    }

    function updateHeadquarters(headquartersId, indexInList) {
      // Fields of headquarters.
      var countryHeadquarters = $scope.countriesHeadquarters.selected.name;
      var departmentHeadquarters = $scope.departmentsHeadquarters.selected;
      var cityHeadquarters = $scope.citiesHeadquarters;
      var nomenclatureHeadquarters = $scope.headquarters.nomenclature;
      var phonenumberHeadquarters = $scope.headquarters.phonenumber;
      var contactHeadquarters = $scope.headquarters.contact;
      var contactPhonenumberHeadquarters = $scope.headquarters.contactPhonenumber;

      var headquartersParams = {};

      // Validations to fields of headquarters.
      if (!countryHeadquarters || departmentHeadquarters.adminCode1 == -1 || !cityHeadquarters ||
        !nomenclatureHeadquarters || !phonenumberHeadquarters || !contactHeadquarters || !contactPhonenumberHeadquarters) {
        Materialize.toast('Debe ingresar los datos de la sede', 4000, 'red darken-1 rounded')
        return false;
      }
      $scope.formHeadquarters = false;

      cityHeadquarters = cityHeadquarters.selected.name;
      departmentHeadquarters = departmentHeadquarters.adminName1;

      headquartersParams = {
        country: countryHeadquarters,
        department: departmentHeadquarters,
        city: cityHeadquarters,
        nomenclature: nomenclatureHeadquarters,
        phonenumber: phonenumberHeadquarters,
        contact: contactHeadquarters,
        contactPhonenumber: contactPhonenumberHeadquarters,
        headquartersId: headquartersId
      }
      $scope.citiesHeadquarters = {};
      HeadquartersSvc.update(headquartersParams)
        .then((res) => {
          $scope.otherHeadquarters[indexInList] = res.data
          console.log(res.data);
          console.log(indexInList);
          $scope.headquartersToUpdate = false;
        })
        .catch((err) => {

        })
    }

    $scope.confirmDelete = function (headquartersId, indexInList) {
      $ngConfirm({
        title: '¿Desea borrar esta sede?',
        content: 'Si desea borrar la sede presione confirmar, de lo contrario presione cancelar.',
        type: 'red',
        buttons: {
          cancel: {
            text: 'Cancelar',
            btnClass: 'btn-red',
            action: function () {

            }
          },
          confirm: {
            text: 'Confirmar',
            btnClass: 'btn-yellow',
            action: function (scope, button) {
              deleteHeadquarters(headquartersId, indexInList);
            }
          }
        }
      })
    }

    function deleteHeadquarters(headquartersId, indexInList) {
      HeadquartersSvc.delete({headquartersId: headquartersId})
      .then((res) => {
        $scope.otherHeadquarters.splice(indexInList, 1);
      })
      .catch((err) => {
        Materialize.toast('No se pudo borrar la sede.', 4000, 'red darken-1 rounded')
      })
    }


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
          Materialize.toast('Se cambió la contraseña.', 4000, 'green darken-1 rounded');
          $scope.forms.formChangePws.$setPristine();
          $scope.forms.formChangePws.$setUntouched();
          $scope.user.oldPassword = "";
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
      nomenclature = $scope.mainHeadquarters.nomenclature;
      phonenumber = $scope.mainHeadquarters.phonenumber;
      contact = $scope.mainHeadquarters.contact;
      contactPhonenumber = $scope.mainHeadquarters.contactPhonenumber;

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
