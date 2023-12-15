sap.ui.define([
    "projectclub/controller/BaseController",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/format/DateFormat",
    "sap/ui/model/Filter",
    'sap/ui/core/date/UI5Date',
    "sap/ui/model/json/JSONModel",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController,FilterOperator,DateFormat,Filter,UI5Date,JSONModel) {
        "use strict";
        let aMatches = new JSONModel();
        return BaseController.extend("projectclub.controller.Today_Matches", {
            onInit: function () {

            },

            onAfterRendering:function(){
                let oDateFormat = DateFormat.getDateTimeInstance({
                    pattern: "dd MMM YYYY",
                    strictParsing: true,
                });
                let sDate = oDateFormat.format(UI5Date.getInstance());
                this.onFilterTable(sDate);
            },

            onFilterTable:function(sDate){
                let oTable = this.getView().byId("todayMatchesTable");
                oTable.setVisible(false);
                this.byId("im").setVisible(false);
                oTable.setVisibleRowCount(1000)
                let filter1 = new Filter("dateEventString", FilterOperator.Contains, sDate);
                this.getView().byId("todayMatchesTable").getBinding("rows").filter([filter1]);
                
                
                setTimeout(()=>{       //Get hold of table
                    let oRowsBinding = oTable.getBinding("rows").aContexts.length;
                    oTable.setVisibleRowCount(oRowsBinding)
                    if(oRowsBinding===0){oTable.setVisible(false);this.byId("im").setVisible(true)}
                    else {oTable.setVisible(true);this.byId("im").setVisible(false)}
                },"1000"); 
            },

            handleCalendarSelect: function(oEvent) {
                let oCalendar = oEvent.getSource(),
                    oSelectedDate = oCalendar.getSelectedDates()[0],
                    oStartDate = oSelectedDate.getStartDate();
                if (this.oLastSelectedJSDate && oStartDate.getTime() === this.oLastSelectedJSDate.getTime()) {
                    return;
                } else {
                    this.oLastSelectedJSDate = oStartDate;
                }
				let aSelectedDates = oCalendar.getSelectedDates();
				let oDateFormat = DateFormat.getDateTimeInstance({
                    pattern: "dd MMM YYYY",
                    strictParsing: true,
                });
                let oDate;
                let sDate;
                if (aSelectedDates.length > 0 ) {
                    oDate = aSelectedDates[0].getStartDate();
                    sDate = oDateFormat.format(oDate);
                } else {
                    sDate = oDateFormat.format(UI5Date.getInstance());
                }
                this.onFilterTable(sDate);
            },
        });
    });
