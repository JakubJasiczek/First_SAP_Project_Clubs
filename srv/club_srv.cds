using { db.club as club} from '../db/schema';

@path: 'clubapp'

service ClubsApp { 

    entity Clubs as projection on club.Clubs;
    entity Ligi as projection on club.Ligi;
    entity Match as projection on club.Match;

}