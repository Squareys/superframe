/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

	var LOADING_MODELS = {};
	var MODELS = {};

	AFRAME.registerComponent('gltf-part', {
	  schema: {
	    buffer: {default: true},
	    part: {type: 'string'},
	    src: {type: 'asset'}
	  },

	  update: function () {
	    var el = this.el;
	    var sceneEl = document.querySelector('a-scene');
	    if (!this.data.part && this.data.src) { return; }

	    this.getModel(function (modelPart) {
	      if (!modelPart) { return; }

	      sceneEl.systems['material'].registerMaterial(modelPart.material);
	      el.setObject3D('mesh', modelPart)
	      el.emit('model-loaded', {format: 'gltf', model: modelPart});
	    });
	  },

	  /**
	   * Fetch, cache, and select from GLTF.
	   *
	   * @returns {object} Selected subset of model.
	   */
	  getModel: function (cb) {
	    var self = this;

	    // Already parsed, grab it.
	    if (MODELS[this.data.src]) {
	      cb(this.selectFromModel(MODELS[this.data.src]));
	      return;
	    }

	    // Currently loading, wait for it.
	    if (LOADING_MODELS[this.data.src]) {
	      return LOADING_MODELS[this.data.src].then(function (model) {
	        cb(self.selectFromModel(model));
	      });
	    }

	    // Not yet fetching, fetch it.
	    LOADING_MODELS[this.data.src] = new Promise(function (resolve) {
	      new THREE.GLTFLoader().load(self.data.src, function (gltfModel) {
	        var model = gltfModel.scene || gltfModel.scenes[0];
	        MODELS[self.data.src] = model;
	        delete LOADING_MODELS[self.data.src];
	        cb(self.selectFromModel(model));
	        resolve(model);
	      }, function () {}, function gltfFailed (error) {
	        var message = (error && error.message) ? error.message : 'Failed to load glTF model';
	        console.warn(message);
	        this.el.emit('model-error', {format: 'gltf', src: self.data.src});
	      }.bind(self));
	    });
	  },

	  /**
	   * Search for the part name and look for a mesh.
	   */
	  selectFromModel: function (model) {
	    var part;

	    part = model.getObjectByName(this.data.part);
	    if (!part) {
	      console.error('[gltf-part] `' + this.data.part + '` not found in model.');
	      return;
	    }

	    var meshObject = part.getObjectByProperty('type', 'Mesh');
	    if(!meshObject) {
	      console.error('[gltf-part] `' + this.data.part + '` has no Mesh.');
	      return;
	    }
	      return new THREE.Mesh(meshObject.geometry, meshObject.material);
	  }
	});


/***/ })
/******/ ]);