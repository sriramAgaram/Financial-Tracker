
import { useState, useEffect } from 'react';
import { Chart } from 'primereact/chart';


interface ChartProps {
    chartData: number[]; 
    labels: string[];  
    overExpenseChartData: number[]; 
    overExpenseLabels: string[];
}

export default function Barchart({ chartData, labels , overExpenseChartData}: ChartProps) {
    const [chartDataState, setChartDataState] = useState({});
    const [chartOptions, setChartOptions] = useState({});

    useEffect(() => {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
        const data = {
            labels: labels,
            datasets: [
                {
                    type: 'bar',
                    label: 'Expense',
                    backgroundColor: documentStyle.getPropertyValue('--orange-500'),
                    data: chartData,
                    borderColor: 'white',
                    borderWidth: 2
                },
                {
                    type: 'line',
                    label: 'Over Limit',
                    borderColor: documentStyle.getPropertyValue('--blue-500'),
                    pointBackgroundColor: documentStyle.getPropertyValue('--blue-500'),
                    pointBorderColor: documentStyle.getPropertyValue('--blue-500'),
                    pointRadius: 5,
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    data: overExpenseChartData
                }
            ]
        };
        const options = {
            maintainAspectRatio: false,
            aspectRatio: 0.6,
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder
                    }
                }
            }
        };

        setChartDataState(data);
        setChartOptions(options);
    }, [chartData, labels]);

    return (
        <div className="card w-full h-[300px] md:h-[500px] p-4 bg-white rounded-lg shadow-md">
            <Chart type="line" data={chartDataState} options={chartOptions} className="w-full h-full" />
        </div>
    )
}
        