// Declaring variable
var plot_area = d3.select("#plot")

// Create a Line plot with Ploty using data from app.py for entertainment category
function buildplot_entertainment() {
    plot_area.html("")
    d3.json("/api/stocks").then(function (data) {
        console.log(data)
        var ticker = data.stocks_list[0].Ticker;
        var adj_Close = data.stocks_list[0].Adj_Close;
        var date = data.stocks_list[0].Date
        var ticker1 = data.stocks_list[1].Ticker;
        var adj_Close1 = data.stocks_list[1].Adj_Close;
        var date1 = data.stocks_list[1].Date
        var ticker2 = data.stocks_list[2].Ticker;
        var adj_Close2 = data.stocks_list[2].Adj_Close;
        var date2 = data.stocks_list[2].Date;

        var trace = {
            type: "scatter",
            mode: "line",
            name: ticker,
            x: date,
            y: adj_Close,
            line: {
                color: '00d775'
            }
        };

        var trace1 = {
            type: "scatter",
            mode: "line",
            name: ticker1,
            x: date1,
            y: adj_Close1,
            line: {
                color: "0077df"
            }
        };
        var trace2 = {
            type: "scatter",
            mode: "line",
            name: ticker2,
            x: date2,
            y: adj_Close2,
            line: {
                color: "7f6dcc"
            }
        };

        var tracedata = [trace, trace1, trace2];

        var layout = {
            title: `Entertainment Stock`,
            paper_bgcolor: '002e50',
            plot_bgcolor: '002e50',
            yaxis: {
                title: 'Stock Price (in CAD $)'
            }
        };
        Plotly.newPlot("plot", tracedata, layout)
    });
};