// This might get removed at some point or put in a debug folder

async function getJSON() {
    const response = await fetch("./media/data.json");
    const json = await response.json();
    console.log("Fetched data:", json);
    return json;
}

async function getContentData(contentTitle) {
    const data = await getJSON();
    console.log(typeof data);

    const item = data.items.find(item => item.title === contentTitle);

    if (!item) {
        console.warn(`No item found with title: ${contentTitle}`);
        return;
    }

    console.log(item);

    const contentType = item.contentType;

    console.log(contentType)
}

getContentData("The King in Yellow");