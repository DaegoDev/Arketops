/**
 * ElementController
 *
 * @description :: Server-side logic for managing elements
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  /**
   * Función para crear un elemento de un producto.
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
  createLineForCategory: function(req, res) {
    // Declaración de variables.
    var name = null;
    var discount = null;
    var user = null;
    var elementId = null;
    var categoryId = null;
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

    categoryId = parseInt(req.param('categoryId'));
    if (!categoryId) {
      return res.badRequest('Id de la categoria vacío');
    }

    // user = req.user;
    user = {
      id: 1
    }

    return sequelize.transaction(function(t) {
        // Se valida que el elemento con el id elementId exista.
        return Element.findById(elementId, {transaction: t})
          .then(function(element) {
            if (element) {
              return ElementData.findAll({include: [Element], where: {id: categoryId}, transaction: t });
            }
            throw "El elemento no existe";
          })
          .then(function(category) {
            if (category[0] && category[0].Element.name == "categoria" ) {
              return Promise.all = [category[0], category[0].getElementsChildren({transaction: t})];
            }
            throw "La valor del elemento no es una categoría o no existe";
          })
          .spread(function (category, children) {
            sails.log.debug(children);
            children.forEach(function (child, index, childrenList) {
              if (child.name == name) {
                throw "La linea para la categoría ya existe";
              }
            })
            // Se contruye las credenciales para crear el elemento.
            elementDataCredentials = {
              name: name,
              discount: discount,
              elementId: elementId,
              userId: user.id
            }
            return Promise.all = [category, ElementData.create(elementDataCredentials, {transaction: t})]
          })
          .spread(function(category, elementData) {
            return category.addElementsChildren(elementData, {transaction: t})
          })
      }).then(function(result) {
        // Transaction has been committed
        res.ok(result);
      })
      .catch(function(err) {
        res.serverError(err);
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
