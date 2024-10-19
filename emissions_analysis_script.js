document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('calculate-emission-button').addEventListener('click', function() {
        // Input Values
        const annualEnergy = parseFloat(document.getElementById('annual-energy').value);
        const emissionFactor = parseFloat(document.getElementById('emission-factor').value);

        // CO₂ Emission Savings Calculation
        const co2Savings = annualEnergy * emissionFactor; // kg of CO₂ saved annually
        document.getElementById('co2-savings-result').textContent = `CO₂ Emission Savings: ${co2Savings.toFixed(2)} kg per year`;

        // CO₂ Savings Over Time Graph (20 years)
        const years = Array.from({ length: 20 }, (_, i) => i + 1);
        const cumulativeCO2Savings = years.map(year => co2Savings * year);

        // Plotting the CO₂ Savings Over Time
        const ctxCO2Savings = document.getElementById('co2-savings-chart').getContext('2d');
        if (window.co2SavingsChart instanceof Chart) {
            window.co2SavingsChart.destroy();
        }
        window.co2SavingsChart = new Chart(ctxCO2Savings, {
            type: 'line',
            data: {
                labels: years,
                datasets: [{
                    label: 'Cumulative CO₂ Savings Over Time',
                    data: cumulativeCO2Savings,
                    borderColor: 'rgba(30, 144, 255, 1)',
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
                        text: 'Cumulative CO₂ Emission Savings Over 20 Years'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Cumulative CO₂ Savings (kg)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Years'
                        }
                    }
                }
            }
        });
    });
});
