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
    const headers = rows[0];
    const data = rows.slice(1).map(row => {
        const entry = {};
        headers.forEach((header, index) => {
            entry[header.trim()] = row[index] ? row[index].trim() : null;
        });
        return entry;
    });
    return data.filter(row => row["Event Name"]); // Remove empty rows
}

function generateForecasts(eventsData) {
    const resultsContainer = document.getElementById("results");
    resultsContainer.innerHTML = "";

    eventsData.forEach(event => {
        const eventName = event["Event Name"];
        const eventDate = new Date(event["Event Date"]);
        const dailySignups = event["Daily Sign-ups"].split(",").map(Number);
        const dailyEmails = event["Daily Email Volume"].split(",").map(Number);

        // Validate data
        if (!eventName || isNaN(eventDate) || dailySignups.length !== dailyEmails.length) {
            resultsContainer.innerHTML += `<p>Invalid data for event: ${eventName}</p>`;
            return;
        }

        // Forecast data
        const { forecastedEmails, staffNeeded, labels } = calculateForecast(
            eventDate,
            dailySignups,
            dailyEmails
        );

        // Add charts
        resultsContainer.innerHTML += `<h2>${eventName}</h2>`;
        resultsContainer.innerHTML += `<canvas id="chart-${eventName.replace(/\s+/g, "-")}"></canvas>`;
        renderChart(`chart-${eventName.replace(/\s+/g, "-")}`, labels, forecastedEmails, staffNeeded);
    });
}

function calculateForecast(eventDate, dailySignups, dailyEmails) {
    const forecastedEmails = [];
    const staffNeeded = [];
    const labels = [];
    const growthRate = 1.05;
    const emailsPerStaff = 50;

    let currentEmails = dailyEmails[dailyEmails.length - 1];
    let daysUntilEvent = Math.ceil((eventDate - new Date()) / (1000 * 60 * 60 * 24));

    for (let i = 0; i < daysUntilEvent; i++) {
        const signupGrowth = dailySignups[Math.min(i, dailySignups.length - 1)] * growthRate;
        currentEmails += signupGrowth;
        forecastedEmails.push(Math.round(currentEmails));
        staffNeeded.push(Math.ceil(currentEmails / emailsPerStaff));

        const forecastDate = new Date();
        forecastDate.setDate(forecastDate.getDate() + i);
        labels.push(forecastDate.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }));
    }

    return { forecastedEmails, staffNeeded, labels };
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
