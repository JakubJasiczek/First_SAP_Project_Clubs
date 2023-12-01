sap.ui.define([
	"sap/ui/core/mvc/Controller",
    "projectclub/controller/BaseController",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	'sap/ui/model/json/JSONModel',
	"sap/ui/table/library",
	'sap/ui/core/date/UI5Date'
], function (Controller,BaseController, MessageBox, MessageToast, JSONModel, library, UI5Date) {
	"use strict";
	var oModel = new JSONModel();
	return BaseController.extend("projectclub.controller.CreateEvent", {

		onInit: function () {
			var oTimeModel = new JSONModel();
			oTimeModel.setData({
				valueDTP2: UI5Date.getInstance(),
			});

			this.byId("eventDataAndTimePicker").setModel(oTimeModel);
			this.byId("eventDataAndTimePicker").setProperty("dateValue",null);
			this.byId("eventDataAndTimePickerEdit").setModel(oTimeModel);
			this.byId("eventDataAndTimePickerEdit").setProperty("dateValue",null);
			
		},

		test:function(){
			console.log(this.byId("eventDataAndTimePicker").getProperty("value"))
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
			let oLeagueID = oEvent.getParameter("selectedItem").getKey();
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

			if(textButton==="editEventButton"){this.onEditEventButton(clubPath)}
			else if(textButton==="deleteEventButton"){this.onDeleteEventButton(clubPath)}
			else if(textButton==="addEventStatsButtton"){this.onAddStatsEventButton(clubPath)}
		},

		onEditEventButton: function(clubPath) {	
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
					MessageToast.show("Pobrano dane");
					that.dialogOpen(oModel);
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

		onAddStatsEventButton: function(clubPath){
			
		},

		refresh: function(){
			this.byId("eventTable").getBinding("rows").refresh();
			this.byId("eventTable").sort(this.byId("eventDataColumn"), library.SortOrder.Descending, true);
		},

		dialogOpen: function (oModel) {
			var oDialog = this.getView().byId("editDialog");
			this.selectItemName("editEventLeagueSelect",oModel.getData().league);
			this.byId("eventDataAndTimePickerEdit").setProperty("dateValue",UI5Date.getInstance(oModel.getData().dateEvent));
			this.editLeagueSelected();
			setTimeout(()=>{
				this.selectItemName("editHomeClubSelect",oModel.getData().homeName);
				this.selectItemName("editAwayClubSelect",oModel.getData().awayName);
				oDialog.open();
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

			if(editHomeClubID===editAwayClubID){
				MessageBox.error("Nie można edytować wydarzenia. Błędne wybranie danych.", {
					actions: [ MessageBox.Action.CLOSE],
					emphasizedAction: MessageBox.Action.CLOSE,
					onClose: function () {
						
					}
				});
			} else if(editAwayClubName !== oModel.getData().awayName || editHomeClubName !== oModel.getData().homeName || dataValue !== oModel.getData().dateEvent){
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

		dialogClose: function () {
			this.getView().byId("editDialog").close();
		},

		sortLigi: function (oEvent) {
			let oLiga = oEvent.getSource().getBindingContext().getObject();
			this.byId("eventTable").bindRows({path:`/Ligi(ID=${oLiga.ID})/match`});
			let oColumnData = this.byId("eventDataColumn");
			this.byId("eventTable").sort(oColumnData, library.SortOrder.Descending,false);
		}
		
	});

});