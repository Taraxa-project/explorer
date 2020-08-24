module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = require('../../../ssr-module-cache.js');
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete installedModules[moduleId];
/******/ 		}
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./pages/api/tx/[id].js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./models/tx.js":
/*!**********************!*\
  !*** ./models/tx.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("const mongoose = __webpack_require__(/*! mongoose */ \"mongoose\");\n\nconst Tx = new mongoose.Schema({\n  _id: {\n    type: String\n  },\n  // tx hash\n  blockHash: {\n    type: String,\n    ref: 'Block',\n    index: true\n  },\n  blockNumber: {\n    type: Number,\n    index: true\n  },\n  from: {\n    type: String,\n    index: true\n  },\n  gas: {\n    type: Number\n  },\n  gasPrice: {\n    type: Number\n  },\n  input: {\n    type: String\n  },\n  nonce: {\n    type: Number\n  },\n  to: {\n    type: String,\n    index: true\n  },\n  transactionIndex: {\n    type: Number\n  },\n  value: {\n    type: Number\n  },\n  //not in rpc\n  timestamp: {\n    type: Date,\n    default: Date.now\n  } //override with block timestamp on finality\n\n});\n\nTx.statics.fromRPC = function fromRPC(data) {\n  const json = Object.assign({}, data); // using hash as primary key\n\n  json._id = json.hash;\n  delete json.hash;\n  const hexKeys = ['blockNumber', 'gas', 'gasPrice', 'nonce', 'value', 'timestamp'];\n  hexKeys.forEach(key => {\n    if (json[key]) {\n      json[key] = parseInt(json[key], 16);\n    }\n\n    if (key === 'timestamp') {\n      json[key] = json[key] * 1000;\n    }\n  });\n  return new this(json);\n};\n\nTx.methods.toRPC = function toRPC() {\n  const json = this.toJSON(); // using hash as primary key\n\n  json.hash = this._id;\n  delete json._id; // delete non standard key\n\n  delete json.timestamp;\n  const hexKeys = ['blockNumber', 'gas', 'gasPrice', 'nonce', 'value'];\n  hexKeys.forEach(key => {\n    if (this[key]) {\n      json[key] = this[key].toString(16);\n    }\n  });\n  return json;\n};\n\nmodule.exports = mongoose.models.Tx || mongoose.model('Tx', Tx);//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9tb2RlbHMvdHguanM/OTFiZSJdLCJuYW1lcyI6WyJtb25nb29zZSIsInJlcXVpcmUiLCJUeCIsIlNjaGVtYSIsIl9pZCIsInR5cGUiLCJTdHJpbmciLCJibG9ja0hhc2giLCJyZWYiLCJpbmRleCIsImJsb2NrTnVtYmVyIiwiTnVtYmVyIiwiZnJvbSIsImdhcyIsImdhc1ByaWNlIiwiaW5wdXQiLCJub25jZSIsInRvIiwidHJhbnNhY3Rpb25JbmRleCIsInZhbHVlIiwidGltZXN0YW1wIiwiRGF0ZSIsImRlZmF1bHQiLCJub3ciLCJzdGF0aWNzIiwiZnJvbVJQQyIsImRhdGEiLCJqc29uIiwiT2JqZWN0IiwiYXNzaWduIiwiaGFzaCIsImhleEtleXMiLCJmb3JFYWNoIiwia2V5IiwicGFyc2VJbnQiLCJtZXRob2RzIiwidG9SUEMiLCJ0b0pTT04iLCJ0b1N0cmluZyIsIm1vZHVsZSIsImV4cG9ydHMiLCJtb2RlbHMiLCJtb2RlbCJdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTUEsUUFBUSxHQUFHQyxtQkFBTyxDQUFDLDBCQUFELENBQXhCOztBQUVBLE1BQU1DLEVBQUUsR0FBRyxJQUFJRixRQUFRLENBQUNHLE1BQWIsQ0FBb0I7QUFDM0JDLEtBQUcsRUFBRTtBQUFDQyxRQUFJLEVBQUVDO0FBQVAsR0FEc0I7QUFDTjtBQUNyQkMsV0FBUyxFQUFFO0FBQUNGLFFBQUksRUFBRUMsTUFBUDtBQUFlRSxPQUFHLEVBQUUsT0FBcEI7QUFBNkJDLFNBQUssRUFBRTtBQUFwQyxHQUZnQjtBQUczQkMsYUFBVyxFQUFFO0FBQUNMLFFBQUksRUFBRU0sTUFBUDtBQUFlRixTQUFLLEVBQUU7QUFBdEIsR0FIYztBQUkzQkcsTUFBSSxFQUFFO0FBQUNQLFFBQUksRUFBRUMsTUFBUDtBQUFlRyxTQUFLLEVBQUU7QUFBdEIsR0FKcUI7QUFLM0JJLEtBQUcsRUFBRTtBQUFDUixRQUFJLEVBQUVNO0FBQVAsR0FMc0I7QUFNM0JHLFVBQVEsRUFBRTtBQUFDVCxRQUFJLEVBQUVNO0FBQVAsR0FOaUI7QUFPM0JJLE9BQUssRUFBRTtBQUFDVixRQUFJLEVBQUVDO0FBQVAsR0FQb0I7QUFRM0JVLE9BQUssRUFBRTtBQUFDWCxRQUFJLEVBQUVNO0FBQVAsR0FSb0I7QUFTM0JNLElBQUUsRUFBRTtBQUFDWixRQUFJLEVBQUVDLE1BQVA7QUFBZUcsU0FBSyxFQUFFO0FBQXRCLEdBVHVCO0FBVTNCUyxrQkFBZ0IsRUFBRTtBQUFDYixRQUFJLEVBQUVNO0FBQVAsR0FWUztBQVczQlEsT0FBSyxFQUFFO0FBQUNkLFFBQUksRUFBRU07QUFBUCxHQVhvQjtBQWEzQjtBQUNBUyxXQUFTLEVBQUU7QUFBQ2YsUUFBSSxFQUFFZ0IsSUFBUDtBQUFhQyxXQUFPLEVBQUVELElBQUksQ0FBQ0U7QUFBM0IsR0FkZ0IsQ0FjZ0I7O0FBZGhCLENBQXBCLENBQVg7O0FBaUJBckIsRUFBRSxDQUFDc0IsT0FBSCxDQUFXQyxPQUFYLEdBQXFCLFNBQVNBLE9BQVQsQ0FBaUJDLElBQWpCLEVBQXVCO0FBQ3hDLFFBQU1DLElBQUksR0FBR0MsTUFBTSxDQUFDQyxNQUFQLENBQWMsRUFBZCxFQUFrQkgsSUFBbEIsQ0FBYixDQUR3QyxDQUV4Qzs7QUFDQUMsTUFBSSxDQUFDdkIsR0FBTCxHQUFXdUIsSUFBSSxDQUFDRyxJQUFoQjtBQUNBLFNBQU9ILElBQUksQ0FBQ0csSUFBWjtBQUVBLFFBQU1DLE9BQU8sR0FBRyxDQUFDLGFBQUQsRUFBZ0IsS0FBaEIsRUFBdUIsVUFBdkIsRUFBbUMsT0FBbkMsRUFBNEMsT0FBNUMsRUFBcUQsV0FBckQsQ0FBaEI7QUFDQUEsU0FBTyxDQUFDQyxPQUFSLENBQWdCQyxHQUFHLElBQUk7QUFDbkIsUUFBSU4sSUFBSSxDQUFDTSxHQUFELENBQVIsRUFBZTtBQUNYTixVQUFJLENBQUNNLEdBQUQsQ0FBSixHQUFZQyxRQUFRLENBQUNQLElBQUksQ0FBQ00sR0FBRCxDQUFMLEVBQVksRUFBWixDQUFwQjtBQUNIOztBQUNELFFBQUlBLEdBQUcsS0FBSyxXQUFaLEVBQXlCO0FBQ3JCTixVQUFJLENBQUNNLEdBQUQsQ0FBSixHQUFZTixJQUFJLENBQUNNLEdBQUQsQ0FBSixHQUFZLElBQXhCO0FBQ0g7QUFDSixHQVBEO0FBU0EsU0FBTyxJQUFJLElBQUosQ0FBU04sSUFBVCxDQUFQO0FBQ0gsQ0FqQkQ7O0FBbUJBekIsRUFBRSxDQUFDaUMsT0FBSCxDQUFXQyxLQUFYLEdBQW1CLFNBQVNBLEtBQVQsR0FBaUI7QUFDaEMsUUFBTVQsSUFBSSxHQUFHLEtBQUtVLE1BQUwsRUFBYixDQURnQyxDQUdoQzs7QUFDQVYsTUFBSSxDQUFDRyxJQUFMLEdBQVksS0FBSzFCLEdBQWpCO0FBQ0EsU0FBT3VCLElBQUksQ0FBQ3ZCLEdBQVosQ0FMZ0MsQ0FPaEM7O0FBQ0EsU0FBT3VCLElBQUksQ0FBQ1AsU0FBWjtBQUVBLFFBQU1XLE9BQU8sR0FBRyxDQUFDLGFBQUQsRUFBZ0IsS0FBaEIsRUFBdUIsVUFBdkIsRUFBbUMsT0FBbkMsRUFBNEMsT0FBNUMsQ0FBaEI7QUFDQUEsU0FBTyxDQUFDQyxPQUFSLENBQWdCQyxHQUFHLElBQUk7QUFDbkIsUUFBSSxLQUFLQSxHQUFMLENBQUosRUFBZTtBQUNYTixVQUFJLENBQUNNLEdBQUQsQ0FBSixHQUFZLEtBQUtBLEdBQUwsRUFBVUssUUFBVixDQUFtQixFQUFuQixDQUFaO0FBQ0g7QUFDSixHQUpEO0FBTUEsU0FBT1gsSUFBUDtBQUNILENBbEJEOztBQW9CQVksTUFBTSxDQUFDQyxPQUFQLEdBQWlCeEMsUUFBUSxDQUFDeUMsTUFBVCxDQUFnQnZDLEVBQWhCLElBQXNCRixRQUFRLENBQUMwQyxLQUFULENBQWUsSUFBZixFQUFxQnhDLEVBQXJCLENBQXZDIiwiZmlsZSI6Ii4vbW9kZWxzL3R4LmpzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgbW9uZ29vc2UgPSByZXF1aXJlKCdtb25nb29zZScpO1xuXG5jb25zdCBUeCA9IG5ldyBtb25nb29zZS5TY2hlbWEoe1xuICAgIF9pZDoge3R5cGU6IFN0cmluZ30sIC8vIHR4IGhhc2hcbiAgICBibG9ja0hhc2g6IHt0eXBlOiBTdHJpbmcsIHJlZjogJ0Jsb2NrJywgaW5kZXg6IHRydWV9LFxuICAgIGJsb2NrTnVtYmVyOiB7dHlwZTogTnVtYmVyLCBpbmRleDogdHJ1ZX0sXG4gICAgZnJvbToge3R5cGU6IFN0cmluZywgaW5kZXg6IHRydWV9LFxuICAgIGdhczoge3R5cGU6IE51bWJlcn0sXG4gICAgZ2FzUHJpY2U6IHt0eXBlOiBOdW1iZXJ9LFxuICAgIGlucHV0OiB7dHlwZTogU3RyaW5nfSxcbiAgICBub25jZToge3R5cGU6IE51bWJlcn0sXG4gICAgdG86IHt0eXBlOiBTdHJpbmcsIGluZGV4OiB0cnVlfSxcbiAgICB0cmFuc2FjdGlvbkluZGV4OiB7dHlwZTogTnVtYmVyfSxcbiAgICB2YWx1ZToge3R5cGU6IE51bWJlcn0sXG5cbiAgICAvL25vdCBpbiBycGNcbiAgICB0aW1lc3RhbXA6IHt0eXBlOiBEYXRlLCBkZWZhdWx0OiBEYXRlLm5vd30gLy9vdmVycmlkZSB3aXRoIGJsb2NrIHRpbWVzdGFtcCBvbiBmaW5hbGl0eVxufSk7XG5cblR4LnN0YXRpY3MuZnJvbVJQQyA9IGZ1bmN0aW9uIGZyb21SUEMoZGF0YSkge1xuICAgIGNvbnN0IGpzb24gPSBPYmplY3QuYXNzaWduKHt9LCBkYXRhKTtcbiAgICAvLyB1c2luZyBoYXNoIGFzIHByaW1hcnkga2V5XG4gICAganNvbi5faWQgPSBqc29uLmhhc2g7XG4gICAgZGVsZXRlIGpzb24uaGFzaDtcblxuICAgIGNvbnN0IGhleEtleXMgPSBbJ2Jsb2NrTnVtYmVyJywgJ2dhcycsICdnYXNQcmljZScsICdub25jZScsICd2YWx1ZScsICd0aW1lc3RhbXAnXTtcbiAgICBoZXhLZXlzLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgaWYgKGpzb25ba2V5XSkge1xuICAgICAgICAgICAganNvbltrZXldID0gcGFyc2VJbnQoanNvbltrZXldLCAxNik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGtleSA9PT0gJ3RpbWVzdGFtcCcpIHtcbiAgICAgICAgICAgIGpzb25ba2V5XSA9IGpzb25ba2V5XSAqIDEwMDA7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBuZXcgdGhpcyhqc29uKTtcbn07XG5cblR4Lm1ldGhvZHMudG9SUEMgPSBmdW5jdGlvbiB0b1JQQygpIHtcbiAgICBjb25zdCBqc29uID0gdGhpcy50b0pTT04oKTtcblxuICAgIC8vIHVzaW5nIGhhc2ggYXMgcHJpbWFyeSBrZXlcbiAgICBqc29uLmhhc2ggPSB0aGlzLl9pZDtcbiAgICBkZWxldGUganNvbi5faWQ7XG5cbiAgICAvLyBkZWxldGUgbm9uIHN0YW5kYXJkIGtleVxuICAgIGRlbGV0ZSBqc29uLnRpbWVzdGFtcDtcblxuICAgIGNvbnN0IGhleEtleXMgPSBbJ2Jsb2NrTnVtYmVyJywgJ2dhcycsICdnYXNQcmljZScsICdub25jZScsICd2YWx1ZSddO1xuICAgIGhleEtleXMuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICBpZiAodGhpc1trZXldKSB7XG4gICAgICAgICAgICBqc29uW2tleV0gPSB0aGlzW2tleV0udG9TdHJpbmcoMTYpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gbW9uZ29vc2UubW9kZWxzLlR4IHx8IG1vbmdvb3NlLm1vZGVsKCdUeCcsIFR4KTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./models/tx.js\n");

/***/ }),

/***/ "./pages/api/tx/[id].js":
/*!******************************!*\
  !*** ./pages/api/tx/[id].js ***!
  \******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return userHandler; });\n/* harmony import */ var config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! config */ \"config\");\n/* harmony import */ var config__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(config__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! mongoose */ \"mongoose\");\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(mongoose__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _models_tx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../models/tx */ \"./models/tx.js\");\n/* harmony import */ var _models_tx__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_models_tx__WEBPACK_IMPORTED_MODULE_2__);\n\n\n\nasync function userHandler(req, res) {\n  try {\n    mongoose__WEBPACK_IMPORTED_MODULE_1___default.a.connection._readyState || (await mongoose__WEBPACK_IMPORTED_MODULE_1___default.a.connect(config__WEBPACK_IMPORTED_MODULE_0___default.a.mongo.uri, config__WEBPACK_IMPORTED_MODULE_0___default.a.mongo.options));\n  } catch (e) {\n    console.error(e);\n    return res.status(500).json({\n      error: 'Internal error. Please try your request again.'\n    });\n  }\n\n  const {\n    query: {\n      id\n    },\n    method\n  } = req;\n\n  switch (method) {\n    case 'GET':\n      try {\n        const tx = await _models_tx__WEBPACK_IMPORTED_MODULE_2___default.a.findOne({\n          _id: id\n        });\n\n        if (tx) {\n          return res.json(tx);\n        }\n\n        return res.status(404).json({\n          error: 'Not found'\n        });\n      } catch (e) {\n        console.error(e);\n        res.status(500).json({\n          error: 'Internal error. Please try your request again.'\n        });\n      }\n\n      break;\n\n    default:\n      res.setHeader('Allow', ['GET']);\n      res.status(405).end(`Method ${method} Not Allowed`);\n  }\n}//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9wYWdlcy9hcGkvdHgvLmpzPzIyM2IiXSwibmFtZXMiOlsidXNlckhhbmRsZXIiLCJyZXEiLCJyZXMiLCJtb25nb29zZSIsImNvbm5lY3Rpb24iLCJfcmVhZHlTdGF0ZSIsImNvbm5lY3QiLCJjb25maWciLCJtb25nbyIsInVyaSIsIm9wdGlvbnMiLCJlIiwiY29uc29sZSIsImVycm9yIiwic3RhdHVzIiwianNvbiIsInF1ZXJ5IiwiaWQiLCJtZXRob2QiLCJ0eCIsIlR4IiwiZmluZE9uZSIsIl9pZCIsInNldEhlYWRlciIsImVuZCJdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ0E7QUFFQTtBQUVlLGVBQWVBLFdBQWYsQ0FBMkJDLEdBQTNCLEVBQWdDQyxHQUFoQyxFQUFxQztBQUNoRCxNQUFJO0FBQ0FDLG1EQUFRLENBQUNDLFVBQVQsQ0FBb0JDLFdBQXBCLEtBQW1DLE1BQU1GLCtDQUFRLENBQUNHLE9BQVQsQ0FBaUJDLDZDQUFNLENBQUNDLEtBQVAsQ0FBYUMsR0FBOUIsRUFBbUNGLDZDQUFNLENBQUNDLEtBQVAsQ0FBYUUsT0FBaEQsQ0FBekM7QUFDSCxHQUZELENBRUUsT0FBT0MsQ0FBUCxFQUFVO0FBQ1JDLFdBQU8sQ0FBQ0MsS0FBUixDQUFjRixDQUFkO0FBQ0EsV0FBT1QsR0FBRyxDQUFDWSxNQUFKLENBQVcsR0FBWCxFQUFnQkMsSUFBaEIsQ0FBcUI7QUFBQ0YsV0FBSyxFQUFFO0FBQVIsS0FBckIsQ0FBUDtBQUNIOztBQUNELFFBQU07QUFDRkcsU0FBSyxFQUFFO0FBQUNDO0FBQUQsS0FETDtBQUVGQztBQUZFLE1BR0ZqQixHQUhKOztBQUtBLFVBQVFpQixNQUFSO0FBQ0ksU0FBSyxLQUFMO0FBQ0ksVUFBSTtBQUNBLGNBQU1DLEVBQUUsR0FBRyxNQUFNQyxpREFBRSxDQUFDQyxPQUFILENBQVc7QUFBQ0MsYUFBRyxFQUFFTDtBQUFOLFNBQVgsQ0FBakI7O0FBQ0EsWUFBSUUsRUFBSixFQUFRO0FBQ0osaUJBQU9qQixHQUFHLENBQUNhLElBQUosQ0FBU0ksRUFBVCxDQUFQO0FBQ0g7O0FBQ0QsZUFBT2pCLEdBQUcsQ0FBQ1ksTUFBSixDQUFXLEdBQVgsRUFBZ0JDLElBQWhCLENBQXFCO0FBQUNGLGVBQUssRUFBRTtBQUFSLFNBQXJCLENBQVA7QUFDSCxPQU5ELENBTUUsT0FBT0YsQ0FBUCxFQUFVO0FBQ1JDLGVBQU8sQ0FBQ0MsS0FBUixDQUFjRixDQUFkO0FBQ0FULFdBQUcsQ0FBQ1ksTUFBSixDQUFXLEdBQVgsRUFBZ0JDLElBQWhCLENBQXFCO0FBQUNGLGVBQUssRUFBRTtBQUFSLFNBQXJCO0FBQ0g7O0FBQ0Q7O0FBQ0o7QUFDSVgsU0FBRyxDQUFDcUIsU0FBSixDQUFjLE9BQWQsRUFBdUIsQ0FBQyxLQUFELENBQXZCO0FBQ0FyQixTQUFHLENBQUNZLE1BQUosQ0FBVyxHQUFYLEVBQWdCVSxHQUFoQixDQUFxQixVQUFTTixNQUFPLGNBQXJDO0FBZlI7QUFpQkgiLCJmaWxlIjoiLi9wYWdlcy9hcGkvdHgvW2lkXS5qcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBjb25maWcgZnJvbSAnY29uZmlnJztcbmltcG9ydCBtb25nb29zZSBmcm9tICdtb25nb29zZSc7XG5cbmltcG9ydCBUeCBmcm9tICcuLi8uLi8uLi9tb2RlbHMvdHgnO1xuXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiB1c2VySGFuZGxlcihyZXEsIHJlcykge1xuICAgIHRyeSB7XG4gICAgICAgIG1vbmdvb3NlLmNvbm5lY3Rpb24uX3JlYWR5U3RhdGUgfHwgYXdhaXQgbW9uZ29vc2UuY29ubmVjdChjb25maWcubW9uZ28udXJpLCBjb25maWcubW9uZ28ub3B0aW9ucyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg1MDApLmpzb24oe2Vycm9yOiAnSW50ZXJuYWwgZXJyb3IuIFBsZWFzZSB0cnkgeW91ciByZXF1ZXN0IGFnYWluLid9KTtcbiAgICB9XG4gICAgY29uc3Qge1xuICAgICAgICBxdWVyeToge2lkfSxcbiAgICAgICAgbWV0aG9kLFxuICAgIH0gPSByZXE7XG5cbiAgICBzd2l0Y2ggKG1ldGhvZCkge1xuICAgICAgICBjYXNlICdHRVQnOlxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCB0eCA9IGF3YWl0IFR4LmZpbmRPbmUoe19pZDogaWR9KTtcbiAgICAgICAgICAgICAgICBpZiAodHgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5qc29uKHR4KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHtlcnJvcjogJ05vdCBmb3VuZCd9KTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHtlcnJvcjogJ0ludGVybmFsIGVycm9yLiBQbGVhc2UgdHJ5IHlvdXIgcmVxdWVzdCBhZ2Fpbi4nfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FsbG93JywgWydHRVQnXSk7XG4gICAgICAgICAgICByZXMuc3RhdHVzKDQwNSkuZW5kKGBNZXRob2QgJHttZXRob2R9IE5vdCBBbGxvd2VkYCk7XG4gICAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./pages/api/tx/[id].js\n");

/***/ }),

/***/ "config":
/*!*************************!*\
  !*** external "config" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"config\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJjb25maWdcIj82MzQwIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBIiwiZmlsZSI6ImNvbmZpZy5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImNvbmZpZ1wiKTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///config\n");

/***/ }),

/***/ "mongoose":
/*!***************************!*\
  !*** external "mongoose" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"mongoose\");//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJtb25nb29zZVwiP2ZmZDciXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEiLCJmaWxlIjoibW9uZ29vc2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJtb25nb29zZVwiKTsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///mongoose\n");

/***/ })

/******/ });