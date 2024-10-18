document.getElementById('calculate-button').addEventListener('click', function() {
    // Prefill Input Values in HTML for testing purposes only (removed from JavaScript to allow user input to persist)

    // Input Values
    const windSpeed = parseFloat(document.getElementById('wind-speed').value);
    const height = parseFloat(document.getElementById('height').value);
    const turbineType = document.getElementById('turbine-type').value;
    const turbineCount = parseInt(document.getElementById('turbine-count').value);

    // Constants
    const seaLevelDensity = 1.225; // kg/m³
    const scaleHeight = 8500; // m

    // Corrected Air Density Calculation
    const airDensity = seaLevelDensity * Math.exp(-height / scaleHeight);
    document.getElementById('air-density-result').textContent = `Corrected Air Density: ${airDensity.toFixed(3)} kg/m³`;

    // Rotor Diameter and Capacity Factor based on Turbine Type
    let rotorDiameter, capacityFactor;
    if (turbineType === "vestas-v110") {
        rotorDiameter = 110; // meters for Vestas V110
        capacityFactor = 0.30; // Capacity factor for Vestas V110
    } else if (turbineType === "ge-116") {
        rotorDiameter = 116; // meters for GE 116
        capacityFactor = 0.35; // Capacity factor for GE 116
    } else {
        document.getElementById('specific-power-result').textContent = `Please select a valid turbine type.`;
        return;
    }

    // Specific Power in Wind Calculation
    const specificPower = 0.5 * airDensity * Math.pow(windSpeed, 3);
    document.getElementById('specific-power-result').textContent = `Specific Power in the Wind: ${specificPower.toFixed(2)} W/m²`;

    // Power Output Calculation
    const sweptArea = Math.PI * Math.pow(rotorDiameter / 2, 2); // m²
    const powerOutput = sweptArea * specificPower; // W per turbine
    const totalPowerOutput = powerOutput * turbineCount; // Total power for all turbines
    document.getElementById('power-output-result').textContent = `Power Output: ${(totalPowerOutput / 1000).toFixed(2)} kW`;

    // Annual Energy Production (AEP) Calculation
    const ratedPower = 2000; // kW (2 MW)
    const hoursPerYear = 8760;
    const aep = ratedPower * capacityFactor * hoursPerYear; // kWh
    document.getElementById('aep-vestas-result').style.display = turbineType === "vestas-v110" ? "block" : "none";
    document.getElementById('aep-ge-result').style.display = turbineType === "ge-116" ? "block" : "none";
    document.getElementById('aep-vestas-result').textContent = turbineType === "vestas-v110" ? `AEP (Vestas V110): ${(aep / 1000).toFixed(2)} GWh` : "";
    document.getElementById('aep-ge-result').textContent = turbineType === "ge-116" ? `AEP (GE 116): ${(aep / 1000).toFixed(2)} GWh` : "";

    // Noise Level Calculation
    const baseNoiseLevel = 105; // dB for each turbine
    const combinedNoiseLevel = 10 * Math.log10(turbineCount * Math.pow(10, baseNoiseLevel / 10));
    document.getElementById('noise-level-result').textContent = `Combined Noise Level: ${combinedNoiseLevel.toFixed(1)} dB`;

    // Plot Wind Speed Histogram (as a Line Chart using Rayleigh Distribution)
    const ctx = document.getElementById('wind-histogram').getContext('2d');

    // Rayleigh Distribution Calculation based on Average Wind Speed
    const sigma = windSpeed / Math.sqrt(2 / Math.PI); // Estimation for sigma based on average wind speed
    const labels = [];
    const data = [];
    const maxSpeed = windSpeed * 3; // Define maximum wind speed for the plot (three times the average speed to capture range)

    for (let v = 0; v <= maxSpeed; v += 0.1) { // Increased resolution by using smaller step size
        labels.push(v.toFixed(1));
        const rayleighPDF = (v / (sigma * sigma)) * Math.exp(-Math.pow(v, 2) / (2 * sigma * sigma));
        data.push(rayleighPDF);
    }

    // Clear previous chart instance if it exists
    if (window.myChart instanceof Chart) {
        window.myChart.destroy();
    }

    // Create new chart instance
    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Rayleigh PDF based on Input Wind Speed',
                data: data,
                borderColor: 'blue',
                fill: false,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Rayleigh Probability Density Function for Wind Speed'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Probability Density'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Wind Speed (m/s)'
                    }
                }
            }
        }
    });
});
