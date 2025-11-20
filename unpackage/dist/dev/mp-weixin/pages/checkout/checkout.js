(global["webpackJsonp"] = global["webpackJsonp"] || []).push([["pages/checkout/checkout"],{

/***/ 59:
/*!************************************************************************************!*\
  !*** C:/Users/chejun/Desktop/woerp/main.js?{"page":"pages%2Fcheckout%2Fcheckout"} ***!
  \************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(wx, createPage) {

var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ 4);
__webpack_require__(/*! uni-pages */ 26);
var _vue = _interopRequireDefault(__webpack_require__(/*! vue */ 25));
var _checkout = _interopRequireDefault(__webpack_require__(/*! ./pages/checkout/checkout.vue */ 60));
// @ts-ignore
wx.__webpack_require_UNI_MP_PLUGIN__ = __webpack_require__;
createPage(_checkout.default);
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/wx.js */ 1)["default"], __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 2)["createPage"]))

/***/ }),

/***/ 60:
/*!*****************************************************************!*\
  !*** C:/Users/chejun/Desktop/woerp/pages/checkout/checkout.vue ***!
  \*****************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _checkout_vue_vue_type_template_id_a037f574_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./checkout.vue?vue&type=template&id=a037f574&scoped=true& */ 61);
/* harmony import */ var _checkout_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./checkout.vue?vue&type=script&lang=js& */ 63);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _checkout_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _checkout_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var _checkout_vue_vue_type_style_index_0_id_a037f574_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./checkout.vue?vue&type=style&index=0&id=a037f574&lang=scss&scoped=true& */ 68);
/* harmony import */ var _D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/runtime/componentNormalizer.js */ 32);

var renderjs





/* normalize component */

var component = Object(_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__["default"])(
  _checkout_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
  _checkout_vue_vue_type_template_id_a037f574_scoped_true___WEBPACK_IMPORTED_MODULE_0__["render"],
  _checkout_vue_vue_type_template_id_a037f574_scoped_true___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
  false,
  null,
  "a037f574",
  null,
  false,
  _checkout_vue_vue_type_template_id_a037f574_scoped_true___WEBPACK_IMPORTED_MODULE_0__["components"],
  renderjs
)

component.options.__file = "pages/checkout/checkout.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ 61:
/*!************************************************************************************************************!*\
  !*** C:/Users/chejun/Desktop/woerp/pages/checkout/checkout.vue?vue&type=template&id=a037f574&scoped=true& ***!
  \************************************************************************************************************/
/*! exports provided: render, staticRenderFns, recyclableRender, components */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_checkout_vue_vue_type_template_id_a037f574_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-uni-app-loader/page-meta.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./checkout.vue?vue&type=template&id=a037f574&scoped=true& */ 62);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_checkout_vue_vue_type_template_id_a037f574_scoped_true___WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_checkout_vue_vue_type_template_id_a037f574_scoped_true___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "recyclableRender", function() { return _D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_checkout_vue_vue_type_template_id_a037f574_scoped_true___WEBPACK_IMPORTED_MODULE_0__["recyclableRender"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "components", function() { return _D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_checkout_vue_vue_type_template_id_a037f574_scoped_true___WEBPACK_IMPORTED_MODULE_0__["components"]; });



/***/ }),

/***/ 62:
/*!************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-uni-app-loader/page-meta.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!C:/Users/chejun/Desktop/woerp/pages/checkout/checkout.vue?vue&type=template&id=a037f574&scoped=true& ***!
  \************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns, recyclableRender, components */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "render", function() { return render; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return staticRenderFns; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "recyclableRender", function() { return recyclableRender; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "components", function() { return components; });
var components
var render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  var l0 = _vm.__map(_vm.cart, function (it, __i0__) {
    var $orig = _vm.__get_orig(it)
    var m0 = _vm.formatTime(it.timestamp)
    return {
      $orig: $orig,
      m0: m0,
    }
  })
  var g0 = _vm.cart.length
  if (!_vm._isMounted) {
    _vm.e0 = function ($event, dept) {
      var _temp = arguments[arguments.length - 1].currentTarget.dataset,
        _temp2 = _temp.eventParams || _temp["event-params"],
        dept = _temp2.dept
      var _temp, _temp2
      _vm.selectedDept = dept
    }
    _vm.e1 = function ($event, opt) {
      var _temp3 = arguments[arguments.length - 1].currentTarget.dataset,
        _temp4 = _temp3.eventParams || _temp3["event-params"],
        opt = _temp4.opt
      var _temp3, _temp4
      _vm.selectedIo = opt.value
    }
  }
  _vm.$mp.data = Object.assign(
    {},
    {
      $root: {
        l0: l0,
        g0: g0,
      },
    }
  )
}
var recyclableRender = false
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ 63:
/*!******************************************************************************************!*\
  !*** C:/Users/chejun/Desktop/woerp/pages/checkout/checkout.vue?vue&type=script&lang=js& ***!
  \******************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_checkout_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--13-1!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./checkout.vue?vue&type=script&lang=js& */ 64);
/* harmony import */ var _D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_checkout_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_checkout_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_checkout_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_checkout_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_checkout_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ 64:
/*!*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--13-1!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!C:/Users/chejun/Desktop/woerp/pages/checkout/checkout.vue?vue&type=script&lang=js& ***!
  \*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(uni) {

var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ 4);
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _regenerator = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/regenerator */ 65));
var _asyncToGenerator2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/asyncToGenerator */ 67));
var _util = __webpack_require__(/*! @/common/util.js */ 39);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

function dateKey() {
  var d = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Date();
  var y = d.getFullYear();
  var m = String(d.getMonth() + 1).padStart(2, '0');
  var day = String(d.getDate()).padStart(2, '0');
  return "".concat(y, "-").concat(m, "-").concat(day);
}
var _default = {
  data: function data() {
    return {
      cart: [],
      selectedDept: '配料',
      selectedIo: 'inbound_purchase',
      departments: ['配料', '制片', '卷绕', '封装', '注液', '切边', '包装', 'PACK', '技术部'],
      ioTypes: [{
        value: 'inbound_purchase',
        label: '采购入库'
      }, {
        value: 'return_purchase',
        label: '采购退货'
      }, {
        value: 'line_return',
        label: '产线退仓'
      }, {
        value: 'prod_issue',
        label: '生产领料'
      }, {
        value: 'batch_out',
        label: '批次出库'
      }, {
        value: 'over_out',
        label: '超领出库'
      }, {
        value: 'replenish_out',
        label: '补料出库'
      }, {
        value: 'mix_issue',
        label: '制料领料'
      }, {
        value: 'aux_out',
        label: '辅料出库'
      }],
      canvasW: 0,
      canvasH: 0,
      _canvasNode: null,
      ctx: null,
      last: null,
      isDrawing: false,
      hasStroke: false,
      signConfirmed: false,
      signImage: '',
      drawTimer: null,
      // 绘制防抖定时器（旧方案保留）
      pendingDraw: false,
      // 是否有待绘制的内容（旧方案保留）
      rafId: null,
      // requestAnimationFrame ID（避免以 _ 开头影响代理）
      pointQueue: [] // 待绘制的点队列（避免以 _ 开头影响代理）
    };
  },
  onLoad: function onLoad() {
    this.cart = uni.getStorageSync('cartList') || [];
  },
  onReady: function onReady() {
    var _this = this;
    // 延迟初始化 Canvas，确保页面完全加载
    setTimeout(function () {
      _this.initCanvas();
    }, 100);
  },
  methods: {
    formatTime: function formatTime(timestamp) {
      if (!timestamp) return '';
      var date = new Date(timestamp);
      return date.toLocaleString();
    },
    initCanvas: function initCanvas() {
      var _this2 = this;
      try {
        var sys = uni.getWindowInfo();
        if (!sys || !sys.windowWidth) {
          console.warn('Failed to get window info');
          return;
        }
        var w = sys.windowWidth - 32;
        // 扩大签字区域高度，从25%增加到35%
        var h = Math.floor(sys.windowHeight * 0.35);
        this.canvasW = w;
        this.canvasH = h;

        // 微信小程序使用Canvas 2D接口
        uni.createSelectorQuery().in(this).select('#signCanvas').fields({
          node: true,
          size: true
        }).exec(function (res) {
          var canvas = res && res[0] && res[0].node;
          if (canvas && canvas.getContext) {
            // 使用Canvas 2D接口
            var dpr = sys.pixelRatio || 1;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            var ctx = canvas.getContext('2d');
            ctx.scale(dpr, dpr);
            // 优化画笔设置
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#000';
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.globalCompositeOperation = 'source-over';
            _this2._canvasNode = canvas;
            _this2.ctx = ctx;
          } else {
            // 降级到旧接口
            var c = uni.createCanvasContext('signCanvas', _this2);
            c.setStrokeStyle('#000');
            c.setLineWidth(3);
            c.setLineCap('round');
            c.setLineJoin('round');
            _this2.ctx = c;
          }
        });
      } catch (error) {
        console.error('Canvas initialization failed:', error);
        this.ctx = null;
      }
    },
    onStart: function onStart(e) {
      if (!this.ctx) {
        console.warn('Canvas context not initialized');
        return;
      }

      // 初始化逐帧队列与状态
      if (!Array.isArray(this.pointQueue)) this.pointQueue = [];
      this.rafId = null;
      this.signConfirmed = false;
      var p = e.touches && e.touches[0] ? e.touches[0] : {};
      var x = p.x || p.clientX || 0;
      var y = p.y || p.clientY || 0;
      this.last = {
        x: x,
        y: y
      };
      this.isDrawing = true;
      if (this._isH5Ctx()) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        // 在起始点画一个小点，确保单点也能显示
        this.ctx.arc(x, y, 1, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.draw(true);
      }
    },
    onMove: function onMove(e) {
      var _this3 = this;
      if (!this.last || !this.ctx || !this.isDrawing) return;
      var p = e.touches && e.touches[0] ? e.touches[0] : {};
      var x = p.x || p.clientX || 0;
      var y = p.y || p.clientY || 0;

      // 计算距离，降低阈值以提高流畅性
      var dx = x - this.last.x;
      var dy = y - this.last.y;
      var distance = Math.sqrt(dx * dx + dy * dy);

      // 进一步降低距离阈值，确保连续性，同时避免过密计算
      if (distance < 0.5) return;

      // 采用逐帧绘制：收集点，按帧绘制，减少频繁 stroke/beginPath
      if (!Array.isArray(this.pointQueue)) this.pointQueue = [];
      this.pointQueue.push({
        x: x,
        y: y
      });
      if (!this.rafId) {
        var raf = function raf(cb) {
          // H5 优先使用 window.requestAnimationFrame
          if (typeof window !== 'undefined' && window.requestAnimationFrame) return window.requestAnimationFrame(cb);
          // 微信 Canvas 2D 对象可能支持 requestAnimationFrame
          if (_this3._canvasNode && typeof _this3._canvasNode.requestAnimationFrame === 'function') return _this3._canvasNode.requestAnimationFrame(cb);
          // 其他环境降级
          return setTimeout(cb, 16);
        };
        this.rafId = raf(function () {
          _this3.rafId = null;
          // 批量消费队列
          while (_this3.pointQueue.length) {
            var pt = _this3.pointQueue.shift();
            var midX = (_this3.last.x + pt.x) / 2;
            var midY = (_this3.last.y + pt.y) / 2;
            if (_this3._isH5Ctx()) {
              _this3.ctx.quadraticCurveTo(_this3.last.x, _this3.last.y, midX, midY);
              _this3.ctx.stroke();
              _this3.ctx.beginPath();
              _this3.ctx.moveTo(midX, midY);
            } else {
              _this3.ctx.lineTo(pt.x, pt.y);
              _this3.ctx.stroke();
            }
            _this3.last = {
              x: pt.x,
              y: pt.y
            };
          }
          // 小程序端提交一次绘制
          if (!_this3._isH5Ctx()) {
            _this3.ctx.draw(true);
          }
        });
      }
      this.hasStroke = true;
    },
    onEnd: function onEnd() {
      this.last = null;
      this.isDrawing = false;

      // 清理防抖定时器
      if (this.drawTimer) {
        clearTimeout(this.drawTimer);
        this.drawTimer = null;
      }
      // 清理逐帧队列
      this.pointQueue = [];
      this.rafId = null;

      // 结束绘制时，确保路径完整
      if (this.ctx) {
        if (this._isH5Ctx()) {
          this.ctx.stroke();
        } else {
          // 小程序端确保最后的绘制被提交
          this.ctx.draw(true);
          this.pendingDraw = false;
        }
      }
    },
    cancelCheckout: function cancelCheckout() {
      uni.showModal({
        title: '确认取消',
        content: '确定要取消当前结算吗？',
        success: function success(res) {
          if (res.confirm) {
            uni.navigateBack();
          }
        }
      });
    },
    clearSign: function clearSign() {
      this.hasStroke = false;
      this.signConfirmed = false;
      this.signImage = '';
      this.isDrawing = false;
      this.last = null;
      if (this.ctx) {
        if (this._isH5Ctx()) {
          // Canvas 2D接口
          this.ctx.clearRect(0, 0, this.canvasW, this.canvasH);
        } else {
          // 旧版接口
          this.ctx.clearRect(0, 0, this.canvasW, this.canvasH);
          this.ctx.draw();
        }
      }
    },
    captureSignature: function captureSignature() {
      var _this4 = this;
      return new Promise(function (resolve, reject) {
        // 微信小程序Canvas 2D接口导出
        if (_this4._canvasNode && _this4._canvasNode.toDataURL) {
          try {
            var dataUrl = _this4._canvasNode.toDataURL('image/png');
            return resolve(dataUrl);
          } catch (e) {
            console.error('Canvas 2D导出失败，降级到旧接口:', e);
          }
        }

        // 降级到旧版接口
        uni.canvasToTempFilePath({
          canvasId: 'signCanvas',
          fileType: 'png',
          quality: 1,
          success: function success(res) {
            console.log('微信小程序签名导出成功:', res.tempFilePath);
            resolve(res.tempFilePath);
          },
          fail: function fail(err) {
            console.error('微信小程序签名导出失败:', err);
            reject(err);
          }
        }, _this4);
      });
    },
    confirmSign: function confirmSign() {
      var _this5 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee() {
        var img;
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (_this5.hasStroke) {
                  _context.next = 3;
                  break;
                }
                _util.uiUtils.showToast('请先签名');
                return _context.abrupt("return");
              case 3:
                _context.prev = 3;
                _context.next = 6;
                return _this5.captureSignature();
              case 6:
                img = _context.sent;
                _this5.signImage = img;
                _this5.signConfirmed = true;
                _util.uiUtils.showSuccess('签名已确认');
                _context.next = 15;
                break;
              case 12:
                _context.prev = 12;
                _context.t0 = _context["catch"](3);
                _util.uiUtils.showError('导出签名失败');
              case 15:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, null, [[3, 12]]);
      }))();
    },
    confirmSettle: function confirmSettle() {
      var _this6 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee2() {
        var store, k, signAt;
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (_this6.cart.length) {
                  _context2.next = 3;
                  break;
                }
                _util.uiUtils.showToast('清单为空');
                return _context2.abrupt("return");
              case 3:
                if (_this6.signConfirmed) {
                  _context2.next = 6;
                  break;
                }
                _util.uiUtils.showToast('请先确认签名');
                return _context2.abrupt("return");
              case 6:
                if (_this6.signImage) {
                  _context2.next = 15;
                  break;
                }
                _context2.prev = 7;
                _context2.next = 10;
                return _this6.captureSignature();
              case 10:
                _this6.signImage = _context2.sent;
                _context2.next = 15;
                break;
              case 13:
                _context2.prev = 13;
                _context2.t0 = _context2["catch"](7);
              case 15:
                store = uni.getStorageSync('recordsByDate') || {};
                k = dateKey();
                if (!store[k]) store[k] = [];
                signAt = new Date().toLocaleString();
                _this6.cart.forEach(function (i) {
                  store[k].unshift({
                    id: i.id,
                    code: i.materialCode,
                    name: i.materialName,
                    type: i.type,
                    quantity: i.quantity,
                    time: _this6.formatTime(i.timestamp),
                    department: _this6.selectedDept,
                    ioType: _this6.selectedIo,
                    signAt: signAt,
                    signImage: _this6.signImage
                  });
                });
                uni.setStorageSync('recordsByDate', store);
                uni.removeStorageSync('cartList');
                _util.uiUtils.showSuccess('结算完成');
                setTimeout(function () {
                  uni.reLaunch({
                    url: '/pages/material/index'
                  });
                }, 1500);
              case 24:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, null, [[7, 13]]);
      }))();
    },
    importRecords: function importRecords() {
      // 模拟导入记录功能
      uni.showModal({
        title: '导入记录',
        content: '是否要导入历史记录？',
        success: function success(res) {
          if (res.confirm) {
            // 这里可以实现实际的导入逻辑
            _util.uiUtils.showSuccess('导入成功');
          }
        }
      });
    },
    _isH5Ctx: function _isH5Ctx() {
      // 仅在存在真实 Canvas 2D 节点时返回 true（H5 或小程序 Canvas 2D）
      return !!(this._canvasNode && typeof this._canvasNode.getContext === 'function');
    }
  }
};
exports.default = _default;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 2)["default"]))

/***/ }),

/***/ 68:
/*!***************************************************************************************************************************!*\
  !*** C:/Users/chejun/Desktop/woerp/pages/checkout/checkout.vue?vue&type=style&index=0&id=a037f574&lang=scss&scoped=true& ***!
  \***************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_checkout_vue_vue_type_style_index_0_id_a037f574_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/mini-css-extract-plugin/dist/loader.js??ref--8-oneOf-1-0!./node_modules/css-loader/dist/cjs.js??ref--8-oneOf-1-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-2!./node_modules/postcss-loader/src??ref--8-oneOf-1-3!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/sass-loader/dist/cjs.js??ref--8-oneOf-1-4!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-5!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./checkout.vue?vue&type=style&index=0&id=a037f574&lang=scss&scoped=true& */ 69);
/* harmony import */ var _D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_checkout_vue_vue_type_style_index_0_id_a037f574_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_checkout_vue_vue_type_style_index_0_id_a037f574_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_checkout_vue_vue_type_style_index_0_id_a037f574_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_checkout_vue_vue_type_style_index_0_id_a037f574_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_D_Program_Files_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_checkout_vue_vue_type_style_index_0_id_a037f574_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ 69:
/*!*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/mini-css-extract-plugin/dist/loader.js??ref--8-oneOf-1-0!./node_modules/css-loader/dist/cjs.js??ref--8-oneOf-1-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-2!./node_modules/postcss-loader/src??ref--8-oneOf-1-3!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/sass-loader/dist/cjs.js??ref--8-oneOf-1-4!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-5!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!C:/Users/chejun/Desktop/woerp/pages/checkout/checkout.vue?vue&type=style&index=0&id=a037f574&lang=scss&scoped=true& ***!
  \*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin
    if(false) { var cssReload; }
  

/***/ })

},[[59,"common/runtime","common/vendor"]]]);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/checkout/checkout.js.map