const addServerForm = document.querySelector("#add-server");
let serverList = new Array();

try {
    serverList = JSON.parse(localStorage.servers);
} catch(e) { }

for(const server of serverList) {
    updateServerElement(server);
}

addServerForm.addEventListener("submit", e => {
    e.preventDefault();

    const data = new FormData(addServerForm);
    const url = data.get("url");

    addServer(url);
    updateServerElement(url);
});


async function updateServerElement(url) {
    const serverList = document.querySelector("#server-list");

    const oldElement = document.querySelector("#server-" + btoa(url));
    const newElement = createServerElement(url);

    if(oldElement == null) {
        serverList.append(newElement);
    } else {
        oldElement.replaceWith(newElement);
    }
}

function createServerElement(url) {
    const section = document.createElement("fieldset");
    section.setAttribute("id", "server-" + btoa(url));

    const legend = document.createElement("legend");

    const legendName = document.createElement("span");
    legendName.textContent = " " + url;

    const serverRemove = document.createElement("button");
    serverRemove.textContent = "X";
    legend.append(serverRemove, legendName);

    serverRemove.addEventListener("click", e => {
        if(!confirm("Are you sure you want to remove " + url + "?")) return;

        section.remove();
        removeServer(url);
    });

    const listElem = document.createElement("ul");

    section.append(legend, listElem);

    
    const loadingMessage = document.createElement("span");
    loadingMessage.textContent = "Loading...";
    listElem.append(loadingMessage);

    fetch(url + "/list").then(response => response.json()).then(list => {
        listElem.replaceChildren();

        for(const server of list) {
            const elem = document.createElement("li");
            elem.classList.add("server");

            const name = document.createElement("span");
            name.classList.add("name");
            name.textContent = server.id;

            const players = document.createElement("span");
            players.classList.add("players");
            players.textContent = server.players + " player" + (server.players != 1 ? "s" : "");

            elem.append(name, players);
            listElem.append(elem);

            const id = server.id;
            elem.addEventListener("click", e => {
                const search = new URLSearchParams([["d", btoa(url + "/?" + new URLSearchParams([["id", id]])) ]]);
                document.location.assign("./game/?" + search);
            });
        }
    });

    return section;
}

function addServer(url) {
    serverList.push(url);
    saveServerList();
}
function removeServer(url) {
    serverList.splice(serverList.indexOf(url), 1);
    saveServerList();
}
function saveServerList() {
    localStorage.servers = JSON.stringify(serverList);
}