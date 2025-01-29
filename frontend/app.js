document.getElementById("urlForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const originalUrl = document.getElementById("originalUrl").value;
    const shortenedUrlContainer = document.getElementById("shortenedUrlContainer");
    const shortenedUrl = document.getElementById("shortenedUrl");

    try {
        const response = await fetch("http://localhost:5001/shorten", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ originalUrl }),
        });

        const data = await response.json();
        if (response.ok) {
            shortenedUrlContainer.classList.remove("hidden");
            shortenedUrl.textContent = data.shortUrl;
            shortenedUrl.href = data.shortUrl;
        } else {
            alert(data.error || "Something went wrong!");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("There was an error processing your request.");
    }
});

