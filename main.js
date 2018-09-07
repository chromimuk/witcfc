// random city
let belfort = [47.6379599, 6.8628842];
let geneva = [46.2044, 6.1432];

// page elements

const divTeams = document.getElementById("teams");

/// form
const inputLatitude = document.getElementById("inputLatitude");
const inputLongitude = document.getElementById("inputLongitude");

const chk_France_ligue1 = document.getElementById("chk_france_ligue1");

const btnSubmitCoordinates = document.getElementById("btnSubmitCoordinates");


btnSubmitCoordinates.onclick = check;


let count = 0;
let competitions = [];


function check() {

    // clean markers currently on the map
    cleanMarkers();

    // competitions
    competitions = getSelectedCompetitions();
    loadTeams();
}

function scriptLoaded() {
    count++;
    if (count === competitions.length)
        continueSetup();
}


function continueSetup() {
    // clubs
    const clubs = getClubs()
    console.log(clubs);

    // coordinates to look for
    const currentCoordinates = getCurrentCoordinate();
    addMarker(currentCoordinates, true);


    // get the X closest clubs
    const closestClubs = findClosestClubFromCoordinates(clubs, currentCoordinates);

    // add the markers and print the results
    addMarkers(closestClubs);
    printResults(closestClubs);
}



function getSelectedCompetitions() {
    let _competitions = [];

    if (chk_France_ligue1.checked === true) {
        _competitions.push(Competitions.France_Ligue1);
    }

    return _competitions;
}

function loadTeams() {
    for (let competition of competitions) {
        loadScript(competition, continueSetup);
    }
}


function getClubs() {

    if (competitions.length === 0)
        throw new Error("competitions.length === 0");


    let teams = [];
    competitions.forEach(competition => {
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



function getCurrentCoordinate() {
    return new Coordinate(
        inputLatitude.value,
        inputLongitude.value,
        Coordinate.getDefaultDescription()
    );
}


function addMarkers(clubs) {
    for (let club of clubs) {
        addMarker(club.coordinates, false);
    }
}

function printResults(clubs) {
    let result = '';
    for (let club of clubs) {
        result += `<b>${club.name}</b><br/>`;
    }
    divTeams.innerHTML = result;
}

function findClosestClubFromCoordinates(clubs, coordinates) {
    return clubs.sort(function (clubA, clubB) {
        const distanceClubA = DistanceTools.calculateDistance(clubA.coordinates, coordinates);
        const distanceClubB = DistanceTools.calculateDistance(clubB.coordinates, coordinates);
        return distanceClubA - distanceClubB;
    }).slice(0, 5);
}



let scriptsLoaded = [];


function loadScript(url, completedCallback) {
    
    if (scriptsLoaded.indexOf(url) > -1) 
    {
        completedCallback();
        return;
    }

    const head = document.getElementsByTagName('head')[0];
    let script = document.createElement("script");
    script.src = url;
    script.onload = completedCallback;
    script.onreadystatechange = function () {
        if (this.readyState == 'complete') {
            completedCallback();
        }
    };


    head.appendChild(script);
    scriptsLoaded.push(url);
}
