function generateForecast() {
    // Get input values
    const eventName = document.getElementById("event-name").value;
    const eventDate = new Date(document.getElementById("event-date").value);
    const dailySignupsInput = document.getElementById("daily-signups").value;
    const dailyEmailsInput = document.getElementById("daily-emails").value;

    if (!eventName || !eventDate || !dailySignupsInput || !dailyEmailsInput) {
        alert("Please fill out all fields.");
        return;
    }

    // Parse input data
    const dailySignups = dailySignupsInput.split(",").map(Number);
    const dailyEmails = dailyEmailsInput.split(",").map(Number);

    if (dailySignups.length !== dailyEmails.length) {
        alert("Sign-ups and email volumes must have the same number of days.");
        return;
    }

    // Forecasting setup
    const forecastedEmails = [];
    const staffNeeded = [];
    const labels = [];
    const totalDays = dailySignups.length;
    const growthRate = 1.05; // 5% growth factor for sign-ups affecting emails
    const emailsPerStaff = 50; // Staff SLA: One person handles 50 emails/day

    let currentEmails = dailyEmails[dailyEmails.length - 1];
    let daysUntilEvent = Math.ceil((eventDate - new Date()) / (1000 * 60 * 60 * 24));

    for (let i = 0; i < daysUntilEvent; i++) {
        const forecastFactor = dailySignups[Math.min(i, totalDays - 1)] * growthRate;
        currentEmails += forecastFactor;
        forecastedEmails.push(Math.round(currentEmails));
        staffNeeded.push(Math.ceil(currentEmails / emailsPerStaff));

        // Format dates as MMM-DD-YYYY
        const forecastDate = new Date();
        forecastDate.setDate(forecastDate.getDate() + i);
        labels.push(forecastDate.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }));
    }

    // Display charts
    displayChart("Forecasted Emails", labels, forecastedEmails, "forecastChart", "blue");
    displayChart("Staff Needed (SLA)", labels, staffNeeded, "staffingChart", "green");
}

function displayChart(title, labels, data, chartId, color) {
    const ctx = document.getElementById(chartId).getContext("2d");
    new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: title,
                    data: data,
                    borderColor: color,
                    backgroundColor: color,
                    fill: false,
                    tension: 0.1,
                },
            ],
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: title,
                    font: { size: 16 },
                },
            },
            responsive: true,
        },
    });
}
