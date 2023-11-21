sap.ui.define([
	"sap/ui/core/mvc/Controller",
    "projectclub/controller/BaseController",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function (Controller,BaseController, MessageBox, MessageToast) {
	"use strict";

	return BaseController.extend("projectclub.controller.CreateEvent", {

		onInit: function () {
			
		},

		onNavBack1: function(){ 
			this.getRouter().navTo("RouteMain_view");
		},

		restartSelects: function(){
			
			console.log(this.byId("eventDataAndTimePicker"));
			//this.byId("eventDataAndTimePicker").setProperty("value",null);
			//this.byId("eventDataAndTimePicker").setLastValue(null);
			
			this.byId("addEventLeagueSelect").setSelectedItem(null);
			this.byId("homeClubSelect").setProperty("editable",false);
			this.byId("awayClubSelect").setProperty("editable",false);
			this.byId("homeClubSelect").setSelectedItem(null);
			this.byId("awayClubSelect").setSelectedItem(null);
		},

		selectItemName: async function(selectID,nameItem){
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
			//let dataValue = this.byId("eventDataAndTimePicker").getProperty("value");

			if(oHomeClubSelectedItem === null || oAwayClubSelectedItem === null /*|| dataValue === ""*/){
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
					"awayName" : awayClubName ,
					"league" : leagueName,
					"league_id_ID" : leagueID,
				};

				$.ajax({
					url: "/odata/v4/clubapp/Match",
					type: "POST",
					data: JSON.stringify(oPayload),
					dataType: "json", 
					contentType: "application/json",
					success: function () {
						MessageToast.show("Utworzono wydarzenie.");
					},
					error: function () {
						MessageToast.show("Server Send Error");
					}
				  });
				this.restartSelects(); 
			}
		},

		onEditEventButton: function() {
			let rowIndex = this.byId("eventTable").getSelectedIndex();
			var oModel = new sap.ui.model.json.JSONModel();
			
			if(rowIndex !== -1){
				let clubPath = this.byId("eventTable").getContextByIndex(rowIndex).getPath();
				let matchID = clubPath.substr(7,36);
				
				$.ajax({
				type: "GET",
				contentType: "application/json",
				url: `/odata/v4/clubapp/Match/${matchID}`,
				dataType: "json",
				async: false,
				success: function(data) {
					oModel.setData(data);
					MessageToast.show("Pobrano dane");
					}
				});
			}	
			this.dialogOpen(oModel)
		},

		onDeleteEventButton: function(){
			let rowIndex = this.byId("eventTable").getSelectedIndex();
			if(rowIndex === -1){
				MessageToast.show("Brak wyboru wydazrenia!!!");
				return;
			}
			let clubPath = this.byId("eventTable").getContextByIndex(rowIndex).getPath();

			MessageBox.warning("Czy napewno chcesz usunąć wydarzenie?", {
				actions: [MessageBox.Action.YES, MessageBox.Action.CANCEL],
				onClose: function () {
					let matchID = clubPath.substr(7,36);
					$.ajax({
						url: `/odata/v4/clubapp/Match/${matchID}`,
						type: 'DELETE',
						success: function() {
							MessageToast.show("Wydarzenie usunięto!");
						}
					});
				}
			});
		},

		dialogOpen: function (oModel) {
			if(oModel.getData().ID !== undefined){
				var oDialog = this.getView().byId("editDialog");

				console.log(oModel.getData())
				
				this.selectItemName("editEventLeagueSelect",oModel.getData().league);
				this.editLeagueSelected();
				setTimeout(()=>{
					this.selectItemName("editHomeClubSelect",oModel.getData().homeName);
					this.selectItemName("editAwayClubSelect",oModel.getData().awayName);
				},"250");
				oDialog.open();

			} else {
				MessageToast.show("Brak wyboru wydazrenia!!!");
			}
			
		},

		dialogClose: function () {
			this.getView().byId("editDialog").close();
		},

		sortLigi: function (oEvent) {
			let oLiga = oEvent.getSource().getBindingContext().getObject();
            if(oLiga.name === "Wszystkie"){
				this.byId("eventTable").bindRows({path:`/Match`});
			} else {
				this.byId("eventTable").bindRows({path:`/Ligi(ID=${oLiga.ID})/match`});
			}
		}
		
	});

});