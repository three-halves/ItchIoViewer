import { Popup } from "./popup.js";

export const ROOT_URL = "/";

window.openDeveloperProfile = function openDeveloperProfile(id, name) {
    let popup = new Popup("Developer Profile", 
        `<p><b>[{0}]</b></p>
        <p>Dev ID: {1}</p>
        <p>Total games developed: {2}</p>
        <p>Average rating: {3} / 5 </p>
        <p>Max rating: {4} / 5 </p>
        <p>Min rating: {5} / 5 </p>

        `
    );

    fetch(`${ROOT_URL}api/developer/stats/${id}`)
    .then(response => response.json())
    .then((stats) => {
        popup.render([
            name, 
            id, 
            stats.game_count, 
            stats.average_rating, 
            stats.max_rating, 
            stats.min_rating
        ]);
        popup.open();
    })
};