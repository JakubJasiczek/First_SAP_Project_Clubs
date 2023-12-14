sap.ui.define([
	"sap/ui/core/mvc/Controller",
    "projectclub/controller/BaseController",
	'sap/ui/model/json/JSONModel',
], function (Controller,BaseController,JSONModel) {
	"use strict";
	let oMatchModel = new JSONModel();
	let oHomeClubModel = new JSONModel();
	let oAwayClubModel = new JSONModel();
	let oHomeClubAllMatches = new JSONModel();
	let oHomeClubHomeMatches = new JSONModel();
	let oAwayClubAllMatches = new JSONModel();
	let oAwayClubAwayMatches = new JSONModel();
	let oResultPrediction = new JSONModel();
	let oPlaceResultPrediction = new JSONModel();
	let oPrediction = new JSONModel();

	return BaseController.extend("projectclub.controller.Match", {

		onInit: function () {
			this.getRouter().getRoute("match").attachPatternMatched(this._onRouteMatched,this);
		},

		_onRouteMatched: function(oEvent) {
			this.getView().bindElement({
				path : "/Match(" + oEvent.getParameter("arguments").ID + ")",
				
			})
			let matchID = oEvent.getParameter("arguments").ID
			
			$.ajax({
				type: "GET",
				contentType: "application/json",
				url: `/odata/v4/clubapp/Match/${matchID}`,
				dataType: "json",
				async: false,
				success: function(data) {
					oMatchModel.setData(data);
				},
				error: function () {
					MessageToast.show("Server Send Error");
				}
			});
			$.ajax({
				type: "GET",
				contentType: "application/json",
				url: `/odata/v4/clubapp/Clubs/${oMatchModel.getData().home_ID}?$expand=matchesAway,matchesHome`,
				dataType: "json",
				async: false,
				success: function(data) {
					oHomeClubModel.setData(data);
				},
				error: function () {
					MessageToast.show("Server Send Error");
				}
			});
			$.ajax({
				type: "GET",
				contentType: "application/json",
				url: `/odata/v4/clubapp/Clubs/${oMatchModel.getData().away_ID}?$expand=matchesAway,matchesHome`,
				dataType: "json",
				async: false,
				success: function(data) {
					oAwayClubModel.setData(data);
				},
				error: function () {
					MessageToast.show("Server Send Error");
				}
			});
			this.getView().setModel(oHomeClubModel,"homeClub");
			this.getView().setModel(oAwayClubModel,"awayClub");
			
			let aHomeClubAllMatches = [...oHomeClubModel.getData().matchesAway,...oHomeClubModel.getData().matchesHome].filter((match)=>match.homeGols !== null).sort((a, b) => {if (a.dateEvent > b.dateEvent) {return -1;}if (a.dateEvent < b.dateEvent) {return 1;}});
			let aHomeClubHomeMatches = [...oHomeClubModel.getData().matchesHome].filter((match)=>match.homeGols !== null).sort((a, b) => {if (a.dateEvent > b.dateEvent) {return -1;}if (a.dateEvent < b.dateEvent) {return 1;}});
			let aAwayClubAllMatches = [...oAwayClubModel.getData().matchesAway,...oAwayClubModel.getData().matchesHome].filter((match)=>match.homeGols !== null).sort((a, b) => {if (a.dateEvent > b.dateEvent) {return -1;}if (a.dateEvent < b.dateEvent) {return 1;}});
			let aAwayClubAwayMatches = [...oAwayClubModel.getData().matchesAway].filter((match)=>match.homeGols !== null).sort((a, b) => {if (a.dateEvent > b.dateEvent) {return -1;}if (a.dateEvent < b.dateEvent) {return 1;}});
			
			oHomeClubAllMatches.setData(this.onMakeMatchModel(aHomeClubAllMatches,oMatchModel.getData().home_ID));
			oHomeClubHomeMatches.setData(this.onMakeMatchModel(aHomeClubHomeMatches,oMatchModel.getData().home_ID));
			oAwayClubAllMatches.setData(this.onMakeMatchModel(aAwayClubAllMatches,oMatchModel.getData().away_ID));
			oAwayClubAwayMatches.setData(this.onMakeMatchModel(aAwayClubAwayMatches,oMatchModel.getData().away_ID));
			oResultPrediction.setData(this.onPredictionResult(oHomeClubAllMatches.getData(),oAwayClubAllMatches.getData()));
			oPlaceResultPrediction.setData(this.onPredictionResult(oHomeClubHomeMatches.getData(),oAwayClubAwayMatches.getData()));
			oPrediction.setData(this.onPrediction(oResultPrediction.getData(),oPlaceResultPrediction.getData()))

			this.getView().setModel(oHomeClubAllMatches,"homeClubAllMatches");
			this.getView().setModel(oHomeClubHomeMatches,"homeClubHomeMatches");
			this.getView().setModel(oAwayClubAllMatches,"awayClubAllMatches");
			this.getView().setModel(oAwayClubAwayMatches,"awayClubAwayMatches");
			this.getView().setModel(oResultPrediction,"resultPrediction");
			this.getView().setModel(oPlaceResultPrediction,"placeResultPrediction");
			this.getView().setModel(oPrediction,"prediction");
		},

		onNavBack : function () {
			// in some cases we could display a certain target when the back button is pressed
			if (this._oData && this._oData.fromTarget) {
				this.getRouter().getTargets().display(this._oData.fromTarget);
				delete this._oData.fromTarget;
				return;
			}

			// call the parent's onNavBack
			BaseController.prototype.onNavBack.apply(this, arguments);
		},

		onMakeMatchModel:function(aMatches,clubID){
			let aRestData = {
				matches: 0,
				gols : 0,
				golsScore : 0,
				golsLose : 0,
				RR: 0,
				clubRR: 0,
				enemyRR : 0,
				YC : 0,
				clubYC : 0,
				enemyYC : 0,
				RC : 0,
				clubRC : 0,
				enemyRC : 0,
			};
			
			for(let i=0; i<aMatches.length;i++){
				aRestData.matches++;
				aRestData.gols += aMatches[i].homeGols
				aRestData.gols += aMatches[i].awayGols
				aRestData.RR += aMatches[i].homeRR
				aRestData.RR += aMatches[i].awayRR
				aRestData.YC += aMatches[i].homeYC
				aRestData.YC += aMatches[i].awayYC
				aRestData.RC += aMatches[i].homeRC
				aRestData.RC += aMatches[i].awayRC
				if(clubID === aMatches[i].home_ID){
					aRestData.clubRR += aMatches[i].homeRR
					aRestData.enemyRR += aMatches[i].awayRR
					aRestData.clubYC += aMatches[i].homeYC
					aRestData.enemyYC += aMatches[i].awayYC
					aRestData.clubRC += aMatches[i].homeRC
					aRestData.enemyRC += aMatches[i].awayRC
					aRestData.golsScore += aMatches[i].homeGols
					aRestData.golsLose+= aMatches[i].awayGols
				}else if(clubID === aMatches[i].away_ID){
					aRestData.clubRR += aMatches[i].awayRR
					aRestData.enemyRR += aMatches[i].homeRR
					aRestData.clubYC += aMatches[i].awayYC
					aRestData.enemyYC += aMatches[i].homeYC
					aRestData.clubRC += aMatches[i].awayRC
					aRestData.enemyRC += aMatches[i].homeRC
					aRestData.golsLose += aMatches[i].homeGols
					aRestData.golsScore += aMatches[i].awayGols
				}
			}
			aRestData = {
				matches : aRestData.matches,
				gols: aRestData.gols,
				golsPerMatch : Math.round(aRestData.gols/aRestData.matches*100)/100,
				golsScore : aRestData.golsScore ,
				golsScorePerMatch : Math.round(aRestData.golsScore /aRestData.matches*100)/100,
				golsLose : aRestData.golsLose,
				golsLosePerMatch : Math.round(aRestData.golsLose/aRestData.matches*100)/100,
				RR : aRestData.RR,
				RRPerMatch : Math.round(aRestData.RR/aRestData.matches*100)/100,
				clubRR: aRestData.clubRR,
				clubRRPerMatch : Math.round(aRestData.clubRR/aRestData.matches*100)/100,
				enemyRR : aRestData.enemyRR,
				enemyRRPerMatch : Math.round(aRestData.enemyRR/aRestData.matches*100)/100,
				YC: aRestData.YC,
				YCPerMatch : Math.round(aRestData.YC/aRestData.matches*100)/100,
				clubYC : aRestData.clubYC,
				clubYCPerMatch : Math.round(aRestData.clubYC/aRestData.matches*100)/100,
				enemyYC : aRestData.enemyYC,
				enemyYCPerMatch : Math.round(aRestData.enemyYC/aRestData.matches*100)/100,
				RC: aRestData.RC,
				RCPerMatch : Math.round(aRestData.RC/aRestData.matches*100)/100,
				clubRC : aRestData.clubRC,
				clubRCPerMatch : Math.round(aRestData.clubRC/aRestData.matches*100)/100,
				enemyRC : aRestData.enemyRC,
				enemyRCPerMatch : Math.round(aRestData.enemyRC/aRestData.matches*100)/100
			};

			for(let i=0;i<Object.values(aRestData).length;i++){
				if(isNaN(Object.values(aRestData)[i])){
					let key = Object.keys(aRestData)[i];
					aRestData[key]=0
				}
			}

			return aRestData;
		},

		onPredictionResult:function(aHomeClub,aAwayClub){
			let aRestData = {
				golsPerMatch : Math.round(((aHomeClub.golsPerMatch+aAwayClub.golsPerMatch)/2)*100)/100 ,
				homeGolsScorePerMatch : Math.round(((aHomeClub.golsScorePerMatch+aAwayClub.golsLosePerMatch)/2)*100)/100,
				awayGolsScorePerMatch : Math.round(((aHomeClub.golsLosePerMatch+aAwayClub.golsScorePerMatch)/2)*100)/100,
				RRPerMatch : Math.round(((aHomeClub.RRPerMatch+aAwayClub.RRPerMatch)/2)*100)/100,
				homeRRPerMatch : Math.round(((aHomeClub.clubRRPerMatch+aAwayClub.enemyRRPerMatch)/2)*100)/100,
				awayRRPerMatch : Math.round(((aHomeClub.enemyRRPerMatch+aAwayClub.clubRRPerMatch)/2)*100)/100,
				YCPerMatch : Math.round(((aHomeClub.YCPerMatch+aAwayClub.YCPerMatch)/2)*100)/100,
				homeYCPerMatch : Math.round(((aHomeClub.clubYCPerMatch+aAwayClub.enemyYCPerMatch)/2)*100)/100,
				awayYCPerMatch : Math.round(((aHomeClub.enemyYCPerMatch+aAwayClub.clubYCPerMatch)/2)*100)/100,
				RCPerMatch : Math.round(((aHomeClub.RCPerMatch+aAwayClub.RCPerMatch)/2)*100)/100,
				homeRCPerMatch : Math.round(((aHomeClub.clubRCPerMatch+aAwayClub.enemyRCPerMatch)/2)*100)/100,
				awayRCPerMatch : Math.round(((aHomeClub.enemyRCPerMatch+aAwayClub.clubRCPerMatch)/2)*100)/100,
			};
			return aRestData;
		},

		onPrediction:function(aHomeClub,aAwayClub){
			let aRestData = {
				golsPerMatch : Math.round((aHomeClub.golsPerMatch+aAwayClub.golsPerMatch)/2),
				homeGolsScorePerMatch : Math.round((aHomeClub.homeGolsScorePerMatch+aAwayClub.homeGolsScorePerMatch)/2),
				awayGolsScorePerMatch : Math.round((aHomeClub.awayGolsScorePerMatch+aAwayClub.awayGolsScorePerMatch)/2),
				RRPerMatch : Math.round((aHomeClub.RRPerMatch+aAwayClub.RRPerMatch)/2),
				homeRRPerMatch : Math.round((aHomeClub.homeRRPerMatch+aAwayClub.homeRRPerMatch)/2),
				awayRRPerMatch : Math.round((aHomeClub.awayRRPerMatch+aAwayClub.awayRRPerMatch)/2),
				YCPerMatch : Math.round((aHomeClub.YCPerMatch+aAwayClub.YCPerMatch)/2),
				homeYCPerMatch : Math.round((aHomeClub.homeYCPerMatch+aAwayClub.homeYCPerMatch)/2),
				awayYCPerMatch : Math.round((aHomeClub.awayYCPerMatch+aAwayClub.awayYCPerMatch)/2),
				RCPerMatch : Math.round((aHomeClub.RCPerMatch+aAwayClub.RCPerMatch)/2),
				homeRCPerMatch : Math.round((aHomeClub.homeRCPerMatch+aAwayClub.homeRCPerMatch)/2),
				awayRCPerMatch : Math.round((aHomeClub.awayRCPerMatch+aAwayClub.awayRCPerMatch)/2),
			};
			return aRestData;
		}
	});

});
