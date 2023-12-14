namespace db.club;

using {cuid} from '@sap/cds/common';
entity Clubs : cuid { 
    position : Integer;
    name : String;
    points : Integer;
    match : Integer;
    win : Integer;
    draw : Integer;
    lose : Integer;
    gols_score : Integer;
    gols_lose : Integer;
    balance : Integer;
    liga : Association to Ligi;
    matchesHome : Composition of many Match on matchesHome.home = $self ;
    matchesAway : Composition of many Match on matchesAway.away = $self ;
    stadium : String;
    logo : String ;
};

entity Ligi : cuid {
    name : String;
    logo : String;
    clubs : Composition of many Clubs on clubs.liga = $self;
    match : Composition of many Match on match.league_id = $self;
};

entity Match : cuid {
    homeName : String ;
    home : Association to Clubs ;
    homeGols : Integer;
    homeYC : Integer;
    homeRC : Integer;
    homeRR : Integer;
    awayName : String ;
    away : Association to Clubs ;
    awayGols : Integer;
    awayYC : Integer;
    awayRC : Integer;
    awayRR : Integer;
    dateEvent : DateTime ;
    dateEventString : String;
    league : String ;
    league_id : Association to Ligi;
    round : Integer;
};