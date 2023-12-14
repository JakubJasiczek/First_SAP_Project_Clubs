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
			if (oEvent.getParameter("columnId") != this.getView().createId("resultMatchesNameColumn") && oEvent.getParameter("columnId") != this.getView().createId("noResultMatchesNameColumn") && oEvent.getParameter("columnId") != this.getView().createId("eventNameColumn") ) {
				return; //Custom context menu for product id column only
			}

			let oRowContext = oEvent.getParameter("rowBindingContext").getProperty("ID");
			this.getRouter().navTo("match",{
				ID : oRowContext
			});
		},

		onTablePage: function(oEvent){ 
			let oLiga = oEvent.getSource().getBindingContext().getObject();
			this.getRouter().navTo("main_View",{
				ID : oLiga.ID,
				name: oLiga.name
			});
		},

		onCreateEvent: function() {
			this.getRouter().navTo("createEvent");
		},
		
		onTodayMatches: function() {
			this.getRouter().navTo("RouteMain_view");
		},

		onNavBack: function () {
			let oHistory, sPreviousHash;

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