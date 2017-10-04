/**
* ElementController
*
* @description :: Server-side logic for managing elements
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
*/

module.exports = {
  /**
  * Función para obtener todos los elementos.
  * @param  {Object} req Request object
  * @param  {Object} res Response object
  */
  getElements: function (req, res) {
    Element.findAll({
      include: [{model: ElementData}]
    })
    .then(function (resElement) {
      return res.ok(resElement);
    })
    .catch(function (err) {
      return res.serverError(err);
    })
  },
  /**
  * Función para crear un elemento de un producto.
  * @param  {Object} req Request object
  * @param  {Object} res Response object
  */
  getElementsByUser: function (req, res) {
    var user = req.user;
    Element.findAll({
      include: [
        {
          model: ElementData,
          include: [
            {model: ElementData, as: 'ElementParent'},
            {model: ElementData, as: 'ElementChildren'}
          ]
        }
      ]
    })
    .then(function (resElements) {
      return res.ok(resElements)
    })
    .catch(function (err) {
      return res.serverError(err);
    });
  },
  /**
  * Función para crear un elemento de un producto.
  * @param  {Object} req Request object
  * @param  {Object} res Response object
  */
  createElement: function(req, res) {
    // Declaración de variables.
    var name = null;
    var elementCredentials = null;

    // Definición de las variables y validaciones.
    name = req.param('name');
    if (!name) {
      return res.badRequest('Nombre del elemento vacío');
    }

    // Se contruye las credenciales para crear el elemento.
    elementCredentials = {
      name: name,
    }

    Element.create(elementCredentials)
    .then(function(element) {
      return res.created(element);
    })
    .catch(function(err) {
      return res.serverError(err);
    })
  },
  /**
  * Función para crear un valor de un elemento.
  * @param  {Object} req Request object
  * @param  {Object} res Response object
  */
  createElementData: function(req, res) {
    // Declaración de variables.
    var user = null;
    var name = null;
    var discount = null;
    var elementId = null;
    var elementDataCredentials = null;

    // Definición de las variables y validaciones.
    name = req.param('name');
    if (!name) {
      return res.badRequest('Nombre del dato del elemento vacío');
    }

    discount = req.param('discount');
    if (!discount) {
      return res.badRequest('Descuento del elemento vacío');
    }

    elementId = parseInt(req.param('elementId'));
    if (!elementId) {
      return res.badRequest('Id del elemento vacío');
    }

    user = req.user;

    // Se valida que el elemento con el id elementId exista.
    Element.findById(elementId)
    .then(function(element) {
      if (element) {
        return ElementData.findAll({where: {userId: user.id}});
      }
      throw "El elemento no existe";
    })
    .then(function (elementsData) {
      elementsData.forEach(function (elementData, index, elementsDataList) {
        if (elementData.name == name) {
          throw "Ya existe un elemento con ese nombre";
        }
      })
      // Se contruye las credenciales para crear el elemento.
      elementDataCredentials = {
        name: name,
        discount: discount,
        elementId: elementId,
        userId: user.id
      }
      return ElementData.create(elementDataCredentials);
    })
    .then(function(elementData) {
      res.created(elementData);
    })
    .catch(function(err) {
      res.serverError(err);
    })
  },
  /**
  * Función para crear una linea de una categoria.
  * @param  {Object} req Request object
  * @param  {Object} res Response object
  */
  createLinkedElementData: function(req, res) {
    // Declaración de variables.
    var name = null;
    var discount = null;
    var user = null;
    var dataParentId = null;
    var elementId = null;
    var elementDataCredentials = null;

    // Definición de las variables y validaciones.
    name = req.param('name');
    if (!name) {
      return res.badRequest('Nombre del dato del elemento vacío');
    }

    discount = req.param('discount');
    if (!discount) {
      return res.badRequest('Descuento del elemento vacío');
    }

    dataParentId = parseInt(req.param('dataParentId'));
    if (!dataParentId) {
      return res.badRequest('Id del padre vacío');
    }

    elementId = parseInt(req.param('elementId'));
    if (!elementId) {
      return res.badRequest('Id del elemento vacío');
    }

    user = req.user;

    return sequelize.transaction(function(t) {
      /* Wew will save the parent instance in this variable
       so we can assign it the child later.*/
      var parentInstance = null;

      // First let's find out if the parent data element exists.
      return ElementData.find({where: {id: dataParentId}})
      .then(function (elementData) {
        if (!elementData) {
          throw "El padre del elemento no existe."
        }

        parentInstance = elementData;
        // Then lets find ot if the element of the new elementData exists.
        return Element.find({where: {id: elementId}});
      })
      .then(function (element) {
        if (!element) {
          throw "El elemento del nuevo item no exite."
        }
        // Now we can create the new dataElement
        elementDataCredentials = {
            name: name,
            discount: discount,
            elementId: elementId,
            userId: user.id
        }
        sails.log.debug(elementDataCredentials)
        return ElementData.create(elementDataCredentials, {transaction: t})
      })
      .then(function (elementData) {
        if (!elementData) {
          throw "El nuevo item no ha sido creado."
        }
        // Finally when the new dataElement is created link it to the parent.
        return parentInstance.addElementChildren(elementData, {transaction: t});
      });

    }).then(function(result) {
      // Transaction has been commited
      return res.ok(result);
    })
    .catch(function(err) {
      return res.serverError(err);
    })
  },

  /**
  * Función para editar el descuento de un elemento.
  * @param  {Object} req Request object
  * @param  {Object} res Response object
  */
  editElementData: function (req, res) {
    // Declaración de variables.
    var name = null;
    var discount = null;
    var elementDataId = null;
    var user = null;
    var elementDataCredentials = null;

    // Definición de las variables y validaciones.
    name = req.param('name');
    if (!name) {
      return res.badRequest('Nombre del dato del elemento vacío');
    }

    discount = req.param('discount');
    if (!discount) {
      return res.badRequest('Descuento del elemento vacío');
    }

    elementDataId = parseInt(req.param('elementDataId'));
    if (!elementDataId) {
      return res.badRequest('Id del elemento vacío');
    }

    user = req.user;

    // Se valida que el elemento con el id elementId exista.
    ElementData.findById(elementDataId)
    .then(function(elementData) {
      if (elementData) {
        return Promise.all = [elementData, ElementData.findAll({where: {userId: user.id}})];
      }
      throw "El elemento no existe";
    })
    .spread(function (elementData, elementsData) {
      elementsData.forEach(function (elementData, index, elementsDataList) {
        if (elementData.name == name && elementData.id != elementDataId) {
          throw "Ya existe un elemento con ese nombre";
        }
      })
      // Se contruye las credenciales para crear el elemento.
      elementDataCredentials = {
        name: name,
        discount: discount,
      }
      return elementData.update(elementDataCredentials);
    })
    .then(function(elementData) {
      res.ok(elementData);
    })
    .catch(function(err) {
      res.serverError(err);
    })
  }
};
