document.addEventListener('DOMContentLoaded', function() {
    let paybackChart;
    const calculateButton = document.getElementById('calculate-button');
    if (calculateButton) {
        calculateButton.addEventListener('click', function() {
            // Input Values
            const initialCost = parseFloat(document.getElementById('initial-cost').value);
            const maintenanceCost = parseFloat(document.getElementById('maintenance-cost').value);
            const electricityPrice = parseFloat(document.getElementById('electricity-price').value);
            const annualEnergy = parseFloat(document.getElementById('annual-energy').value);

            // Calculations
            const annualRevenue = annualEnergy * electricityPrice;
            const paybackPeriod = initialCost / (annualRevenue - maintenanceCost);
            const netProfit = (annualRevenue - maintenanceCost) * paybackPeriod - initialCost;
            const householdsPowered = annualEnergy / 5000; // Assuming average household consumption of 5000 kWh/year

            // Display Results
            document.getElementById('annual-revenue-result').textContent = `Annual Revenue: AUD ${annualRevenue.toFixed(2)}`;
            document.getElementById('payback-period-result').textContent = `Payback Period: ${paybackPeriod.toFixed(2)} years`;
            document.getElementById('net-profit-result').textContent = `Net Profit after Payback: AUD ${netProfit.toFixed(2)}`;
            document.getElementById('households-powered-result').textContent = `Number of Households Powered: ${householdsPowered.toFixed(0)}`;

            // Destroy existing chart if it exists
            if (paybackChart) {
                paybackChart.destroy();
            }

            // Generate Payback Period Chart
            const ctx = document.getElementById('payback-chart').getContext('2d');
            paybackChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: Array.from({ length: Math.ceil(paybackPeriod) }, (_, i) => i + 1),
                    datasets: [{
                        label: 'Cumulative Net Profit Over Time',
                        data: Array.from({ length: Math.ceil(paybackPeriod) }, (_, i) => {
                            return ((annualRevenue - maintenanceCost) * (i + 1)) - initialCost;
                        }),
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 2,
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        },
                        title: {
                            display: true,
                            text: 'Payback Period Over Time'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Net Profit (AUD)'
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
    }
});
