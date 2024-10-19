document.getElementById('calculate-button').addEventListener('click', function() {
    // Input Values
    const windSpeed = parseFloat(document.getElementById('wind-speed').value);
    const height = parseFloat(document.getElementById('height').value);
    const turbineType = document.getElementById('turbine-type').value;
    const turbineCount = parseInt(document.getElementById('turbine-count').value);
    const temperatureCelsius = parseFloat(document.getElementById('temperature').value);

    // Constants
    const seaLevelPressure = 101325; // Pa
    const scaleHeight = 8500; // m
    const specificGasConstant = 287.05; // J/(kg·K)
    const noiseThreshold = 40; // Victorian standard in dB
    const averageElectricityPrice = 0.1; // Price per kWh ($0.10)
    const turbineCost = 3000000; // Approximate cost per turbine ($3 million)
    const co2EmissionFactor = 0.5; // kg of CO₂ per kWh for fossil fuel-based power

    // Convert Temperature to Kelvin
    const temperatureKelvin = temperatureCelsius + 273.15;

    // Estimate Pressure based on Height (using barometric formula)
    const pressure = seaLevelPressure * Math.exp(-height / scaleHeight); // Pressure in Pa

    // Corrected Air Density Calculation
    const airDensity = pressure / (specificGasConstant * temperatureKelvin); // Air density in kg/m³
    document.getElementById('air-density-result').textContent = `Corrected Air Density: ${airDensity.toFixed(3)} kg/m³`;

    // Rotor Diameter and Capacity Factor based on Turbine Type
    let rotorDiameter, capacityFactor;
    if (turbineType === "vestas-v110") {
        rotorDiameter = 110;
        capacityFactor = 0.30;
    } else if (turbineType === "ge-116") {
        rotorDiameter = 116;
        capacityFactor = 0.35;
    }

    // Specific Power Calculation
    const specificPower = 0.5 * airDensity * Math.pow(windSpeed, 3);
    document.getElementById('specific-power-result').textContent = `Specific Power in the Wind: ${specificPower.toFixed(2)} W/m²`;

    // Power Output Calculation
    const sweptArea = Math.PI * Math.pow(rotorDiameter / 2, 2);
    const powerOutput = sweptArea * specificPower;
    const totalPowerOutput = powerOutput * turbineCount;
    document.getElementById('power-output-result').textContent = `Power Output: ${(totalPowerOutput / 1000).toFixed(2)} kW`;

    // Theoretical Maximum Power Calculation
    const theoreticalMaxPower = 0.5 * airDensity * sweptArea * Math.pow(windSpeed, 3); // Watts per turbine
    const efficiency = (totalPowerOutput / (theoreticalMaxPower * turbineCount)) * 100; // Efficiency in percentage
    document.getElementById('efficiency-result').textContent = `Efficiency: ${efficiency.toFixed(2)} %`;

    // Annual Energy Production (AEP)
    const ratedPower = 2000; // kW per turbine
    const hoursPerYear = 8760; // Total hours in a year
    const aep = ratedPower * capacityFactor * hoursPerYear; // kWh for a single turbine
    const totalAEP = aep * turbineCount; // kWh for all turbines

    document.getElementById('aep-vestas-result').style.display = turbineType === "vestas-v110" ? "block" : "none";
    document.getElementById('aep-ge-result').style.display = turbineType === "ge-116" ? "block" : "none";
    document.getElementById('aep-vestas-result').textContent = turbineType === "vestas-v110" ? `AEP (Vestas V110): ${(totalAEP / 1000).toFixed(2)} GWh` : "";
    document.getElementById('aep-ge-result').textContent = turbineType === "ge-116" ? `AEP (GE 116): ${(totalAEP / 1000).toFixed(2)} GWh` : "";

    // Noise Level Calculation
    const baseNoiseLevel = 105; // dB for each turbine
    const combinedNoiseLevel = 10 * Math.log10(turbineCount * Math.pow(10, baseNoiseLevel / 10));
    document.getElementById('noise-level-result').textContent = `Combined Noise Level: ${combinedNoiseLevel.toFixed(1)} dB`;

    // Noise Compliance Check
    if (combinedNoiseLevel <= noiseThreshold) {
        document.getElementById('noise-compliance-result').textContent = `Noise Level Compliance: Within Victorian regulations.`;
    } else {
        document.getElementById('noise-compliance-result').textContent = `Noise Level Compliance: Exceeds Victorian regulations. Mitigation required.`;
    }

    // Economic Calculations (for Financial Analysis page)
    const annualRevenue = totalAEP * averageElectricityPrice / 1000; // Revenue in $ (converted from kWh to MWh)
    const initialCost = turbineCost * turbineCount; // Total cost for all turbines
    const paybackPeriod = initialCost / annualRevenue; // Years to pay back the investment

    document.getElementById('annual-revenue-result').textContent = `Annual Revenue: $${annualRevenue.toFixed(2)}`;
    document.getElementById('payback-period-result').textContent = `Payback Period: ${paybackPeriod.toFixed(1)} years`;

    if (paybackPeriod <= 20) {
        document.getElementById('profit-loss-result').textContent = `Economic Viability: The project is economically viable.`;
    } else {
        document.getElementById('profit-loss-result').textContent = `Economic Viability: The project is not economically viable within 20 years.`;
    }

    // CO₂ Emission Savings Calculation
    const co2Savings = totalAEP * co2EmissionFactor; // kg of CO₂ saved
    document.getElementById('co2-savings-result').textContent = `CO₂ Emission Savings: ${co2Savings.toFixed(2)} kg per year`;

    // Rayleigh Distribution and Plot Data
    const sigma = windSpeed / Math.sqrt(2 / Math.PI);
    const labels = [];
    const data = [];
    const maxSpeed = windSpeed * 3;

    for (let v = 0; v <= maxSpeed; v += 0.5) {
        labels.push(v.toFixed(1));
        const rayleighPDF = (v / (sigma * sigma)) * Math.exp(-Math.pow(v, 2) / (2 * sigma * sigma));
        const hoursAtThisSpeed = rayleighPDF * hoursPerYear;
        data.push(hoursAtThisSpeed.toFixed(2));
    }

    if (window.windSpeedChart instanceof Chart) {
        window.windSpeedChart.destroy();
    }

    const ctxHistogram = document.getElementById('wind-histogram').getContext('2d');
    window.windSpeedChart = new Chart(ctxHistogram, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Wind Speed vs Hours',
                data: data,
                borderColor: 'rgba(50, 205, 50, 1)',
                borderWidth: 2,
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
                    text: 'Wind Speed vs Hours in a Year'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Hours'
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
