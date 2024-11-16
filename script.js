function processFile() {
    const fileInput = document.getElementById("upload-file");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please upload a CSV file.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const content = e.target.result;
        const data = parseCSV(content);
        generateForecasts(data);
    };
    reader.readAsText(file);
}

function parseCSV(content) {
    const rows = content.split("\n").map(row => row.split(","));
    const headers = rows[0].map(header => header.trim());
    const data = rows.slice(1).map(row => {
        const entry = {};
        headers.forEach((header, index) => {
            entry[header] = row[index] ? row[index].trim() : null;
        });
        return entry;
    });
    return data.filter(row => row["EVENT NAME"]); // Filter out empty rows
}

function generateForecasts(eventsData) {
    const resultsContainer = document.getElementById("results");
    resultsContainer.innerHTML = "";

    eventsData.forEach(event => {
        const eventDate = event["EVENT DATE"];
        const eventName = event["EVENT NAME"];
        const estimatedSignUps = parseInt(event["ESTIMATED SIGN UP"]);
        const currentSignUps = parseInt(event["CURRENT NUMBER OF SIGN UPS"]);

        // Validate data
        if (!eventDate || !eventName || isNaN(estimatedSignUps) || isNaN(currentSignUps)) {
            resultsContainer.innerHTML += `<p>Invalid data for event: ${eventName}</p>`;
            return;
        }

        // Forecast data
        const forecastedEmails = [];
        const staffNeeded = [];
        const labels = [];
        const emailsPerSignUp = 0.1; // Assume 10% of sign-ups lead to emails
        const emailsPerStaff = 50; // One staff member handles 50 emails/day
        const daysUntilEvent = Math.ceil(
            (new Date(eventDate) - new Date()) / (1000 * 60 * 60 * 24)
        );

        for (let i = 0; i < daysUntilEvent; i++) {
            const dailyEmails = Math.round((currentSignUps + i * (estimatedSignUps - currentSignUps) / daysUntilEvent) * emailsPerSignUp);
            forecastedEmails.push(dailyEmails);
            staffNeeded.push(Math.ceil(dailyEmails / emailsPerStaff));

            const forecastDate = new Date();
            forecastDate.setDate(forecastDate.getDate() + i);
            labels.push(forecastDate.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }));
        }

        // Add charts
        resultsContainer.innerHTML += `<h2>${eventName} (${eventDate})</h2>`;
        resultsContainer.innerHTML += `<canvas id="chart-${eventName.replace(/\s+/g, "-")}"></canvas>`;
        renderChart(`chart-${eventName.replace(/\s+/g, "-")}`, labels, forecastedEmails, staffNeeded);
    });
}

function renderChart(chartId, labels, forecastedEmails, staffNeeded) {
    const ctx = document.getElementById(chartId).getContext("2d");
    new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Forecasted Emails",
                    data: forecastedEmails,
                    borderColor: "blue",
                    fill: false,
                },
                {
                    label: "Staff Needed",
                    data: staffNeeded,
                    borderColor: "green",
                    fill: false,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: `Forecast for ${chartId.split("-").join(" ")}`,
                },
            },
        },
    });
}
