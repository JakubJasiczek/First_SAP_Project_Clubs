sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/table/library",
    "projectclub/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	'sap/ui/core/date/UI5Date',
	"sap/ui/model/FilterOperator",
	"sap/ui/core/format/DateFormat",
    "sap/ui/model/Filter",
	"sap/m/MessageToast",
], function (Controller, library, BaseController, JSONModel, UI5Date, FilterOperator, DateFormat, Filter, MessageToast) {
	"use strict";
	let SortOrder = library.SortOrder;
	return BaseController.extend("projectclub.controller.ClubPage", {

		onInit: function () {
			var oRouter = this.getRouter();
			oRouter.getRoute("clubPage").attachPatternMatched(this._onRouteMatched,this);

			var oImgModel = new JSONModel(sap.ui.require.toUrl("projectclub/mockdata/img.json"));
			this.getView().setModel(oImgModel, "img");
			this.mainModel = this.getView().getModel();
			
		},
		onNavBack1: function(){ 
			this.getRouter().navTo("RouteMain_view");
		},

		_onRouteMatched: function(oEvent) {
			this.getView().bindElement({
				path : "/Clubs(" + oEvent.getParameter("arguments").ID + ")",
				
			})
			let clubID = oEvent.getParameter("arguments").ID
			let that = this;
				$.ajax({
					type: "GET",
					contentType: "application/json",
					url: `/odata/v4/clubapp/Clubs/${clubID}?$expand=matchesAway,matchesHome`,
					dataType: "json",
					async: false,
					success: function(data) {
						that._normalSettings(data)
					},
					error: function () {
						MessageToast.show("Server Send Error");
					}
				});
				
		},

		_normalSettings:function(data){
			var oModel = new JSONModel();
			let oModelMatches = new JSONModel();
			var aRestData = {
				winsPerMatch : data.win/data.match*100,
				losePerMatch : data.lose/data.match*100,
				drawPerMatch : data.draw/data.match*100,
				pointsPerMatch : data.points/data.match,
				golsPerMatch : (data.gols_lose+data.gols_score)/data.match,
				golsScorePerMatch : data.gols_score/data.match,
				golsLosePerMatch : data.gols_lose/data.match,
			};
			let aMatches = [...data.matchesAway,...data.matchesHome]
			oModel.setData({'ClubStats' : [data,aRestData]});
			oModelMatches.setData({"machtes" : aMatches});
			this.getView().setModel(oModel,"clubStats");
			this.getView().setModel(oModelMatches,"allMatches");

			this.byId("clubPageTable").bindRows({path:`/Ligi(ID=${data.liga_ID})/clubs`});
			this._bSortColumnDescending = false;
			this.sortByPosition();
			this._filterMatchesByDate();
			this._sortTables();
			console.log(data)
		},

		_sortTables:function(){
			this.byId("resultMatchesTable").sort(this.byId("resultMatchesDataColumnUnvisible"), library.SortOrder.Descending, false);
			this.byId("noResultMatchesTable").sort(this.byId("noResultMatchesDataColumnUnvisible"), library.SortOrder.Ascending, false);
		},

		_filterMatchesByDate: function(){
			var oDateFormat = DateFormat.getDateTimeInstance({
				pattern: "YYYY-MM-ddTHH:mm:ssZ",
				strictParsing: true
			});
			let sDate = oDateFormat.format(UI5Date.getInstance());

			var filter1 = new Filter("dateEvent", FilterOperator.LT, sDate);
			var filter2 = new Filter("dateEvent", FilterOperator.GE, sDate);
			this.getView().byId("resultMatchesTable").getBinding("rows").filter([filter1]);
			this.getView().byId("noResultMatchesTable").getBinding("rows").filter([filter2]);
		},


		sortByPosition: function() {
			var oTable = this.byId("clubPageTable");
			var oPositionColumn = this.byId("clubPageTablePositionColumn");

			oTable.sort(oPositionColumn, this._bSortColumnDescending ? SortOrder.Descending : SortOrder.Ascending , false);
			this._bSortColumnDescending = !this._bSortColumnDescending;
		},

		sortTable: function(oEvent) {
			let oColumnName = oEvent.getParameter("column");
			if(oColumnName.getProperty("sortProperty") === "position"){
				this.sortByPosition();
			} else {
				this._bSortColumnDescending = false;
				var oTable = this.byId("clubPageTable");
				var oPositionColumn = this.byId("clubPageTablePositionColumn");
				var sSortProperty;
				
				if(oColumnName.getProperty("sortOrder") === "Descending") {
					sSortProperty = SortOrder.Ascending;
				} else {
					sSortProperty = SortOrder.Descending;
				}
				
				oTable.sort(oColumnName, sSortProperty, false);
				oTable.sort(oPositionColumn, SortOrder.Ascending, true);
			}
		}
	});

});
