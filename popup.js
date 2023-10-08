async function getTabs() {
    const tabs = await chrome.tabs.query({ 
    url: [
            "https://developer.chrome.com/docs/webstore/*",
            "https://developer.chrome.com/docs/extensions/*",
        ],
    });
    return tabs;
}

function createTabItem() {
    const li = document.createElement("li");
    const a = document.createElement("a");
    const h3 = document.createElement("h3");
    const p = document.createElement("p");
    li.innerHTML = `
        <a>
            <h3 class="title"></h3>
            <p class="pathname"></p>
        </a>
    `;
    return li;
}

function openLinks() {
    const linkInput = document.getElementById("link-input");
    const openLinksButton = document.getElementById("open-links");

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

const tabs = await getTabs();
const collator = new Intl.Collator();

tabs.sort((a,b) => collator.compare(a.title, b.title));

const elements = new Set();
for (const tab of tabs) {
    const element = createTabItem();

    const title = tab.title.split("-")[0].trim();
    const pathname = new URL(tab.url).pathname.slice("/docs".length);

    element.querySelector(".title").textContent = title;
    element.querySelector(".pathname").textContent = pathname;
    element.querySelector("a").addEventListener("click", async () => {
        //need to focus window as well as the active tab
        await chrome.tabs.update(tab.id, { active: true });
        await chrome.windows.update(tab.windowId, { focused: true });
    })

    elements.add(element);
}
document.querySelector("ul").append(...elements);

const button = document.querySelector("button");
button.addEventListener("click", async () => {
    const tabIds = tabs.map(({id}) => id);
    const group = await chrome.tabs.group({ tabIds });
    await chrome.tabGroups.update(group, { title: "DOCS"});
});

