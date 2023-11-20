sap.ui.define([
	"sap/ui/core/mvc/Controller",
    "projectclub/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function (Controller,BaseController,JSONModel) {
	"use strict";

	return BaseController.extend("projectclub.controller.ClubPage", {

		onInit: function () {
			var oRouter = this.getRouter();
			oRouter.getRoute("clubPage").attachPatternMatched(this._onRouteMatched,this);

			var oImgModel = new JSONModel(sap.ui.require.toUrl("projectclub/mockdata/img.json"));
			this.getView().setModel(oImgModel, "img");
			this.mainModel = this.getView().getModel()
		},
		onNavBack1: function(){ 
			this.getRouter().navTo("RouteMain_view");
		},

		_onRouteMatched: function(oEvent) {
			this.getView().bindElement({
				path : "/Clubs(" + oEvent.getParameter("arguments").ID + ")",
				
			})
			let clubID = oEvent.getParameter("arguments").ID
			setTimeout(() => {
				var oModel = new sap.ui.model.json.JSONModel();
				let oData = this.getView().getBindingContext().getObject();
				console.log(this.getView().getBindingContext().getObject());
				var data = {
					'Clubs' : [{
						"win": oData.win,
						"lose": oData.lose, 
						"draw": oData.draw,
						"gols_lose": oData.gols_lose,
						"gols_score": oData.gols_score
						}]};
				oModel.setData(data);
				let oMatchVizFrame = this.byId('idMatchVizFrame');
				oMatchVizFrame.setModel(oModel);
				let oGolsVizFrame = this.byId("idGolsVizFrame");
				oGolsVizFrame.setModel(oModel);
			  }, "1000");
			//this.byId("flattenMatchData").bindData({path:`/Clubs(ID=${oEvent.getParameter("arguments").ID})`});
		},

		filterGlobally: function(oEvent) {
			var sQuery = oEvent.getParameter("query");
			this._oGlobalFilter = null;
			
			if (sQuery) {
				this._oGlobalFilter = new Filter({
						path: "name", 
						operator: FilterOperator.Contains, 
						value1: sQuery,
						caseSensitive: false});
			}

			this.byId("table").getBinding("rows").filter(this._oGlobalFilter, "Application");
		},

		sortTable: function(oEvent) {
			let oColumnName = oEvent.getParameter("column");
			if(oColumnName.getProperty("sortProperty") === "position"){
				this.sortByPosition();
			} else {
				this._bSortColumnDescending = false;
				var oTable = this.byId("table");
				var oPositionColumn = this.byId("position");
				var sSortProperty;
				
				if(oColumnName.getProperty("sortOrder") === "Descending") {
					sSortProperty = SortOrder.Ascending;
				} else {
					sSortProperty = SortOrder.Descending;
				}
				
				oTable.sort(oColumnName, sSortProperty, false);
				oTable.sort(oPositionColumn, SortOrder.Ascending, true);
				console.log(this.byId("name").getProperty("sortOrder"));
			}
		}
	});

});
