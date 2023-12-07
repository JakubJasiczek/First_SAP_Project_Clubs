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
        var SortOrder = library.SortOrder;

        return BaseController.extend("projectclub.controller.Main_view", {
            onInit: function () {

            },

            onAfterRendering: function () {
                this.byId("navigationList").setSelectedItem("container-projectclub---Main_view--_LigiNavigationListItem-container-projectclub---Main_view--navigationList-0")
                this.byId("table").bindRows({path:`/Ligi(ID=66b64b3f-1520-4cd7-aebd-3c9d95910692)/clubs`});
                this.sortByPosition();
                
                this.getView().byId("title").setTitle("PKO BP Ekstraklasa");
            },

            formatAvailableToObjectState: function(bAvailable) {
                return bAvailable ? "Success" : "Error";
            },

            refresh: function(){
                this.byId("table").getBinding("rows").refresh();
                this.clearAllSortings();
            },

            onDisplayNotFound : function () {
                // display the "notFound" target without changing the hash
                /*this.getRouter().getTargets().display("notFound", {
                    fromTarget : "TargetMain_view"
                });*/
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

            openCreateEvent: function() {
                this.getRouter().navTo("createEvent");
            },

            sortLigi: function (oEvent) {
                let oLiga = oEvent.getSource().getBindingContext().getObject();
                if(oLiga.ID==="7abf0c3b-1bed-4596-951c-731cbac2aeda"){this.byId("table").setVisibleRowCount(20)}else{this.byId("table").setVisibleRowCount(18)}
                this.byId("table").bindRows({path:`/Ligi(ID=${oLiga.ID})/clubs`});
                this.clearAllSortings();
                this.getView().byId("title").setTitle(oLiga.name);
            },

            clearAllSortings: function() {
                var oTable = this.byId("table");
                oTable.getBinding().sort(null);
                this._resetSortingState();
                this._bSortColumnDescending = false;
                this.sortByPosition();
            },

            _resetSortingState: function() {
                var oTable = this.byId("table");
                var aColumns = oTable.getColumns();
                for (var i = 0; i < aColumns.length; i++) {
                    aColumns[i].setSorted(false);
                }
            
            },

            sortByPosition: function() {
			    var oTable = this.byId("table");
                var oPositionColumn = this.byId("position");

                oTable.sort(oPositionColumn, this._bSortColumnDescending ? SortOrder.Descending : SortOrder.Ascending , false);
                this._bSortColumnDescending = !this._bSortColumnDescending;
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
                }
            },
        });
    });
