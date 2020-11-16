/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "../../../../happo31.HAPPO31-SURFACE/Documents/dev/OCR/src/index.ts":
/*!**************************************************************************!*\
  !*** ../../../../happo31.HAPPO31-SURFACE/Documents/dev/OCR/src/index.ts ***!
  \**************************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: top-level-this-exports, __webpack_exports__, __webpack_require__ */
/*! CommonJS bailout: this is used directly at 2:17-21 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const electron_1 = __webpack_require__(/*! electron */ "electron");
class OCRApp {
    constructor() {
        this.window = null;
        electron_1.app.on("ready", () => {
            this.window = new electron_1.BrowserWindow({
                width: 1280,
                height: 960,
                webPreferences: {
                    nodeIntegration: true
                }
            });
            this.window.loadURL(`file://${__dirname}/index.html`);
            this.window.setMenu(null);
            this.window.webContents.openDevTools();
        });
        electron_1.app.on("window-all-closed", () => {
            electron_1.app.quit();
        });
        this.registIpcEvents();
    }
    registIpcEvents() {
        electron_1.ipcMain.handle("fileopen-dialog", (event) => __awaiter(this, void 0, void 0, function* () {
            if (!this.window) {
                return null;
            }
            const result = yield electron_1.dialog.showOpenDialog(this.window);
            if (result.canceled) {
                return null;
            }
            return result.filePaths[0];
        }));
        electron_1.ipcMain.handle("get-content-size", () => {
            var _a;
            return (_a = this.window) === null || _a === void 0 ? void 0 : _a.getContentSize();
        });
        electron_1.ipcMain.handle("get-display-dpi", () => {
            if (this.window == null) {
                return;
            }
            const [x, y] = this.window.getPosition();
            const display = electron_1.screen.getDisplayNearestPoint({ x, y });
            return display.scaleFactor;
        });
        electron_1.ipcMain.handle("set-window-size", (_, width, height) => {
            var _a;
            (_a = this.window) === null || _a === void 0 ? void 0 : _a.setContentSize(width, height);
        });
        electron_1.ipcMain.handle("set-text-clipboard", (_, text) => {
            electron_1.clipboard.writeText(text);
        });
    }
}
new OCRApp();


/***/ }),

/***/ "electron":
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
/*! dynamic exports */
/*! exports [maybe provided (runtime-defined)] [no usage info] */
/*! runtime requirements: module */
/***/ ((module) => {

module.exports = require("electron");;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	// startup
/******/ 	// Load entry module
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	__webpack_require__("../../../../happo31.HAPPO31-SURFACE/Documents/dev/OCR/src/index.ts");
/******/ })()
;
//# sourceMappingURL=index.js.map