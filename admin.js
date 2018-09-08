// doRequest();
// addr_search(address);

function doRequest() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) {
            return false;
        }
        if (xhr.status !== 200) {
            return false;
        }
        console.log(xhr.responseText);
    }

    xhr.open(
        "GET",
        "https://api.football-data.org/v2/competitions/2014/teams",
        true
    );

    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('X-Auth-Token', '69729dd0c7814aaa922855e6dc63ccdb');
    xhr.send();
}