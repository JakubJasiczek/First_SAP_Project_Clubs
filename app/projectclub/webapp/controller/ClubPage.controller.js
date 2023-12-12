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
	let oModel = new JSONModel();
	let oStatsModel = new JSONModel();
	return BaseController.extend("projectclub.controller.ClubPage", {

		onInit: function () {
			var oRouter = this.getRouter();
			oRouter.getRoute("clubPage").attachPatternMatched(this._onRouteMatched,this);

			var oImgModel = new JSONModel(sap.ui.require.toUrl("projectclub/mockdata/img.json"));
			this.getView().setModel(oImgModel, "img");
			this.mainModel = this.getView().getModel();
			
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
			let oModelMatches = new JSONModel();
			let aMatches = [...data.matchesAway,...data.matchesHome]
			oModel.setData({'Club' : [data]});
			oModelMatches.setData({"machtes" : aMatches});
			this.getView().setModel(oModel,"club");
			this.getView().setModel(oModelMatches,"allMatches");

			this.byId("clubPageTable").bindRows({path:`/Ligi(ID=${data.liga_ID})/clubs`});
			this._bSortColumnDescending = false;
			this.sortByPosition();
			this._filterMatchesByDate();
			this._sortTables();
			
			let aRestData = this.onMakeClubModel()
			oStatsModel.setData({'ClubStats' : [aRestData]});
			this.getView().setModel(oStatsModel,"clubStats");
			
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
		},

		onMakeClubModel:function(matchesAmout,matchesPlace){
			let clubID = oModel.getData().Club[0].ID;
			let aNewClubMatch = this.byId("resultMatchesTable").getBinding().oList.filter((match)=>match.homeGols !== null);
			let aClubMatch = aNewClubMatch;
			if(matchesPlace==="Home"){aClubMatch = aNewClubMatch.filter((match)=>match.home_ID===clubID)}
			else if(matchesPlace==="Away"){aClubMatch = aNewClubMatch.filter((match)=>match.away_ID===clubID)}
			aClubMatch.sort((a, b) => {
				if (a.dateEvent > b.dateEvent) {return -1;}
				if (a.dateEvent < b.dateEvent) {return 1;}
			  });
			let amountOfMatches
			if(matchesAmout === "5Q"){matchesAmout=5}
			if(matchesAmout === undefined || aClubMatch.length < matchesAmout || matchesAmout === "Al"){
				amountOfMatches = aClubMatch.length
				
			} else {
				amountOfMatches = matchesAmout
			}
			let aRestData = {
				matches: 0,
				RR: 0,
				clubRR: 0,
				enemyRR : 0,
				YC : 0,
				clubYC : 0,
				enemyYC : 0,
				RC : 0,
				clubRC : 0,
				enemyRC : 0,
				win : 0,
				lose : 0,
				draw : 0,
				pointsPerMatch : 0,
				golsPerMatch : 0,
				golsScore : 0,
				golsLose : 0,
			};
			
			for(let i=0; i<amountOfMatches;i++){
				if(aClubMatch[i].homeGols !== null){
					aRestData.matches++;
					aRestData.RR += aClubMatch[i].homeRR
					aRestData.RR += aClubMatch[i].awayRR
					aRestData.YC += aClubMatch[i].homeYC
					aRestData.YC += aClubMatch[i].awayYC
					aRestData.RC += aClubMatch[i].homeRC
					aRestData.RC += aClubMatch[i].awayRC
					aRestData.golsPerMatch += aClubMatch[i].homeGols
					aRestData.golsPerMatch += aClubMatch[i].awayGols
					if(clubID === aClubMatch[i].home_ID){
						aRestData.clubRR += aClubMatch[i].homeRR
						aRestData.enemyRR += aClubMatch[i].awayRR
						aRestData.clubYC += aClubMatch[i].homeYC
						aRestData.enemyYC += aClubMatch[i].awayYC
						aRestData.clubRC += aClubMatch[i].homeRC
						aRestData.enemyRC += aClubMatch[i].awayRC
						if(aClubMatch[i].homeGols > aClubMatch[i].awayGols){aRestData.win += 1;aRestData.pointsPerMatch += 3}
						else if(aClubMatch[i].homeGols === aClubMatch[i].awayGols){aRestData.draw += 1;aRestData.pointsPerMatch += 1}
						else if(aClubMatch[i].homeGols < aClubMatch[i].awayGols){aRestData.lose += 1}
						aRestData.golsScore += aClubMatch[i].homeGols
						aRestData.golsLose+= aClubMatch[i].awayGols
					}else if(clubID === aClubMatch[i].away_ID){
						aRestData.clubRR += aClubMatch[i].awayRR
						aRestData.enemyRR += aClubMatch[i].homeRR
						aRestData.clubYC += aClubMatch[i].awayYC
						aRestData.enemyYC += aClubMatch[i].homeYC
						aRestData.clubRC += aClubMatch[i].awayRC
						aRestData.enemyRC += aClubMatch[i].homeRC
						if(aClubMatch[i].awayGols > aClubMatch[i].homeGols){aRestData.win += 1;aRestData.pointsPerMatch += 3}
						else if(aClubMatch[i].awayGols === aClubMatch[i].homeGols){aRestData.draw += 1;aRestData.pointsPerMatch += 1}
						else if(aClubMatch[i].awayGols < aClubMatch[i].homeGols){aRestData.lose += 1}
						aRestData.golsLose += aClubMatch[i].homeGols
						aRestData.golsScore += aClubMatch[i].awayGols
					}
				}
			}
			aRestData = {
				matches : aRestData.matches,
				RR : aRestData.RR,
				RRPerMatch : Math.ceil(aRestData.RR/aRestData.matches*100)/100,
				clubRR: aRestData.clubRR,
				clubRRPerMatch : Math.ceil(aRestData.clubRR/aRestData.matches*100)/100,
				enemyRR : aRestData.enemyRR,
				enemyRRPerMatch : Math.ceil(aRestData.enemyRR/aRestData.matches*100)/100,
				YC: aRestData.YC,
				YCPerMatch : Math.ceil(aRestData.YC/aRestData.matches*100)/100,
				clubYC : aRestData.clubYC,
				clubYCPerMatch : Math.ceil(aRestData.clubYC/aRestData.matches*100)/100,
				enemyYC : aRestData.enemyYC,
				enemyYCPerMatch : Math.ceil(aRestData.enemyYC/aRestData.matches*100)/100,
				RC: aRestData.RC,
				RCPerMatch : Math.ceil(aRestData.RC/aRestData.matches*100)/100,
				clubRC : aRestData.clubRC,
				clubRCPerMatch : Math.ceil(aRestData.clubRC/aRestData.matches*100)/100,
				enemyRC : aRestData.enemyRC,
				enemyRCPerMatch : Math.ceil(aRestData.enemyRC/aRestData.matches*100)/100,
				wins : aRestData.win ,
				winsPerMatch : Math.ceil(aRestData.win/aRestData.matches*100),
				loses: aRestData.lose,
				losePerMatch : Math.ceil(aRestData.lose/aRestData.matches*100),
				draws : aRestData.draw,
				drawPerMatch : Math.ceil(aRestData.draw/aRestData.matches*100),
				pointsPerMatch : Math.ceil(aRestData.pointsPerMatch/aRestData.matches*100)/100,
				golsPerMatch : Math.ceil(aRestData.golsPerMatch/aRestData.matches*100)/100,
				golsScore : aRestData.golsScore ,
				golsScorePerMatch : Math.ceil(aRestData.golsScore /aRestData.matches*100)/100,
				golsLose : aRestData.golsLose,
				golsLosePerMatch : Math.ceil(aRestData.golsLose/aRestData.matches*100)/100,
			};
			return aRestData;
		},

		onAmountOfMatchChange:function(oEvent){
			let matchesPlace = this.byId("statsMatchesButtonSegmented").getSelectedItem().substr(39,4);
			let amountOfMatches = this.byId("statsQueensButtonSegmented").getSelectedItem().substr(39,2);
			
			let aRestData = this.onMakeClubModel(amountOfMatches,matchesPlace);
			oStatsModel.setData({'ClubStats' : [aRestData]});
			this.getView().setModel(oStatsModel,"clubStats");
		}
	});

});
 