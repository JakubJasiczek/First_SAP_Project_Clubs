sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/table/library",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
    "projectclub/controller/BaseController"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, library, Filter, FilterOperator, BaseController) {
        "use strict";
        let SortOrder = library.SortOrder;

        return BaseController.extend("projectclub.controller.Main_view", {
            onInit: function () {
                let oRouter = this.getRouter();
			oRouter.getRoute("main_View").attachPatternMatched(this._onRouteMatched,this);
            },

            _onRouteMatched: function(oEvent) {
                this.getView().bindElement({
                    path : "/Ligi",
              })
                let leagueID = oEvent.getParameter("arguments").ID;
                let leagueName = oEvent.getParameter("arguments").name;
                this.sortLigi(leagueID,leagueName)
            },

            onAfterRendering: function () {
                
                
                this.getView().byId("title").setTitle("PKO BP Ekstraklasa");
            },

            formatAvailableToObjectState: function(bAvailable) {
                return bAvailable ? "Success" : "Error";
            },

            refresh: function(){
                this.byId("table").getBinding("rows").refresh();
                this.clearAllSortings();
            },

            openClubPage: function (oEvent) {
                if (oEvent.getParameter("columnId") != this.getView().createId("name")) {
                    return; //Custom context menu for product id column only
                }

                let oRowContext = oEvent.getParameter("rowBindingContext").getProperty("ID");
                this.getRouter().navTo("clubPage",{
                    ID : oRowContext
                });
            },

            sortLigi: function (leagueID,leagueName) {
                if(leagueID==="0f14c421-168c-4461-a3b4-fe1071360890" || leagueID==="5abf0c3b-1bed-4596-951c-731cbac2aeda" || leagueID==="2aef14b4-079c-4d47-916a-9d8021d5355f"){this.byId("table").setVisibleRowCount(20)}else{this.byId("table").setVisibleRowCount(18)}
                this.byId("table").bindRows({path:`/Ligi(ID=${leagueID})/clubs`});
                this.clearAllSortings();
                this.getView().byId("title").setTitle(leagueName);
            },

            clearAllSortings: function() {
                let oTable = this.byId("table");
                oTable.getBinding().sort(null);
                this._resetSortingState();
                this._bSortColumnDescending = false;
                this.sortByPosition();
            },

            _resetSortingState: function() {
                let oTable = this.byId("table");
                let aColumns = oTable.getColumns();
                for (let i = 0; i < aColumns.length; i++) {
                    aColumns[i].setSorted(false);
                }
            
            },

            sortByPosition: function() {
			    let oTable = this.byId("table");
                let oPositionColumn = this.byId("position");

                oTable.sort(oPositionColumn, this._bSortColumnDescending ? SortOrder.Descending : SortOrder.Ascending , false);
                this._bSortColumnDescending = !this._bSortColumnDescending;
            },

            filterGlobally: function(oEvent) {
                let sQuery = oEvent.getParameter("query");
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
                    let oTable = this.byId("table");
                    let oPositionColumn = this.byId("position");
                    let sSortProperty;
                    
                    if(oColumnName.getProperty("sortOrder") === "Descending") {
                        sSortProperty = SortOrder.Ascending;
                    } else {
                        sSortProperty = SortOrder.Descending;
                    }
                    
                    oTable.sort(oColumnName, sSortProperty, false);
                    oTable.sort(oPositionColumn, SortOrder.Ascending, true);
                }
            },
        });
    });
