import { UI } from "./UI.js";
import { Popup } from "./popup.js";

const ROOT_URL = "/"

let formButtons = Array.from(document.getElementsByClassName("form"));
formButtons.forEach((element) => element.addEventListener('submit', handleSubmit));

const tableRef = document.getElementById("table");
const tableBase = tableRef.innerHTML;
const infoPlaceholder = document.getElementById("info-placeholder");

let sidebarRef = document.getElementById("game-info");
let sidebarUI = new UI(document.getElementById("game-info").innerHTML);

let selectedRow = null;
let selectedRowID = null;

// let welcomePopup = new Popup("Welcome", "{0}");
// welcomePopup.render(["Welcome to ItchIoViewer! Click the X in the top left to close this popup."]);
// welcomePopup.open();

// initial render
render();

// catch form submits and make appropriate fetch call
function handleSubmit(event) { 
    let data = new FormData() 
    // get form values
    Array.from(event.srcElement.elements).forEach((element) => {
        if (element.tagName.toLowerCase() == "input") {
            // console.log(element.name + " : " + element.value)
            data.append(element.name, element.value);
        }
    });

    // make fetch call
    fetch(event.srcElement.action == null ? ROOT_URL : event.srcElement.action, {
        "method": "POST",
        "body": data,
    })
    .then(render)

    event.preventDefault();
}

function selectRow(row) {
    if (selectedRow != null) deselectRow(selectedRow);    
    selectedRow = row;
    selectedRowID = row.children[0].innerHTML;
    selectedRow.classList.add("selected");

    // get clicked row and render sidebar
    fetch(ROOT_URL + `api/game/${selectedRowID}`)
    .then(response => response.json())
    .then(async (data) => {
        sidebarRef.innerHTML = sidebarUI.render(
            [data.name, 
            data.rating, 
            data.genre, 
            await getAssociatedNamesFromTable("developer", data.id), 
            await getAssociatedNamesFromTable("publisher", data.id),
            data[4],
            selectedRowID
            ]);
        infoPlaceholder.hidden = true;
        sidebarRef.hidden = false;
        document.getElementById("delete-game").addEventListener("click", deleteGame);
    });
}

function deselectRow(row) {
    row.classList.remove("selected");
    selectedRow = null;

    infoPlaceholder.hidden = false;
    sidebarRef.hidden = true;
}

// assumes name property is second and that proper api endpoints are implemented
async function getAssociatedNamesFromTable(table, gid) {
    let aString = "";
    await fetch(ROOT_URL + `api/${table}s/${gid}`)
    .then(response => response.json())
    .then(data => {
        try {
            aString = data[0].name;
            for (const asc of data.slice(1))
            {
                aString += ", " + asc.name;
            }
        }
        catch {
            aString = "None";
        }

    });
    return aString;
}

// re-render the games table
function render() {
    // console.log("render");
    
    tableRef.innerHTML = tableBase;

    fetch(ROOT_URL + "api/games")
    .then(response => response.json())
    .then(async (data) => {
        // console.log(data);
        for (const entry of data) {
            // create row in table for each game
            let tr = document.createElement("tr");

            // click event
            tr.addEventListener("click", function (e) {
                selectRow(this);
            });

            // get developer name for main table
            [entry.id, entry.name, entry.rating, await getAssociatedNamesFromTable("developer", entry.id)].forEach(col => {
                var td = document.createElement("td");
                td.innerHTML = col;
                tr.appendChild(td);
            });

            tableRef.appendChild(tr);
        }
    
    });

}

function addGamePopup() {
    let gamePopup = new Popup("Add Game", "{0}");
    gamePopup.render(`
        <form class="form" method="post">
            <div class="two-column">
                <label for="name">Name: </label>
                <input type="text" id="name" name="name" placeholder="z?Game"/>
                <label for="rating">Rating: </label>
                <input type="number" step="0.1" id="rating" name="rating" placeholder="5"/>
                <label for="genre">Genre: </label>
                <input type="text" id="genre" name="genre" placeholder="Platformer"/>
                <label for="store_links">Store Links: </label>
                <input type="text" id="store_links" name="store_links" placeholder="threehalves.itch.io/zgame"/>
            </div>

            <button type="submit">go</button>
            </form>
        `);
    gamePopup.open();
}

document.getElementById("add-game").addEventListener("click", addGamePopup);

function deleteGame(e) {
    fetch(ROOT_URL + `api/game/delete/${e.target.getAttribute("data-gid")}`)
    .then(() => {
        deselectRow(selectedRow);
        render();
    });

}