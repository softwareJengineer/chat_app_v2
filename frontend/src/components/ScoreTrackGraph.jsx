import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";

function ScoreTrackGraph({chats}) {

    function getScores(chatData) {
        if (chatData) {
            var scores = [];
            for (var i = 0; i < chatData.length; i++) {
                var avgScores = Object.values(chatData[i].avgScores);
                var score = avgScores.reduce((a, b) => a + b, 0) / avgScores.length;
                scores.push(score);
            }
            return [{name: 'scores', data: scores}];
        }
    }

    function getDates(chatData) {
        if (chatData) {
            var dates = [];
            for (var i = 0; i < chatData.length; i++) {
                dates.push(chatData[i].date);
            }
            return dates;
        }
    }

    function getOptions(chatData) {
        const dates = getDates(chatData);
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
            options={getOptions(chats)} 
            series={getScores(chats)} 
            type="bar" 
            height={"100%"}
        />
    );
}

export default ScoreTrackGraph;