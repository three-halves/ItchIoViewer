import { UI } from "./UI.js";
import { Popup } from "./popup.js";
import { ROOT_URL } from "./globals.js";

function refreshFormListeners()
{
    let formButtons = Array.from(document.getElementsByClassName("form"));
    formButtons.forEach((element) => element.removeEventListener('submit', handleSubmit));
    formButtons.forEach((element) => element.addEventListener('submit', handleSubmit));
}

refreshFormListeners();

let tableRef = document.getElementById("table");
const tableBase = tableRef.innerHTML;
tableRef.remove();
const infoPlaceholder = document.getElementById("info-placeholder");

let sidebarRef = document.getElementById("game-info");
let sidebarUI = new UI(document.getElementById("game-info").innerHTML);
let mainRef = document.getElementById("main");

let selectedRow = null;
let selectedRowData = null
let selectedRowID = null;

// let welcomePopup = new Popup("Welcome", "{0}");
// welcomePopup.render(["Welcome to ItchIoViewer! Click the X in the top left to close this popup."]);
// welcomePopup.open();

// initial render
render_full();

// catch form submits and make appropriate fetch call
function handleSubmit(event) { 
    let data = new FormData() 
    
    // check form flags through data attributes
    if (event.srcElement.getAttribute("data-gid") !== null) {
        data.append("gid", event.srcElement.getAttribute("data-gid"))
    }
    // get form values
    Array.from(event.srcElement.elements).forEach((element) => {
        if (element.tagName.toLowerCase() === "input") {
            data.append(element.name, element.value);
        }
    });

    // make fetch call
    // check if call returns table data to render differently
    if (event.srcElement.getAttribute("data-render") !== null) {
        fetch(event.srcElement.action === null ? ROOT_URL : event.srcElement.action, {
            "method": "POST",
            "body": data,
        })
        .then(response => response.json())
        .then(data => {
            render(data)});
    }
    // otherwise, render all games
    else {
        fetch(event.srcElement.action === null ? ROOT_URL : event.srcElement.action, {
            "method": "POST",
            "body": data,
        })
        .then(render_full);
    }

    event.preventDefault();
}

function selectRow(row) {
    if (selectedRow !== null && row !== selectedRow) deselectRow(selectedRow, false);   
    selectedRow = row;
    selectedRowID = row.children[0].innerHTML;
    selectedRow.classList.add("selected");

    // get clicked row and render sidebar
    fetch(ROOT_URL + `api/game/${selectedRowID}`)
    .then(response => response.json())
    .then(async (data) => {
        selectedRowData = data;
        sidebarRef.innerHTML = sidebarUI.render(
            [data.name, 
            data.rating, 
            data.genre, 
            await developerDataToProfileLinks(await getAssociatedDataFromTable("developer", data.id)), 
            await getAssociatedNamesFromTable("publisher", data.id),
            data.store_links,
            await getAssociatedNamesFromTable("tag", data.id),
            data.id
            ]);
        infoPlaceholder.hidden = true;
        sidebarRef.hidden = false;
        document.getElementById("delete-game").addEventListener("click", deleteGame);
        document.getElementById("tag-game").addEventListener("click", tagGamePopup);
        document.getElementById("edit-game").addEventListener("click", editGamePopup);

    });
}

// returns innerhtml string of developer links to be displayed in sidebar
async function developerDataToProfileLinks(data) {
    let s = "";
    data.forEach(entry => {
        s += `<a href="javascript:void(0)" onclick="openDeveloperProfile('${entry.id}', '${entry.name}')">${entry.name}</a>`
    });
    return s;
}

function deselectRow(row, remove_sidebar=true) {
    row.classList.remove("selected");
    selectedRow = null;
    selectedRowData = null;

    infoPlaceholder.hidden = !remove_sidebar;
    sidebarRef.hidden = remove_sidebar;
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

async function getAssociatedDataFromTable(table, gid) {
    let dataArr = []
    await fetch(ROOT_URL + `api/${table}s/${gid}`)
    .then(response => response.json())
    .then(data => {
            dataArr = data;
        });

    return dataArr;
};

function render_full() {
    fetch(ROOT_URL + "api/games")
    .then(response => response.json())
    .then(async (data) => {
        render(data)   
    });
}

// re-render the games table
async function render(data) {
    let newTable = document.createElement("table");
    newTable.innerHTML = tableBase;
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

        newTable.appendChild(tr);
        if (selectedRowData !== null && entry.id === selectedRowData.id) selectRow(tr);
    }

    mainRef.removeChild(mainRef.lastChild);
    mainRef.appendChild(newTable);
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
    refreshFormListeners();
}

function tagGamePopup() {
    let tagPopup = new Popup("Add Tag", 
        `<form class="form" method="post" action="/api/tag" data-gid={1} >
            <p>Tagging {0}...</p>
            <div class="two-column">
                <label for="tag-name">Tag Name: </label>
                <input type="text" id="tag" name="name" placeholder="Local Multiplayer"/>
            </div>
        <button type="submit">go</button>
        </form>`
    );

    tagPopup.render([selectedRowData.name, selectedRowData.id]);
    tagPopup.open();
    refreshFormListeners();
}

function editGamePopup() {
    let popup = new Popup("Edit Game", 
        `<form class="form" method="post" action="/api/game/update" data-gid={4}>
            <div class="two-column">
                <label for="name">Name: </label>
                <input type="text" id="name" name="name" placeholder="z?Game" value="{0}" />
                <label for="rating">Rating: </label>
                <input type="number" step="0.1" id="rating" name="rating" placeholder="5" value="{1}" />
                <label for="genre">Genre: </label>
                <input type="text" id="genre" name="genre" placeholder="Platformer" value="{2}" />
                <label for="store_links">Store Links: </label>
                <input type="text" id="store_links" name="store_links" placeholder="threehalves.itch.io/zgame" value="{3}" />
            </div>

            <button type="submit">go</button>
            </form>`
    );

    popup.render([selectedRowData.name, selectedRowData.rating, selectedRowData.genre, selectedRowData.store_links, selectedRowData.id]);
    popup.open();
    refreshFormListeners();
}

function advancedSearchPopup() {
    let popup = new Popup("Advanced Search", 
        `<p>Search queries will be matched exactly. Queries left blank will not apply.</p>
        <form class="form" method="get" action="/api/games" data-render>
            <div class="two-column">
                <label for="name">Name: </label>
                <input type="text" id="name" name="game.name" placeholder="z?Game" />
                <label for="rating">Rating: </label>
                <input type="number" step="0.1" id="rating" name="game.rating" placeholder="5" />
                <label for="genre">Genre: </label>
                <input type="text" id="genre" name="game.genre" placeholder="Platformer" />
                <label for="genre">Developer: </label>
                <input type="text" id="developer" name="developer.name" placeholder="Threehalves" />
                <label for="genre">Publisher: </label>
                <input type="text" id="publisher" name="publisher.name" placeholder="Lemniscate Games" />
                <label for="Tag">Tag: </label>
                <input type="text" id="tag" name="tag.name" placeholder="Local Multiplayer" />
            </div>

            <button type="submit">go</button>
            </form>`
    );

    popup.render();
    popup.open();
    refreshFormListeners();
}

function deleteGame(e) {
    fetch(ROOT_URL + `api/game/delete/${e.target.getAttribute("data-gid")}`)
    .then(() => {
        deselectRow(selectedRow);
        render_full();
    });

}

document.getElementById("add-game").addEventListener("click", addGamePopup);
document.getElementById("advanced-search").addEventListener("click", advancedSearchPopup);
