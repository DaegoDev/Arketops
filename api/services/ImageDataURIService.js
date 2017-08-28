
var imageDataURIModule = require('image-data-uri');

module.exports = {
  /**
  * Función para decodificar una imagen y guardarla.
  * @param  {String} valor data URI de la imagen.
  * @param  {String} valor Ruta donde se va a guardar la imagen.
  * @return {String}       Promesa con ruta donde se guardó.
  */
  decodeAndSave: function (dataURI, pathOutput) {
    return imageDataURIModule.outputFile(dataURI, pathOutput);
  },

  /**
  * Función para codificar una imagen a base64.
  * @param  {String} valor Ruta donde está la imagen.
  * @return {String}       Ruta donde se guardó.
  */
  encode: function (pathImage) {
    return imageDataURIModule.encodeFromFile(pathImage);
  }
}
