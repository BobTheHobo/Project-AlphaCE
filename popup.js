async function getChromeDeveloperTabs() {
    const tabs = await chrome.tabs.query({ 
    url: [
            "https://developer.chrome.com/docs/webstore/*",
            "https://developer.chrome.com/docs/extensions/*",
        ],
    });
    return tabs;
}

async function getAllTabs() {
    const tabs = await chrome.tabs.query({});
    return tabs;
}

function createTabItem() {
    const li = document.createElement("li");
    li.innerHTML = `
        <a>
            <div class="title-container">
                <img class="favicon"></img>
                <h3 class="title"></h3>
            </div>
            <p class="url-text"></p>
        </a>
    `;
    return li;
}

function openLinks() {
    const linkInput = document.getElementById("link-input");
    const openLinksButton = document.getElementById("open-links-button");

    openLinksButton.addEventListener("click", () => {
        const links = linkInput.value.split("\n");
        chrome.windows.create({focused: true}, (window) => {
            for (const link of links) {
                chrome.tabs.create({url: link.trim(), windowId: window.id});
            }
        });
    })
}

openLinks();

const chromeDeveloperTabs = await getChromeDeveloperTabs();
const tabs = await getAllTabs();
console.log(tabs);
const currentWindow = await chrome.windows.getCurrent();

const collator = new Intl.Collator();

tabs.sort((a,b) => collator.compare(a.title, b.title));

const elements = new Set();
for (const tab of tabs) {
    if(!("url" in tab)) {
        continue;
    }
    const element = createTabItem();

    const favicon = tab.favIconUrl;
    const title = tab.title;
    const url = new URL(tab.url);
    
    element.querySelector(".favicon").src = favicon;
    element.querySelector(".title").textContent = title;
    element.querySelector(".url-text").textContent = url;
    element.querySelector("a").addEventListener("click", async () => {
        //need to focus window as well as the active tab
        await chrome.tabs.update(tab.id, { active: true });
        await chrome.windows.update(tab.windowId, { focused: true });
    })

    elements.add(element);
}
document.querySelector("ul").append(...elements);

const groupTabsButton = document.getElementById("group-tabs-button");
const goToEZOpenButton = document.getElementById("go-to-ezopen-button");
const backToTopButton = document.getElementById("back-to-top-button");
const clearLinksButton = document.getElementById("clear-links-button");
const body = document.querySelector("body")
const linkInput = document.getElementById("link-input");

groupTabsButton.addEventListener("click", () => {
    groupTabsInCurrentWindow();
    copyAllLinks();
});

goToEZOpenButton.addEventListener("click", () => {
    body.scrollIntoView(false);
    linkInput.focus();
})

backToTopButton.addEventListener("click", () => {
    body.scrollIntoView(true);
})

clearLinksButton.addEventListener("click", () => {
    linkInput.value = "";
    linkInput.focus();
})

function copyAllLinks() {
    const links = tabs.map((tab) => tab.url).join("\n");
    copy(links)
}

function copy(text) {
    return text;
    //figure out how to get this into clipboard later
    //use this: https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
}

async function groupTabsInCurrentWindow() {
    const tabIds = [];
    tabs.forEach((tab) => {
        if(tab.windowId === currentWindow.id) {
            tabIds.push(tab.id);
        }
    })

    console.log(tabIds)
    const group = await chrome.tabs.group({ tabIds });
    await chrome.tabGroups.update(group, { title: "DOCS"});
}

