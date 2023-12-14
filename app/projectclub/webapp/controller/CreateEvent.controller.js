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
	"sap/ui/core/format/NumberFormat"
], function (Controller,BaseController, MessageBox, MessageToast, JSONModel, library, UI5Date, Filter, FilterOperator,NumberFormat) {
	"use strict";
	let oModel = new JSONModel();
	return BaseController.extend("projectclub.controller.CreateEvent", {

		onInit: function () {
			let oTimeModel = new JSONModel();
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
			let oList = this.getView().byId(selectID);
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
			let oItemTemplate = new sap.ui.core.ListItem({text:"{name}"});
			
			let oSelect1 = this.byId("homeClubSelect");
			let oSelect2 = this.byId("awayClubSelect");

			oSelect1.setProperty("editable",true);
			oSelect2.setProperty("editable",true);

			oSelect1.bindItems(`/Ligi(ID=${oLeagueID})/clubs`,oItemTemplate);
			oSelect2.bindItems(`/Ligi(ID=${oLeagueID})/clubs`,oItemTemplate);
		},

		editLeagueSelected:function() {
			let oLeagueID = this.byId("editEventLeagueSelect").getSelectedItem().getKey();
			let oItemTemplate = new sap.ui.core.ListItem({text:"{name}"});
			
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
				MessageBox.error("Unable to create match. Incorrect data selection.", {
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
						MessageToast.show("Match created.");
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
				MessageToast.show("No match selected.");
				return;
			}

			let textButton = oEvent.getSource().getId().substr(37);
			let clubPath = this.byId("eventTable").getContextByIndex(rowIndex).getPath();

			this.onEditOrAddStatsEventButton(clubPath,textButton);
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
					MessageToast.show("Downloading data...");
					if(textButton==="editEventButton"){that.editDialogOpen(oModel);}
					else if(textButton==="addEventStatsButtton"){that.addStatsEventDialogOpen(oModel);}
					else if(textButton==="deleteEventButton"){that.onDeleteEventButton(oModel)}
				},
				error: function () {
					MessageToast.show("Server Send Error");
				}
			});
		},

		onDeleteEventButton: function(oModel){
			
			if(oModel.getData().homeGols !== null){
				MessageBox.error("You cannot delete a played match.", {
					actions: [ MessageBox.Action.CLOSE]
				});
				return;
			}	
			let that = this;
			MessageBox.warning("Are you sure you want to delete the match?", {
				actions: [MessageBox.Action.YES, MessageBox.Action.CANCEL],
				onClose: function (sAction) {
					if(sAction === "YES"){
						$.ajax({
							url: `/odata/v4/clubapp/Match/${oModel.getData().ID}`,
							type: 'DELETE',
							success: function() {
								MessageToast.show("Match deleted!");
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
			let oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy-MM-ddTHH:mm:ss"
			});
			if(oDateFormat.format(UI5Date.getInstance())<oModel.getData().dateEvent){
				MessageBox.error("Match statistics cannot be entered because the event has not yet taken place.", {
					actions: [ MessageBox.Action.CLOSE]
				});
				return;
			}
			if(oModel.getData().homeGols !== null){
				MessageBox.error("The statistics have already been entered.", {
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
			this.byId("awayCornersStepInput").setValue(oModel.getData().awayRR);
			this.byId("homeYCStepInput").setValue(oModel.getData().homeYC);
			this.byId("awayYCStepInput").setValue(oModel.getData().awayYC);
			this.byId("homeRCStepInput").setValue(oModel.getData().homeRC);
			this.byId("awayRCStepInput").setValue(oModel.getData().awayRC);
			
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
			let awayRR = this.byId("awayCornersStepInput").getValue();
			let homeYC = this.byId("homeYCStepInput").getValue();
			let awayYC = this.byId("awayYCStepInput").getValue();
			let homeRC = this.byId("homeRCStepInput").getValue();
			let awayRC = this.byId("awayRCStepInput").getValue();
			
			if(homeGols !== oModel.getData().homeGols || awayGols !== oModel.getData().awayGols || 
			homeRR !== oModel.getData().homeRR || awayRR !== oModel.getData().awayRR || 
			homeYC !== oModel.getData().homeYC || awayYC !== oModel.getData().awayYC || 
			homeRC !== oModel.getData().homeRC || awayRC !== oModel.getData().awayRC){
				MessageBox.warning("Are you sure you want to add these statistics? You won't be able to correct them later!", {
					actions: [MessageBox.Action.YES, MessageBox.Action.CANCEL],
					onClose: function (sAction) {
						if(sAction === "YES"){
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
									
									MessageToast.show("Statistics added.");
									that.refresh();
									that.byId("addStatsDialog").close();
									that.refreshClubTable(oModel.getData())
								},
								error: function () {
									MessageToast.show("Server Send Error");
								}
							});
						} else {return;}
					}
				});
				
			} else {
				MessageBox.error("Change stats.", {
					actions: [ MessageBox.Action.CLOSE]
				});
			}
		},

		refreshClubTable:function(matchModel){
			let oLeagueTableClubModel = new JSONModel();
			let IDLigi = matchModel.league_id_ID;
			$.ajax({
				type: "GET",
				contentType: "application/json",
				url: `/odata/v4/clubapp/Ligi/${IDLigi}/clubs`,
				dataType: "json",
				async: false,
				success: function(data) {
					oLeagueTableClubModel.setData(data);
				},
				error: function () {
					MessageToast.show("Server Send Error");
				}
			});
			let position1;
			let position2;
			
			let aLeagueClubs = oLeagueTableClubModel.getData().value
			for(let i = 0; i<aLeagueClubs.length;i++){
				if(aLeagueClubs[i].ID === matchModel.home_ID){
					aLeagueClubs[i].match += 1;
					aLeagueClubs[i].gols_score += matchModel.homeGols;
					aLeagueClubs[i].gols_lose += matchModel.awayGols;
					aLeagueClubs[i].balance = aLeagueClubs[i].balance + matchModel.homeGols - matchModel.awayGols;

					if(matchModel.homeGols>matchModel.awayGols){aLeagueClubs[i].win += 1;aLeagueClubs[i].points += 3;}else 
					if(matchModel.homeGols===matchModel.awayGols){aLeagueClubs[i].draw += 1;aLeagueClubs[i].points += 1;}else 
					if(matchModel.homeGols<matchModel.awayGols){aLeagueClubs[i].lose += 1;}
					position1 = i;
				} else if(aLeagueClubs[i].ID === matchModel.away_ID){
					aLeagueClubs[i].match += 1;
					aLeagueClubs[i].gols_score += matchModel.awayGols;
					aLeagueClubs[i].gols_lose += matchModel.homeGols;
					aLeagueClubs[i].balance = aLeagueClubs[i].balance + matchModel.awayGols - matchModel.homeGols;

					if(matchModel.awayGols>matchModel.homeGols){aLeagueClubs[i].win += 1;aLeagueClubs[i].points += 3;}else 
					if(matchModel.awayGols===matchModel.homeGols){aLeagueClubs[i].draw += 1;aLeagueClubs[i].points += 1;}else 
					if(matchModel.awayGols<matchModel.homeGols){aLeagueClubs[i].lose += 1;}

					position2 = i;
				}
			}
			const positioCalculation = ((position)=>{
				let changePosition ;
				while(changePosition !== 1){
					changePosition = 1;
					for(let j = 0; j<aLeagueClubs.length;j++){
						if(aLeagueClubs[position].position === aLeagueClubs[j].position+1){
							if(aLeagueClubs[position].points > aLeagueClubs[j].points || 
							(aLeagueClubs[position].points === aLeagueClubs[j].points && aLeagueClubs[position].balance > aLeagueClubs[j].balance) ||
							(aLeagueClubs[position].points === aLeagueClubs[j].points && aLeagueClubs[position].balance === aLeagueClubs[j].balance && aLeagueClubs[position].gols_score > aLeagueClubs[j].gols_score)){
								aLeagueClubs[j].position += 1;
								aLeagueClubs[position].position -= 1;
								changePosition++;
							}
						}else if(aLeagueClubs[position].position === aLeagueClubs[j].position-1){
							if(aLeagueClubs[position].points < aLeagueClubs[j].points || 
							(aLeagueClubs[position].points === aLeagueClubs[j].points && aLeagueClubs[position].balance < aLeagueClubs[j].balance) ||
							(aLeagueClubs[position].points === aLeagueClubs[j].points && aLeagueClubs[position].balance === aLeagueClubs[j].balance && aLeagueClubs[position].gols_score < aLeagueClubs[j].gols_score)){
								aLeagueClubs[j].position -= 1;
								aLeagueClubs[position].position += 1;
								changePosition++;
							}
						}
					}
				}
			});
			positioCalculation(position1);
			positioCalculation(position2);
			
			for(let i = 0 ; i < aLeagueClubs.length;i++){
				this.onPutClubsAfterAddStats(aLeagueClubs[i]);
			};	
		},

		onPutClubsAfterAddStats:function(oClubDataModel){
			$.ajax({
				url: `/odata/v4/clubapp/Clubs(${oClubDataModel.ID})`,
				type: "PUT",
				processData: false,
				dataType: "json", 
				contentType: "application/json",
				data: JSON.stringify(oClubDataModel),
				success: function () {
					MessageToast.show("Club details updated.");
				},
				error: function () {
					MessageToast.show("Server Send Error");
				}
			});
		},

		refresh: function(){
			this.byId("eventTable").getBinding("rows").refresh();
			this.byId("eventTable").sort(this.byId("eventDataColumn"), library.SortOrder.Descending, true);
		},

		editDialogOpen: function (oModel) {
			
			if(oModel.getData().homeGols !== null){
				MessageBox.error("You cannot edit an match that has already been played.", {
					actions: [ MessageBox.Action.CLOSE]
				});
				return;
			}
			let oEditDialog = this.getView().byId("editDialog");
			this.selectItemName("editEventLeagueSelect",oModel.getData().league);
			this.editLeagueSelected();
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
				MessageBox.error("Select Club Details.", {
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
				MessageBox.error("The event cannot be edited. Incorrect data selection.", {
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
						MessageToast.show("The match has been edited.");
						that.refresh();
					},
					error: function () {
						MessageToast.show("Server Send Error");
					}
				  });
				  this.getView().byId("editDialog").close();
			} else {
				MessageBox.warning("The match was not edited.", {
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
			let oLiga = oEvent.getParameter("value");
			console.log(oLiga)
			this._oLeagueFilter = new Filter({
				path: "league", 
				operator: FilterOperator.Contains, 
				value1: oLiga,
				caseSensitive: false
			});
			this.byId("eventTable").getBinding("rows").filter(this._oLeagueFilter, "Application");
		},

		filterGlobally: function(oEvent) {
			let sQuery = oEvent.getParameter("query");
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

		roundSelected:function(){
			let sQuery = this.byId("roundFilterStepInput").getProperty("value")
			if(sQuery === 0){this._oRoundFilter = null}
			else {
			this._oRoundFilter = new Filter([
				new Filter("round", FilterOperator.EQ, sQuery)
			  ])
			}
			this.byId("eventTable").getBinding("rows").filter(this._oRoundFilter, "Application");
		}
	});

});