sap.ui.define([
    "projectclub/controller/BaseController",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/format/DateFormat",
    "sap/ui/model/Filter",
    'sap/ui/core/date/UI5Date',
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController,FilterOperator,DateFormat,Filter,UI5Date) {
        "use strict";

        return BaseController.extend("projectclub.controller.Today_Matches", {
            onInit: function () {

            },

            onAfterRendering:function(){
                let oDateFormat = DateFormat.getDateTimeInstance({
                    pattern: "dd MMM YYYY",
                    strictParsing: true,
                });
                let sDate = oDateFormat.format(UI5Date.getInstance(2023,11,3));
                let filter1 = new Filter("dateEventString", FilterOperator.Contains, sDate);
                this.getView().byId("todayMatchesTable").getBinding("rows").filter([filter1]);
                setTimeout(()=>{
                    let oTable = this.getView().byId("todayMatchesTable");          //Get hold of table
                    let oRowsBinding = oTable.getBinding("rows").aContexts.length;
                    console.log(oRowsBinding)
                    this.byId("todayMatchesTable").setVisibleRowCount(oRowsBinding)
                    if(oRowsBinding===0){this.byId("todayMatchesTable").setVisible(false);this.byId("im").setVisible(true)}
                    else {this.byId("todayMatchesTable").setVisible(true);this.byId("im").setVisible(false)}
                },"50"); 
            }
        });
    });
