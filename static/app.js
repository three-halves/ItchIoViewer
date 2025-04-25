import { UI } from "./UI.js";

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
            [data[1], 
            data[2], 
            data[3], 
            await getAssociatedNamesFromTable("developer", selectedRowID), 
            await getAssociatedNamesFromTable("publisher", selectedRowID),
                data[4]]);
        infoPlaceholder.hidden = true;
        sidebarRef.hidden = false;
    });
}

function deselectRow(row) {
    row.classList.remove("selected");
    selectedRow = null;
}

// assumes name property is second and that proper api endpoints are implemented
async function getAssociatedNamesFromTable(table, gid) {
    let aString = "";
    await fetch(ROOT_URL + `api/${table}s/${gid}`)
    .then(response => response.json())
    .then(data => {
        try {
            aString = data[0][1];
            for (const asc of data.slice(1))
            {
                aString += ", " + asc[1];
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
            let id = entry[0];
            // create row in table for each game
            let tr = document.createElement("tr");

            // click event
            tr.addEventListener("click", function (e) {
                selectRow(this);
            });

            // get developer name for main table
            [id, entry[1], entry[2], await getAssociatedNamesFromTable("developer", id)].forEach(col => {
                var td = document.createElement("td");
                td.innerHTML = col;
                tr.appendChild(td);
            });

            tableRef.appendChild(tr);
        }
    
    });

}
