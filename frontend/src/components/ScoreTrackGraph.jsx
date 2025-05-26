import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";

function ScoreTrackGraph({chats}) {
    const [scores, setScores] = useState([]);
    const [dates, setDates] = useState([]);

    const style = new Intl.DateTimeFormat("en-US", {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
    })

    useEffect(() => {
        const getScores = () => {
            if (chats) {
                var scores = [];
                for (var key in chats) {
                    var avgScores = Object.values(chats[key].avgScores);
                    var score = avgScores.reduce((a, b) => a + b, 0) / avgScores.length;
                    scores.push(score);
                }
                return [{name: 'scores', data: scores}];
            }
        };

        const getDates = () => {
            if (chats) {
                var dates = [];
                for (var key in chats) {
                    dates.push(style.format(chats[key].date));
                }
                return dates;
            }
        }

        const newScores = getScores();
        const newDates = getDates();
        setScores(newScores);
        setDates(newDates);
    }, [])


    function getOptions() {
        return {
            xaxis: {
                categories: dates,
                type: 'datetime',
                labels: {
                    format: "dd MMM yyyy",
                },
                tickPlacement: "on",
            },
            yaxis: {
                labels: {
                    show: false,
                },
                axisBorder: {
                    show: true,
                },
                axisTicks: {
                    show: true,
                },
            },
            plotOptions: {
                bar: {
                    borderRadius: 10,
                    columnWidth: '50%',
                }
            },
            dataLabels: {
                enabled: false,
            },
            tooltip: {
                enabled: false,
            },
            noData: {
                text: "No data available."
            },
            grid: {
                xaxis: {
                    lines: {
                        show: true
                    }
                }
            }
        }
    }

    return (
        <ReactApexChart 
            options={getOptions()} 
            series={scores} 
            type="bar" 
            height={"100%"}
        />
    );
}

export default ScoreTrackGraph;