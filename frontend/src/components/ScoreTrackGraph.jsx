import ReactApexChart      from "react-apexcharts";
import { useChatSessions } from "@/hooks/queries/useChatSessions";
import { dateFormatShort } from "@/utils/styling/numFormatting";
import { biomarkerKeys, biomarkerColors } from "@/utils/styling/options";

export default function ScoreTrackGraph() {
    const { data, isLoading } = useChatSessions();
    if (isLoading   ) return <p>Loading ...</p>;
    if (!data.length) return <p>No sessions yet.</p>;

    // Prepare chart data
    const labels = data.map((s) => dateFormatShort.format(new Date(s.date)));
    const series = biomarkerKeys.map((key) => ({
        name: key,
        data: data.map((s) => {
            if (s.average_scores) {
                const avg = s.average_scores;
                const matchedKey = Object.keys(avg).find(k => k.toLowerCase() === key.toLowerCase());
                return matchedKey ? Number((avg[matchedKey] ?? 0).toFixed(2)) : 0;
            }
            return 0;
        }),
    }));

    // Apex options
    const options = {
        chart: {
            id: "score-track",
            stacked: true,
            toolbar: { show: false },
            zoom: { enabled: false }, 
            pan:  { enabled: false },
            foreColor: "#6b7280",
        },
        xaxis:       { categories: labels, labels: { format: "MMM dd" }, tickPlacement: "on" }, // type: "datetime",
        yaxis:       { title: { text: "Avg Score" }, labels: { show: false }, },
        plotOptions: { bar: { columnWidth: "40%", borderRadius: 6 } },
        grid:        { strokeDashArray: 4 },
        dataLabels:  { enabled: false, },
        noData:      { text: "No sessions found." },

        colors: biomarkerKeys.map((k) => biomarkerColors[k]),
        tooltip: {
            enabled: true,
            shared: true,
            followCursor: false,
            intersect: false,
            inverseOrder: false,
            hideEmptySeries: true,
            fillSeriesColor: false,
            style: { fontSize: '12px', fontFamily: undefined },
            onDatasetHover: { highlightDataSeries: true, },
            x: { show: true, format: 'MMM dd', },
            marker: { show:    true, },
        },
        
    };

    // Return UI component
    return (
        <ReactApexChart
            type="bar"
            height="100%"
            options={options}
            series={series}
        />
    );
}
