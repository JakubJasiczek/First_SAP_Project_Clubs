sap.ui.define([
	"sap/ui/core/mvc/Controller",
    "projectclub/controller/BaseController"
], function (Controller,BaseController) {
	"use strict";

	return BaseController.extend("projectclub.controller.NotFound", {

		onInit: function () {
			this.getRouter().getTarget("notFound").attachDisplay(function (oEvent) {
				this._oData = oEvent.getParameter("data");	// store the data
			}, this);
		},

		onAfterRendering: function () {
			
		},

		onNavBack : function () {
			// in some cases we could display a certain target when the back button is pressed
			if (this._oData && this._oData.fromTarget) {
				this.getRouter().getTargets().display(this._oData.fromTarget);
				delete this._oData.fromTarget;
				return;
			}

			// call the parent's onNavBack
			BaseController.prototype.onNavBack.apply(this, arguments);
		}
	});

});
