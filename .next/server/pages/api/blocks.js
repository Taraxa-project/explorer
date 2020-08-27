module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = require('../../ssr-module-cache.js');
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
/******/ 	return __webpack_require__(__webpack_require__.s = "./pages/api/blocks.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./models/block.js":
/*!*************************!*\
  !*** ./models/block.js ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var _mongoose$models;\n\nconst mongoose = __webpack_require__(/*! mongoose */ \"mongoose\");\n\nconst Block = new mongoose.Schema({\n  _id: {\n    type: String\n  },\n  // block hash\n  author: {\n    type: String\n  },\n  extraData: {\n    type: String\n  },\n  gasLimit: {\n    type: Number\n  },\n  gasUsed: {\n    type: Number\n  },\n  logsBloom: {\n    type: String\n  },\n  miner: {\n    type: String\n  },\n  mixHash: {\n    type: String\n  },\n  nonce: {\n    type: Number\n  },\n  number: {\n    type: Number\n  },\n  parentHash: {\n    type: String\n  },\n  receiptsRoot: {\n    type: String\n  },\n  sha3Uncles: {\n    type: String\n  },\n  size: {\n    type: Number\n  },\n  stateRoot: {\n    type: String\n  },\n  timestamp: {\n    type: Date,\n    index: true\n  },\n  totalDifficulty: {\n    type: Number\n  },\n  transactions: [{\n    type: String,\n    ref: 'Tx'\n  }],\n  transactionsRoot: {\n    type: String\n  },\n  uncles: [{\n    type: String\n  }]\n}, {\n  versionKey: false\n});\n\nBlock.statics.fromRPC = function fromRPC(data) {\n  const json = Object.assign({}, data); // move hash to primary key _id\n\n  json._id = json.hash;\n  delete json.hash;\n  const hexKeys = ['gasLimit', 'gasUsed', 'nonce', 'number', 'size', 'timestamp'];\n  hexKeys.forEach(key => {\n    if (json[key]) {\n      json[key] = parseInt(json[key], 16);\n    }\n\n    if (key === 'timestamp') {\n      json[key] = json[key] * 1000;\n    }\n  });\n\n  if (json.transactions && json.transactions.length) {\n    json.transactions = json.transactions.map(doc => doc.hash || doc);\n  }\n\n  return new this(json);\n};\n\nBlock.methods.toRPC = function toRPC() {\n  const json = this.toJSON(); // get hash from primary key _id\n\n  json.hash = this._id;\n  delete json._id;\n  const hexKeys = ['gasLimit', 'gasUsed', 'nonce', 'number', 'size', 'timestamp'];\n  hexKeys.forEach(key => {\n    if (key === 'timestamp') {\n      json[key] = this[key].valueOf() / 1000;\n    }\n\n    if (this[key]) {\n      json[key] = this[key].toString(16);\n    }\n  });\n  return json;\n};\n\nmodule.exports = ((_mongoose$models = mongoose.models) === null || _mongoose$models === void 0 ? void 0 : _mongoose$models.Block) || mongoose.model('Block', Block);//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9tb2RlbHMvYmxvY2suanM/MjI1YiJdLCJuYW1lcyI6WyJtb25nb29zZSIsInJlcXVpcmUiLCJCbG9jayIsIlNjaGVtYSIsIl9pZCIsInR5cGUiLCJTdHJpbmciLCJhdXRob3IiLCJleHRyYURhdGEiLCJnYXNMaW1pdCIsIk51bWJlciIsImdhc1VzZWQiLCJsb2dzQmxvb20iLCJtaW5lciIsIm1peEhhc2giLCJub25jZSIsIm51bWJlciIsInBhcmVudEhhc2giLCJyZWNlaXB0c1Jvb3QiLCJzaGEzVW5jbGVzIiwic2l6ZSIsInN0YXRlUm9vdCIsInRpbWVzdGFtcCIsIkRhdGUiLCJpbmRleCIsInRvdGFsRGlmZmljdWx0eSIsInRyYW5zYWN0aW9ucyIsInJlZiIsInRyYW5zYWN0aW9uc1Jvb3QiLCJ1bmNsZXMiLCJ2ZXJzaW9uS2V5Iiwic3RhdGljcyIsImZyb21SUEMiLCJkYXRhIiwianNvbiIsIk9iamVjdCIsImFzc2lnbiIsImhhc2giLCJoZXhLZXlzIiwiZm9yRWFjaCIsImtleSIsInBhcnNlSW50IiwibGVuZ3RoIiwibWFwIiwiZG9jIiwibWV0aG9kcyIsInRvUlBDIiwidG9KU09OIiwidmFsdWVPZiIsInRvU3RyaW5nIiwibW9kdWxlIiwiZXhwb3J0cyIsIm1vZGVscyIsIm1vZGVsIl0sIm1hcHBpbmdzIjoiOztBQUFBLE1BQU1BLFFBQVEsR0FBR0MsbUJBQU8sQ0FBQywwQkFBRCxDQUF4Qjs7QUFFQSxNQUFNQyxLQUFLLEdBQUcsSUFBSUYsUUFBUSxDQUFDRyxNQUFiLENBQW9CO0FBQzlCQyxLQUFHLEVBQUU7QUFBQ0MsUUFBSSxFQUFFQztBQUFQLEdBRHlCO0FBQ1Q7QUFDckJDLFFBQU0sRUFBRTtBQUFDRixRQUFJLEVBQUVDO0FBQVAsR0FGc0I7QUFHOUJFLFdBQVMsRUFBRTtBQUFDSCxRQUFJLEVBQUVDO0FBQVAsR0FIbUI7QUFJOUJHLFVBQVEsRUFBRTtBQUFDSixRQUFJLEVBQUVLO0FBQVAsR0FKb0I7QUFLOUJDLFNB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QUFDRyxJQUFMLEdBQVksS0FBS2pDLEdBQWpCO0FBQ0EsU0FBTzhCLElBQUksQ0FBQzlCLEdBQVo7QUFFQSxRQUFNa0MsT0FBTyxHQUFHLENBQUMsVUFBRCxFQUFhLFNBQWIsRUFBd0IsT0FBeEIsRUFBaUMsUUFBakMsRUFBMkMsTUFBM0MsRUFBbUQsV0FBbkQsQ0FBaEI7QUFDQUEsU0FBTyxDQUFDQyxPQUFSLENBQWdCQyxHQUFHLElBQUk7QUFDbkIsUUFBSUEsR0FBRyxLQUFLLFdBQVosRUFBeUI7QUFDckJOLFVBQUksQ0FBQ00sR0FBRCxDQUFKLEdBQVksS0FBS0EsR0FBTCxFQUFVUSxPQUFWLEtBQXNCLElBQWxDO0FBQ0g7O0FBQ0QsUUFBSSxLQUFLUixHQUFMLENBQUosRUFBZTtBQUNYTixVQUFJLENBQUNNLEdBQUQsQ0FBSixHQUFZLEtBQUtBLEdBQUwsRUFBVVMsUUFBVixDQUFtQixFQUFuQixDQUFaO0FBQ0g7QUFDSixHQVBEO0FBU0EsU0FBT2YsSUFBUDtBQUNILENBbEJEOztBQW9CQWdCLE1BQU0sQ0FBQ0MsT0FBUCxHQUFpQixxQkFBQW5ELFFBQVEsQ0FBQ29ELE1BQVQsc0VBQWlCbEQsS0FBakIsS0FBMEJGLFFBQVEsQ0FBQ3FELEtBQVQsQ0FBZSxPQUFmLEVBQXdCbkQsS0FBeEIsQ0FBM0MiLCJmaWxlIjoiLi9tb2RlbHMvYmxvY2suanMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBtb25nb29zZSA9IHJlcXVpcmUoJ21vbmdvb3NlJyk7XG5cbmNvbnN0IEJsb2NrID0gbmV3IG1vbmdvb3NlLlNjaGVtYSh7XG4gICAgX2lkOiB7dHlwZTogU3RyaW5nfSwgLy8gYmxvY2sgaGFzaFxuICAgIGF1dGhvcjoge3R5cGU6IFN0cmluZ30sXG4gICAgZXh0cmFEYXRhOiB7dHlwZTogU3RyaW5nfSxcbiAgICBnYXNMaW1pdDoge3R5cGU6IE51bWJlcn0sXG4gICAgZ2FzVXNlZDoge3R5cGU6IE51bWJlcn0sXG4gICAgbG9nc0Jsb29tOiB7dHlwZTogU3RyaW5nfSxcbiAgICBtaW5lcjoge3R5cGU6IFN0cmluZ30sXG4gICAgbWl4SGFzaDoge3R5cGU6IFN0cmluZ30sXG4gICAgbm9uY2U6IHt0eXBlOiBOdW1iZXJ9LFxuICAgIG51bWJlcjoge3R5cGU6IE51bWJlcn0sXG4gICAgcGFyZW50SGFzaDoge3R5cGU6IFN0cmluZ30sXG4gICAgcmVjZWlwdHNSb290OiB7dHlwZTogU3RyaW5nfSxcbiAgICBzaGEzVW5jbGVzOiB7dHlwZTogU3RyaW5nfSxcbiAgICBzaXplOiB7dHlwZTogTnVtYmVyfSxcbiAgICBzdGF0ZVJvb3Q6IHt0eXBlOiBTdHJpbmd9LFxuICAgIHRpbWVzdGFtcDoge3R5cGU6IERhdGUsIGluZGV4OiB0cnVlfSxcbiAgICB0b3RhbERpZmZpY3VsdHk6IHt0eXBlOiBOdW1iZXJ9LFxuICAgIHRyYW5zYWN0aW9uczogW3t0eXBlOiBTdHJpbmcsIHJlZjogJ1R4J31dLFxuICAgIHRyYW5zYWN0aW9uc1Jvb3Q6IHt0eXBlOiBTdHJpbmd9LFxuICAgIHVuY2xlczogW3t0eXBlOiBTdHJpbmd9XVxufSwge1xuICAgIHZlcnNpb25LZXk6IGZhbHNlXG59KTtcblxuQmxvY2suc3RhdGljcy5mcm9tUlBDID0gZnVuY3Rpb24gZnJvbVJQQyhkYXRhKSB7XG4gICAgY29uc3QganNvbiA9IE9iamVjdC5hc3NpZ24oe30sIGRhdGEpO1xuICAgIC8vIG1vdmUgaGFzaCB0byBwcmltYXJ5IGtleSBfaWRcbiAgICBqc29uLl9pZCA9IGpzb24uaGFzaDtcbiAgICBkZWxldGUganNvbi5oYXNoO1xuXG4gICAgY29uc3QgaGV4S2V5cyA9IFsnZ2FzTGltaXQnLCAnZ2FzVXNlZCcsICdub25jZScsICdudW1iZXInLCAnc2l6ZScsICd0aW1lc3RhbXAnXTtcbiAgICBoZXhLZXlzLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgaWYgKGpzb25ba2V5XSkge1xuICAgICAgICAgICAganNvbltrZXldID0gcGFyc2VJbnQoanNvbltrZXldLCAxNik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGtleSA9PT0gJ3RpbWVzdGFtcCcpIHtcbiAgICAgICAgICAgIGpzb25ba2V5XSA9IGpzb25ba2V5XSAqIDEwMDA7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmIChqc29uLnRyYW5zYWN0aW9ucyAmJiBqc29uLnRyYW5zYWN0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAganNvbi50cmFuc2FjdGlvbnMgPSBqc29uLnRyYW5zYWN0aW9ucy5tYXAoZG9jID0+IGRvYy5oYXNoIHx8IGRvYyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyB0aGlzKGpzb24pO1xufTtcblxuQmxvY2subWV0aG9kcy50b1JQQyA9IGZ1bmN0aW9uIHRvUlBDKCkge1xuICAgIGNvbnN0IGpzb24gPSB0aGlzLnRvSlNPTigpO1xuXG4gICAgLy8gZ2V0IGhhc2ggZnJvbSBwcmltYXJ5IGtleSBfaWRcbiAgICBqc29uLmhhc2ggPSB0aGlzLl9pZDtcbiAgICBkZWxldGUganNvbi5faWQ7XG5cbiAgICBjb25zdCBoZXhLZXlzID0gWydnYXNMaW1pdCcsICdnYXNVc2VkJywgJ25vbmNlJywgJ251bWJlcicsICdzaXplJywgJ3RpbWVzdGFtcCddO1xuICAgIGhleEtleXMuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICBpZiAoa2V5ID09PSAndGltZXN0YW1wJykge1xuICAgICAgICAgICAganNvbltrZXldID0gdGhpc1trZXldLnZhbHVlT2YoKSAvIDEwMDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXNba2V5XSkge1xuICAgICAgICAgICAganNvbltrZXldID0gdGhpc1trZXldLnRvU3RyaW5nKDE2KTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IG1vbmdvb3NlLm1vZGVscz8uQmxvY2sgfHwgbW9uZ29vc2UubW9kZWwoJ0Jsb2NrJywgQmxvY2spOyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./models/block.js\n");

/***/ }),

/***/ "./pages/api/blocks.js":
/*!*****************************!*\
  !*** ./pages/api/blocks.js ***!
  \*****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return handler; });\n/* harmony import */ var config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! config */ \"config\");\n/* harmony import */ var config__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(config__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! mongoose */ \"mongoose\");\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(mongoose__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _models_block__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../models/block */ \"./models/block.js\");\n/* harmony import */ var _models_block__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_models_block__WEBPACK_IMPORTED_MODULE_2__);\n\n\n\nasync function handler(req, res) {\n  try {\n    mongoose__WEBPACK_IMPORTED_MODULE_1___default.a.connection._readyState || (await mongoose__WEBPACK_IMPORTED_MODULE_1___default.a.connect(config__WEBPACK_IMPORTED_MODULE_0___default.a.mongo.uri, config__WEBPACK_IMPORTED_MODULE_0___default.a.mongo.options));\n  } catch (e) {\n    console.error(e);\n    return res.status(500).json({\n      error: 'Internal error. Please try your request again.'\n    });\n  }\n\n  let skip = Number(req.query.skip) || 0;\n  let limit = Number(req.query.limit) || 20;\n  let reverse = Boolean(req.query.reverse);\n  let fullTransactions = Boolean(req.query.fullTransactions) || false;\n\n  try {\n    let blocks = [];\n\n    if (fullTransactions) {\n      blocks = await _models_block__WEBPACK_IMPORTED_MODULE_2___default.a.find().limit(limit).skip(skip).sort({\n        number: reverse ? -1 : 1\n      }).populate('transactions');\n    } else {\n      blocks = await _models_block__WEBPACK_IMPORTED_MODULE_2___default.a.find().limit(limit).skip(skip).sort({\n        number: reverse ? -1 : 1\n      });\n    }\n\n    res.json(blocks);\n  } catch (e) {\n    console.error(e);\n    res.status(500).json({\n      error: 'Internal error. Please try your request again.'\n    });\n  }\n}//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9wYWdlcy9hcGkvYmxvY2tzLmpzPzI4ZTAiXSwibmFtZXMiOlsiaGFuZGxlciIsInJlcSIsInJlcyIsIm1vbmdvb3NlIiwiY29ubmVjdGlvbiIsIl9yZWFkeVN0YXRlIiwiY29ubmVjdCIsImNvbmZpZyIsIm1vbmdvIiwidXJpIiwib3B0aW9ucyIsImUiLCJjb25zb2xlIiwiZXJyb3IiLCJzdGF0dXMiLCJqc29uIiwic2tpcCIsIk51bWJlciIsInF1ZXJ5IiwibGltaXQiLCJyZXZlcnNlIiwiQm9vbGVhbiIsImZ1bGxUcmFuc2FjdGlvbnMiLCJibG9ja3MiLCJCbG9jayIsImZpbmQiLCJzb3J0IiwibnVtYmVyIiwicG9wdWxhdGUiXSwibWFwcGluZ3MiOiJBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNBO0FBRUE7QUFFZSxlQUFlQSxPQUFmLENBQXVCQyxHQUF2QixFQUE0QkMsR0FBNUIsRUFBaUM7QUFDNUMsTUFBSTtBQUNBQyxtREFBUSxDQUFDQyxVQUFULENBQW9CQyxXQUFwQixLQUFtQyxNQUFNRiwrQ0FBUSxDQUFDRyxPQUFULENBQWlCQyw2Q0FBTSxDQUFDQyxLQUFQLENBQWFDLEdBQTlCLEVBQW1DRiw2Q0FBTSxDQUFDQyxLQUFQLENBQWFFLE9BQWhELENBQXpDO0FBQ0gsR0FGRCxDQUVFLE9BQU9DLENBQVAsRUFBVTtBQUNSQyxXQUFPLENBQUNDLEtBQVIsQ0FBY0YsQ0FBZDtBQUNBLFdBQU9ULEdBQUcsQ0FBQ1ksTUFBSixDQUFXLEdBQVgsRUFBZ0JDLElBQWhCLENBQXFCO0FBQUNGLFdBQUssRUFBRTtBQUFSLEtBQXJCLENBQVA7QUFDSDs7QUFFRCxNQUFJRyxJQUFJLEdBQUdDLE1BQU0sQ0FBQ2hCLEdBQUcsQ0FBQ2lCLEtBQUosQ0FBVUYsSUFBWCxDQUFOLElBQTBCLENBQXJDO0FBQ0EsTUFBSUcsS0FBSyxHQUFHRixNQUFNLENBQUNoQixHQUFHLENBQUNpQixLQUFKLENBQVVDLEtBQVgsQ0FBTixJQUEyQixFQUF2QztBQUNBLE1BQUlDLE9BQU8sR0FBR0MsT0FBTyxDQUFDcEIsR0FBRyxDQUFDaUIsS0FBSixDQUFVRSxPQUFYLENBQXJCO0FBQ0EsTUFBSUUsZ0JBQWdCLEdBQUdELE9BQU8sQ0FBQ3BCLEdBQUcsQ0FBQ2lCLEtBQUosQ0FBVUksZ0JBQVgsQ0FBUCxJQUF1QyxLQUE5RDs7QUFFQSxNQUFJO0FBQ0EsUUFBSUMsTUFBTSxHQUFHLEVBQWI7O0FBQ0EsUUFBSUQsZ0JBQUosRUFBc0I7QUFDbEJDLFlBQU0sR0FBRyxNQUFNQyxvREFBSyxDQUFDQyxJQUFOLEdBQWFOLEtBQWIsQ0FBbUJBLEtBQW5CLEVBQTBCSCxJQUExQixDQUErQkEsSUFBL0IsRUFBcUNVLElBQXJDLENBQTBDO0FBQUNDLGNBQU0sRUFBRVAsT0FBTyxHQUFHLENBQUMsQ0FBSixHQUFRO0FBQXhCLE9BQTFDLEVBQXNFUSxRQUF0RSxDQUErRSxjQUEvRSxDQUFmO0FBQ0gsS0FGRCxNQUVPO0FBQ0hMLFlBQU0sR0FBRyxNQUFNQyxvREFBSyxDQUFDQyxJQUFOLEdBQWFOLEtBQWIsQ0FBbUJBLEtBQW5CLEVBQTBCSCxJQUExQixDQUErQkEsSUFBL0IsRUFBcUNVLElBQXJDLENBQTBDO0FBQUNDLGNBQU0sRUFBRVAsT0FBTyxHQUFHLENBQUMsQ0FBSixHQUFRO0FBQXhCLE9BQTFDLENBQWY7QUFDSDs7QUFDRGxCLE9BQUcsQ0FBQ2EsSUFBSixDQUFTUSxNQUFUO0FBQ0gsR0FSRCxDQVFFLE9BQU9aLENBQVAsRUFBVTtBQUNSQyxXQUFPLENBQUNDLEtBQVIsQ0FBY0YsQ0FBZDtBQUNBVCxPQUFHLENBQUNZLE1BQUosQ0FBVyxHQUFYLEVBQWdCQyxJQUFoQixDQUFxQjtBQUFDRixXQUFLLEVBQUU7QUFBUixLQUFyQjtBQUNIO0FBQ0oiLCJmaWxlIjoiLi9wYWdlcy9hcGkvYmxvY2tzLmpzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGNvbmZpZyBmcm9tICdjb25maWcnO1xuaW1wb3J0IG1vbmdvb3NlIGZyb20gJ21vbmdvb3NlJztcblxuaW1wb3J0IEJsb2NrIGZyb20gJy4uLy4uL21vZGVscy9ibG9jayc7XG5cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIocmVxLCByZXMpIHtcbiAgICB0cnkge1xuICAgICAgICBtb25nb29zZS5jb25uZWN0aW9uLl9yZWFkeVN0YXRlIHx8IGF3YWl0IG1vbmdvb3NlLmNvbm5lY3QoY29uZmlnLm1vbmdvLnVyaSwgY29uZmlnLm1vbmdvLm9wdGlvbnMpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHtlcnJvcjogJ0ludGVybmFsIGVycm9yLiBQbGVhc2UgdHJ5IHlvdXIgcmVxdWVzdCBhZ2Fpbi4nfSk7XG4gICAgfVxuXG4gICAgbGV0IHNraXAgPSBOdW1iZXIocmVxLnF1ZXJ5LnNraXApIHx8IDA7XG4gICAgbGV0IGxpbWl0ID0gTnVtYmVyKHJlcS5xdWVyeS5saW1pdCkgfHwgMjA7XG4gICAgbGV0IHJldmVyc2UgPSBCb29sZWFuKHJlcS5xdWVyeS5yZXZlcnNlKTtcbiAgICBsZXQgZnVsbFRyYW5zYWN0aW9ucyA9IEJvb2xlYW4ocmVxLnF1ZXJ5LmZ1bGxUcmFuc2FjdGlvbnMpIHx8IGZhbHNlO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgbGV0IGJsb2NrcyA9IFtdO1xuICAgICAgICBpZiAoZnVsbFRyYW5zYWN0aW9ucykge1xuICAgICAgICAgICAgYmxvY2tzID0gYXdhaXQgQmxvY2suZmluZCgpLmxpbWl0KGxpbWl0KS5za2lwKHNraXApLnNvcnQoe251bWJlcjogcmV2ZXJzZSA/IC0xIDogMX0pLnBvcHVsYXRlKCd0cmFuc2FjdGlvbnMnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJsb2NrcyA9IGF3YWl0IEJsb2NrLmZpbmQoKS5saW1pdChsaW1pdCkuc2tpcChza2lwKS5zb3J0KHtudW1iZXI6IHJldmVyc2UgPyAtMSA6IDF9KTtcbiAgICAgICAgfVxuICAgICAgICByZXMuanNvbihibG9ja3MpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgcmVzLnN0YXR1cyg1MDApLmpzb24oe2Vycm9yOiAnSW50ZXJuYWwgZXJyb3IuIFBsZWFzZSB0cnkgeW91ciByZXF1ZXN0IGFnYWluLid9KTtcbiAgICB9XG59XG4iXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./pages/api/blocks.js\n");

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