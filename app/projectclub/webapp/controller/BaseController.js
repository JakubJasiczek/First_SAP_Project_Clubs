sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/core/UIComponent"
], function(Controller, History, UIComponent) {
	"use strict";

	return Controller.extend("projectclub.controller.BaseController", {

		getRouter : function () {
			return UIComponent.getRouterFor(this);
		},

		onMatchPage : function (oEvent) {
			if (oEvent.getParameter("columnId") != this.getView().createId("resultMatchesNameColumn") && oEvent.getParameter("columnId") != this.getView().createId("noResultMatchesNameColumn")) {
				return; //Custom context menu for product id column only
			}

			let oRowContext = oEvent.getParameter("rowBindingContext").getProperty("ID");
			this.getRouter().navTo("match",{
				ID : oRowContext
			});
		},

		onTablePage: function(){ 
			this.getRouter().navTo("RouteMain_view");
		},

		onCreateEvent: function() {
			this.getRouter().navTo("createEvent");
		},

		onNavBack: function () {
			var oHistory, sPreviousHash;

			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("appHome", {}, true /*no history*/);
			}
		}

	});

});