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

		leagueSelected: function (oEvent) {
			let oLeagueID = oEvent.getParameter("selectedItem").getKey();
			var oItemTemplate = new sap.ui.core.ListItem({text:"{name}",ID:"{ID}"});
			
			this.byId("homeClubSelect").bindItems(`/Ligi(ID=${oLeagueID})/clubs`,oItemTemplate);
			this.byId("awayClubSelect").bindItems(`/Ligi(ID=${oLeagueID})/clubs`,oItemTemplate);
		},

		editLeagueSelected:function(oEvent) {
			let oLeagueID = oEvent.getParameter("selectedItem").getKey();
			var oItemTemplate = new sap.ui.core.ListItem({text:"{name}",ID:"{ID}"});
			
			let oSelect1 = this.byId("editHomeClubSelect");
			oSelect1.bindItems(`/Ligi(ID=${oLeagueID})/clubs`,oItemTemplate);
			oSelect1.setEditable("true");

			let oSelect2 = this.byId("editAwayClubSelect")
			oSelect2.bindItems(`/Ligi(ID=${oLeagueID})/clubs`,oItemTemplate);
		},

		onClickAddButton: function () {

			let homeClubItem = this.byId("homeClubSelect").getSelectedItem().getBindingContext().getObject();
			let awayClubItem = this.byId("awayClubSelect").getSelectedItem().getBindingContext().getObject();
			let awayClubName = awayClubItem.name;
			let homeClubName = homeClubItem.name;
			let awayClubID = awayClubItem.ID;
			let homeClubID = homeClubItem.ID;
			let oLeagueName = this.byId("addEventLeagueSelect").getSelectedItem().getProperty("text");
			console.log(homeClubID);
			console.log(awayClubID);
			if(homeClubID===awayClubID){
				MessageBox.error("Nie można stworzyć wydarzenia.", {
					actions: [ MessageBox.Action.CLOSE],
					emphasizedAction: MessageBox.Action.CLOSE,
					onClose: function (sAction) {
						
					}
				});
			} else {
				let oPayload = {
					"homeName" : homeClubName ,
					"awayName" : awayClubName ,
					"league" : oLeagueName,
				};

				$.ajax({
					url: "/odata/v4/clubapp/Match",
					type: "POST",
					data: JSON.stringify(oPayload),
					dataType: "json", 
					contentType: "application/json",
					success: function (data) {
						MessageToast.show("Done");
					},
					error: function (e) {
						MessageToast.show("Server Send Error");
					}
				  });
			}
		},

		onChechButton: function() {
			let rowIndex = this.byId("eventTable").getSelectedIndex();
			var oModel = new sap.ui.model.json.JSONModel();
			
			if(rowIndex !== -1){
				let clubPath = this.byId("eventTable").getContextByIndex(rowIndex).getPath();
				let IDClub = clubPath.substr(7,36);
				
				$.ajax({
				type: "GET",
				contentType: "application/json",
				url: `/odata/v4/clubapp/Match/${IDClub}`,
				dataType: "json",
				async: false,
				success: function(data) {
					oModel.setData(data);
					console.log(data);
					MessageToast.show("Pobrano dane");
					}
				});
			}	
			this.dialogOpen(oModel)
		},

		dialogOpen: function (oModel) {
			if(oModel.getData().ID !== undefined){
				
				var oDialog = this.getView().byId("helloDialog");
				oDialog.open();
			} else {
				MessageToast.show("Brak wyboru wydazrenia!!!");
			}
			
		},

		dialogClose: function () {
			var oDialog = this.getView().byId("helloDialog");
			oDialog.close();
		},

		_cos:function(){
			console.log(1)
		}
		
	});

});