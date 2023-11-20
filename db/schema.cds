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
    liga : Association to Ligi;
};

entity Ligi : cuid {
    name : String;
    clubs : Composition of many Clubs on clubs.liga = $self;
};

entity Match : cuid {
    homeName : String ;
    homeGols : Integer;
    awayName : String ;
    awayGols : Integer;
    dateEvent : DateTime ;
    league : String;
    round : Integer;
}