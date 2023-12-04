sap.ui.define([
	"sap/ui/core/mvc/Controller",
    "projectclub/controller/BaseController",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	'sap/ui/model/json/JSONModel',
	"sap/ui/table/library",
	'sap/ui/core/date/UI5Date',
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
], function (Controller,BaseController, MessageBox, MessageToast, JSONModel, library, UI5Date, Filter, FilterOperator) {
	"use strict";
	var oModel = new JSONModel();
	return BaseController.extend("projectclub.controller.CreateEvent", {

		onInit: function () {
			var oTimeModel = new JSONModel();
			oTimeModel.setData({
				valueDTP2: UI5Date.getInstance(),
			});
			this.byId("statsDataAndTimePicker").setModel(oTimeModel);
			this.byId("statsDataAndTimePicker").setProperty("dateValue",null);
			this.byId("eventDataAndTimePicker").setModel(oTimeModel);
			this.byId("eventDataAndTimePicker").setProperty("dateValue",null);
			this.byId("eventDataAndTimePickerEdit").setModel(oTimeModel);
			this.byId("eventDataAndTimePickerEdit").setProperty("dateValue",null);
		},

		onNavBack1: function(){ 
			this.getRouter().navTo("RouteMain_view");
		},

		restartSelects: function(){
			this.byId("eventDataAndTimePicker").setProperty("dateValue",null);
			this.byId("eventDataAndTimePicker").setProperty("value",null);
			
			this.byId("addEventLeagueSelect").setSelectedItem(null);
			this.byId("homeClubSelect").setProperty("editable",false);
			this.byId("awayClubSelect").setProperty("editable",false);
			this.byId("homeClubSelect").setSelectedItem(null);
			this.byId("awayClubSelect").setSelectedItem(null);
		},

		selectItemName: function(selectID,nameItem){
			var oList = this.getView().byId(selectID);
			let oFirstItem;

			for(let i = 0 ;i<oList.getItems().length ;i++){
				if(oList.getItems()[i].getText() === nameItem){
					oFirstItem = oList.getItems()[i];
					break;
				}
			}
			
			oList.setSelectedItem(oFirstItem, true, true);
		},

		leagueSelected: function (oEvent) {
			let oLeagueID = oEvent.getSource().getProperty("selectedKey");
			var oItemTemplate = new sap.ui.core.ListItem({text:"{name}"});
			
			let oSelect1 = this.byId("homeClubSelect");
			let oSelect2 = this.byId("awayClubSelect");

			oSelect1.setProperty("editable",true);
			oSelect2.setProperty("editable",true);

			oSelect1.bindItems(`/Ligi(ID=${oLeagueID})/clubs`,oItemTemplate);
			oSelect2.bindItems(`/Ligi(ID=${oLeagueID})/clubs`,oItemTemplate);
		},

		editLeagueSelected:function() {
			let oLeagueID = this.byId("editEventLeagueSelect").getSelectedItem().getKey();
			var oItemTemplate = new sap.ui.core.ListItem({text:"{name}"});
			
			let oSelect1 = this.byId("editHomeClubSelect");
			let oSelect2 = this.byId("editAwayClubSelect");

			oSelect1.setSelectedItem(null);
			oSelect2.setSelectedItem(null);

			oSelect1.bindItems(`/Ligi(ID=${oLeagueID})/clubs`,oItemTemplate);
			oSelect2.bindItems(`/Ligi(ID=${oLeagueID})/clubs`,oItemTemplate);
		},

		onClickAddButton: function () {
			let oHomeClubSelectedItem = this.byId("homeClubSelect").getSelectedItem();
			let oAwayClubSelectedItem = this.byId("awayClubSelect").getSelectedItem();
			let that = this;
			let dataValue = this.byId("eventDataAndTimePicker").getProperty("dateValue");
			

			if(oHomeClubSelectedItem === null || oAwayClubSelectedItem === null || dataValue === null){
				MessageBox.error("Wybierz Dane.", {
					actions: [ MessageBox.Action.CLOSE]
				});
				return;
			}

			let oHomeClubItem = oHomeClubSelectedItem.getBindingContext().getObject();
			let oAwayClubItem = oAwayClubSelectedItem.getBindingContext().getObject();
			let awayClubName = oAwayClubItem.name;
			let homeClubName = oHomeClubItem.name;
			let awayClubID = oAwayClubItem.ID;
			let homeClubID = oHomeClubItem.ID;
			let leagueName = this.byId("addEventLeagueSelect").getSelectedItem().getProperty("text");
			let leagueID = this.byId("addEventLeagueSelect").getSelectedItem().getKey();
			let dataValueString = this.byId("eventDataAndTimePicker").getProperty("value");
			let roundValue = this.byId("addStepInput").getValue();
			
			if(homeClubID===awayClubID){
				MessageBox.error("Nie można stworzyć wydarzenia. Błędne wybranie danych.", {
					actions: [ MessageBox.Action.CLOSE],
					emphasizedAction: MessageBox.Action.CLOSE,
					onClose: function (sAction) {
						
					}
				});
			} else {
				let oPayload = {

					/*"dateEvent" : dataValue,*/
					"homeName" : homeClubName ,
					"home_ID" : homeClubID,
					"awayName" : awayClubName ,
					"away_ID" : awayClubID,
					"league" : leagueName,
					"league_id_ID" : leagueID,
					"dateEvent" : dataValue ,
					"dateEventString" : dataValueString ,
					"round" : roundValue,
				};

				$.ajax({
					url: "/odata/v4/clubapp/Match",
					type: "POST",
					data: JSON.stringify(oPayload),
					dataType: "json", 
					contentType: "application/json",
					success: function () {
						MessageToast.show("Utworzono wydarzenie.");
						that.refresh();
					},
					error: function () {
						MessageToast.show("Server Send Error");
					}
				  });
				this.restartSelects(); 
			}
		},

		onEventButton: function(oEvent) {
			let rowIndex = this.byId("eventTable").getSelectedIndex();
			if(rowIndex === -1){
				MessageToast.show("Brak wyboru wydazrenia.");
				return;
			}

			let textButton = oEvent.getSource().getId().substr(37);
			let clubPath = this.byId("eventTable").getContextByIndex(rowIndex).getPath();

			if(textButton==="editEventButton" || textButton==="addEventStatsButtton"){this.onEditOrAddStatsEventButton(clubPath,textButton)}
			else if(textButton==="deleteEventButton"){this.onDeleteEventButton(clubPath)}
		},

		onEditOrAddStatsEventButton: function(clubPath,textButton) {	
			let matchID = clubPath.substr(7,36);
			let that = this;	
			$.ajax({
				type: "GET",
				contentType: "application/json",
				url: `/odata/v4/clubapp/Match/${matchID}`,
				dataType: "json",
				async: false,
				success: function(data) {
					oModel.setData(data);
					MessageToast.show("Pobranie danych...");
					if(textButton==="editEventButton"){that.editDialogOpen(oModel);}
					else if(textButton==="addEventStatsButtton"){that.addStatsEventDialogOpen(oModel);}
				},
				error: function () {
					MessageToast.show("Server Send Error");
				}
			});
		},

		onDeleteEventButton: function(clubPath){	
			let that = this;
			MessageBox.warning("Czy napewno chcesz usunąć wydarzenie?", {
				actions: [MessageBox.Action.YES, MessageBox.Action.CANCEL],
				onClose: function (sAction) {
					if(sAction === "YES"){
						let matchID = clubPath.substr(7,36);
						$.ajax({
							url: `/odata/v4/clubapp/Match/${matchID}`,
							type: 'DELETE',
							success: function() {
								MessageToast.show("Wydarzenie usunięto!");
								that.refresh()
							},
							error: function () {
								MessageToast.show("Server Send Error");
							}
						});
					} else {return;}
				}
			});
		},

		addStatsEventDialogOpen: function(clubPath){
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy-MM-ddTHH:mm:ss"
			});
			if(oDateFormat.format(UI5Date.getInstance())<oModel.getData().dateEvent){
				MessageBox.error("Nie można wprowadzić statystyk wydarzenia, ponieważ wydarzenie jeszcze się nie odbyło", {
					actions: [ MessageBox.Action.CLOSE]
				});
				return;
			}
			let oAddStatsDialog = this.byId("addStatsDialog");
			this.selectItemName("statsLeagueSelect",oModel.getData().league);
			this.byId("statsDataAndTimePicker").setProperty("dateValue",UI5Date.getInstance(oModel.getData().dateEvent));
			this.byId("statsDataAndTimePicker").setProperty("value",oModel.getData().dateEventString);
			this.byId("statsRoundStepInput").setValue(oModel.getData().round);
			this.byId("homeGolsStepInput").setValue(oModel.getData().homeGols);
			this.byId("awayGolsStepInput").setValue(oModel.getData().awayGols);
			this.byId("homeCornersStepInput").setValue(oModel.getData().homeRR);
			this.byId("homeCornersStepInput").setValue(oModel.getData().awayRR);
			this.byId("homeYCStepInput").setValue(oModel.getData().homeYC);
			this.byId("homeYCStepInput").setValue(oModel.getData().awayYC);
			this.byId("homeRCStepInput").setValue(oModel.getData().homeRC);
			this.byId("homeRCStepInput").setValue(oModel.getData().awayRC);
			
			setTimeout(()=>{
				this.selectItemName("statsHomeNameComboBox",oModel.getData().homeName);
				this.selectItemName("statsAwayNameComboBox",oModel.getData().awayName);
				oAddStatsDialog.open();
			},"1000");
			
		},

		onSaveStats: function(){
			let that = this
			let homeGols = this.byId("homeGolsStepInput").getValue();
			let awayGols = this.byId("awayGolsStepInput").getValue();
			let homeRR = this.byId("homeCornersStepInput").getValue();
			let awayRR = this.byId("homeCornersStepInput").getValue();
			let homeYC = this.byId("homeYCStepInput").getValue();
			let awayYC = this.byId("homeYCStepInput").getValue();
			let homeRC = this.byId("homeRCStepInput").getValue();
			let awayRC = this.byId("homeRCStepInput").getValue();
			
			if(homeGols !== oModel.getData().homeGols || awayGols !== oModel.getData().awayGols || 
			homeRR !== oModel.getData().homeRR || awayRR !== oModel.getData().awayRR || 
			homeYC !== oModel.getData().homeYC || awayYC !== oModel.getData().awayYC || 
			homeRC !== oModel.getData().homeRC || awayRC !== oModel.getData().awayRC){
				oModel.getData().homeGols = homeGols;
				oModel.getData().awayGols = awayGols;
				oModel.getData().homeRR = homeRR;
				oModel.getData().awayRR = awayRR;
				oModel.getData().homeYC = homeYC;
				oModel.getData().awayYC = awayYC;
				oModel.getData().homeRC = homeRC;
				oModel.getData().awayRC = awayRC;
				
				$.ajax({
					url: `/odata/v4/clubapp/Match(${oModel.getData().ID})`,
					type: "PUT",
					processData: false,
					dataType: "json", 
					contentType: "application/json",
					data: JSON.stringify(oModel.getData()),
					success: function () {
						MessageToast.show("Dodano Statystyki.");
						that.refresh();
						that.byId("addStatsDialog").close();
					},
					error: function () {
						MessageToast.show("Server Send Error");
					}
				});
			} else {
				MessageBox.error("Zmień statystki.", {
					actions: [ MessageBox.Action.CLOSE]
				});
			}
		},

		refresh: function(){
			this.byId("eventTable").getBinding("rows").refresh();
			this.byId("eventTable").sort(this.byId("eventDataColumn"), library.SortOrder.Descending, true);
		},

		editDialogOpen: function (oModel) {
			
			if(oModel.getData().homeGols !== null){
				MessageBox.error("Nie można edytowć wydarzenia, które już zostało rozegrane.", {
					actions: [ MessageBox.Action.CLOSE]
				});
				return;
			}
			var oEditDialog = this.getView().byId("editDialog");
			this.selectItemName("editEventLeagueSelect",oModel.getData().league);
			this.byId("eventDataAndTimePickerEdit").setProperty("dateValue",UI5Date.getInstance(oModel.getData().dateEvent));
			this.byId("eventDataAndTimePickerEdit").setProperty("value",oModel.getData().dateEventString);
			this.byId("editStepInput").setValue(oModel.getData().round);
			
			setTimeout(()=>{
				this.selectItemName("editHomeClubSelect",oModel.getData().homeName);
				this.selectItemName("editAwayClubSelect",oModel.getData().awayName);
				oEditDialog.open();
			},"1000");
		},

		dialogEdit: function () {
			let oEditHomeClubSelectedItem = this.byId("editHomeClubSelect").getSelectedItem();
			let oEditAwayClubSelectedItem = this.byId("editAwayClubSelect").getSelectedItem();
			let dataValue = this.byId("eventDataAndTimePickerEdit").getProperty("dateValue");
			let that = this;

			if(oEditHomeClubSelectedItem === null || oEditAwayClubSelectedItem === null || dataValue === null){
				MessageBox.error("Wybierz Dane Klubów.", {
					actions: [ MessageBox.Action.CLOSE]
				});
				return;
			}

			let oEditHomeClubItem = oEditHomeClubSelectedItem.getBindingContext().getObject();
			let oEditAwayClubItem = oEditAwayClubSelectedItem.getBindingContext().getObject();
			let editAwayClubName = oEditAwayClubItem.name;
			let editHomeClubName = oEditHomeClubItem.name;
			let editAwayClubID = oEditAwayClubItem.ID;
			let editHomeClubID = oEditHomeClubItem.ID;
			let leagueName = this.byId("editEventLeagueSelect").getSelectedItem().getProperty("text");
			let leagueID = this.byId("editEventLeagueSelect").getSelectedItem().getKey();
			let dataValueString = this.byId("eventDataAndTimePickerEdit").getProperty("value");
			let roundValue = this.byId("editStepInput").getValue();
			if(editHomeClubID===editAwayClubID){
				MessageBox.error("Nie można edytować wydarzenia. Błędne wybranie danych.", {
					actions: [ MessageBox.Action.CLOSE],
					emphasizedAction: MessageBox.Action.CLOSE,
					onClose: function () {
						
					}
				});
			} else if(editAwayClubName !== oModel.getData().awayName || editHomeClubName !== oModel.getData().homeName || dataValueString !== oModel.getData().dateEventString || roundValue !== oModel.getData().round){
				let oPayload = {
					/*"dateEvent" : dataValue,*/
					"homeName" : editHomeClubName,
					"home_ID" : editHomeClubID,
					"awayName" : editAwayClubName,
					"away_ID" : editAwayClubID,
					"league" : leagueName,
					"league_id_ID" : leagueID,
					"dateEvent" : dataValue ,
					"dateEventString" : dataValueString ,
					"round" : roundValue,
				};

				$.ajax({
					url: `/odata/v4/clubapp/Match(${oModel.getData().ID})`,
					type: "PUT",
					processData: false,
					dataType: "json", 
					contentType: "application/json",
					data: JSON.stringify(oPayload),
					success: function () {
						MessageToast.show("Edytowano wydarzenie.");
						that.refresh();
					},
					error: function () {
						MessageToast.show("Server Send Error");
					}
				  });
				  this.getView().byId("editDialog").close();
			} else {
				MessageBox.warning("Nie edytowano wydarzenia.", {
					actions: [ MessageBox.Action.CANCEL],
				});
			}
		},

		dialogClose: function (oEvent) {
			let buttonId = oEvent.getSource().getId().substr(37);
			if(buttonId === "closeStatsDialogWindowButton"){this.getView().byId("addStatsDialog").close()}
			else if(buttonId === "closeDialogWindowButton"){this.getView().byId("editDialog").close()}
		},

		sortLigi: function (oEvent) {
			let oLiga = oEvent.getSource().getBindingContext().getObject();
			this.byId("eventTable").bindRows({path:`/Ligi(ID=${oLiga.ID})/match`});
			let oColumnData = this.byId("eventDataColumn");
			this.byId("eventTable").sort(oColumnData, library.SortOrder.Descending,false);
		},

		filterGlobally: function(oEvent) {
			var sQuery = oEvent.getParameter("query");
			this._oGlobalFilter = null;
			
			if (sQuery) {
				this._oGlobalFilter = new Filter([
					new Filter({
					path: "homeName", 
					operator: FilterOperator.Contains, 
					value1: sQuery,
					caseSensitive: false
					}),
					new Filter({
						path: "awayName", 
						operator: FilterOperator.Contains, 
						value1: sQuery,
						caseSensitive: false
					})
				])
			}

			this.byId("eventTable").getBinding("rows").filter(this._oGlobalFilter, "Application");
		},
		
	});

});