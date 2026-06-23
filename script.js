const urlInput = document.getElementById("youtubeUrl");
const results = document.getElementById("results");
const themeBtn = document.getElementById("themeToggle");

function updateThemeIcon() {
    themeBtn.textContent =
        document.body.classList.contains("dark")
            ? "☀️"
            : "🌙";
}

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
}

if (themeBtn) {

    updateThemeIcon();

    themeBtn.addEventListener("click", () => {

        document.body.classList.toggle("dark");

        localStorage.setItem(
            "theme",
            document.body.classList.contains("dark")
                ? "dark"
                : "light"
        );

        updateThemeIcon();
    });
}

if (urlInput) {
    urlInput.addEventListener("input", async () => {

        const url = urlInput.value.trim();

        if (url) {
            localStorage.setItem("lastYoutubeUrl", url);
        }

        const videoId = getVideoId(url);

        if (!videoId) {
            results.innerHTML = "";
            return;
        }

        const title = await getVideoTitle(videoId);

        renderThumbnails(videoId, title);
    });
}

window.addEventListener("DOMContentLoaded", async () => {

    if (!urlInput || !results) return;

    const savedUrl = localStorage.getItem("lastYoutubeUrl");

    if (!savedUrl) return;

    urlInput.value = savedUrl;

    const videoId = getVideoId(savedUrl);

    if (!videoId) return;

    const title = await getVideoTitle(videoId);

    renderThumbnails(videoId, title);
});

function getVideoId(url) {

    const reg =
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^?&/]+)/;

    const match = url.match(reg);

    return match ? match[1] : null;
}

async function getVideoTitle(videoId) {

    try {

        const response =
            await fetch(
                `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
            );

        const data = await response.json();

        return sanitizeFileName(data.title);

    } catch {

        return `youtube-thumbnail-${videoId}`;
    }
}

function sanitizeFileName(name) {

    return name.replace(/[\\/:*?"<>|]/g, "");
}

function renderThumbnails(videoId, title) {

    results.innerHTML = "";

    const thumbnails = [

        {
            size: "1280 × 720",
            url: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
        },

        {
            size: "640 × 480",
            url: `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`
        },

        {
            size: "480 × 360",
            url: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
        },

        {
            size: "320 × 180",
            url: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`
        },

        {
            size: "120 × 90",
            url: `https://i.ytimg.com/vi/${videoId}/default.jpg`
        }
    ];

    thumbnails.forEach((thumb, index) => {

        const card = document.createElement("div");

        card.className = "thumb-card";

        card.innerHTML = `

        <button
class="download-btn"
onclick="downloadThumbnail(
'${thumb.url}',
'${title}-${thumb.size.replace(" × ", "x").replace(/\s/g, "")}'
)">
Download
</button>

        <img src="${thumb.url}" alt="Thumbnail">

        <div class="size-label">
     ${thumb.size} </div>
        `;

        results.appendChild(card);
    });
}

async function downloadThumbnail(url, filename) {
    try {

        const response = await fetch(url);

        const blob = await response.blob();

        const blobUrl = window.URL.createObjectURL(blob);

        const a = document.createElement("a");

        a.href = blobUrl;
        a.download = filename + ".jpg";

        document.body.appendChild(a);

        a.click();

        a.remove();

        window.URL.revokeObjectURL(blobUrl);

    } catch (error) {

        console.error(error);

        alert("Download failed.");
    }
}

const clearBtn = document.getElementById("clearBtn");

if (clearBtn) {
    clearBtn.addEventListener("click", () => {

        localStorage.removeItem("lastYoutubeUrl");

        urlInput.value = "";

        results.innerHTML = "";
    });
}