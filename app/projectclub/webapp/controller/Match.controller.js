sap.ui.define([
	"sap/ui/core/mvc/Controller",
    "projectclub/controller/BaseController"
], function (Controller,BaseController) {
	"use strict";

	return BaseController.extend("projectclub.controller.Match", {

		onInit: function () {
			this.getRouter().getRoute("match").attachPatternMatched(this._onRouteMatched,this);
		},

		_onRouteMatched: function(oEvent) {
			this.getView().bindElement({
				path : "/Match(" + oEvent.getParameter("arguments").ID + ")",
				
			})
			let matchID = oEvent.getParameter("arguments").ID
			
			let that = this;
			$.ajax({
				type: "GET",
				contentType: "application/json",
				url: `/odata/v4/clubapp/Match/${matchID}`,
				dataType: "json",
				async: false,
				success: function(data) {
					
				},
				error: function () {
					MessageToast.show("Server Send Error");
				}
			});
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
