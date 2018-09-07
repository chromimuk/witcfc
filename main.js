var App = (function () {

    // meh
    let _competitions = [];

    function init() {
        HtmlHelper.init(onFormSubmit);
        MapHelper.init(HtmlHelper.getMapDivID());
    }

    function onFormSubmit() {
        // remove all markers on the map
        MapHelper.cleanMarkers();

        // get selected competitions form the form
        _competitions = HtmlHelper.getSelectedCompetitions();

        // load competitions scripts
        for (let competition of _competitions) {
            // todo: should call onCompetitionScriptLoaded only when all the scripts are loaded!
            LazyLoadingTools.loadScript(competition, onCompetitionScriptLoaded);
        }
    }

    function onCompetitionScriptLoaded() {

        const clubs = getClubs();

        // coordinates to look for
        const currentCoordinates = HtmlHelper.getCurrentCoordinates();
        MapHelper.addMarker(currentCoordinates, true);

        // get the X closest clubs
        const closestClubs = findClosestClubFromCoordinates(clubs, currentCoordinates);

        // add the markers and print the results
        MapHelper.addMarkers(closestClubs.map(x => x.coordinates), false);
        HtmlHelper.printClubs(closestClubs);
    }

    function getClubs() {

        if (_competitions.length === 0)
            throw new Error("competitions.length === 0");

        let teams = [];
        _competitions.forEach(competition => {
            if (competition === Competitions.France_Ligue1) {
                teams = teams.concat(competitions_france_ligue1.teams);
            }
        });

        let clubs = [];
        teams.forEach(function (team) {
            clubs.push(
                new Club(
                    team.name,
                    new Coordinate(team.latitude, team.longitude, team.name)
                )
            );
        });

        return clubs;
    }

    function findClosestClubFromCoordinates(clubs, coordinates) {
        return clubs.sort(function (clubA, clubB) {
            const distanceClubA = DistanceTools.calculateDistance(clubA.coordinates, coordinates);
            const distanceClubB = DistanceTools.calculateDistance(clubB.coordinates, coordinates);
            return distanceClubA - distanceClubB;
        }).slice(0, 5);
    }

    return {
        init: init
    };
})();

App.init();