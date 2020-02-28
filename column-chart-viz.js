function columnChartViz(option) {
  const operationMeasures = ["sum", "avg", "count"];
  const paletteFills = ["full", "single", "pattern"];
  const positionLegends = ["top", "bottom"];
  const sortOrders = ["atoz", "ztoa"];
  // Verify options
  if (!operationMeasures.includes(option.operationMeasure)) {
    throw Error("Calc can only be sum, avg, or count.");
  }
  if (!paletteFills.includes(option.paletteFill)) {
    throw Error("Fill can only be full, single, or pattern.");
  }
  if (!positionLegends.includes(option.positionLegend)) {
    throw Error("Legend can only be top or bottom.");
  }
  if (!sortOrders.includes(option.sort)) {
    throw Error("Sort can only be atoz or ztoa.");
  }

  // Colors
  const colors = {
    full: [
      "#a4517b",
      "#d75a3b",
      "#47a9b2",
      "#fffad9",
      "#4cb8d5",
      "#58f3af",
      "#feb8cf",
      "#007693",
      "#ea9865",
      "#a4517b",
      "#d75a3b",
      "#47a9b2",
      "#fffad9",
      "#4cb8d5",
      "#58f3af",
      "#feb8cf",
      "#007693",
      "#ea9865"
    ],
    single: [
      "#e5f4f7",
      "#b0dfe8",
      "#7bc9d8",
      "#46b4c9",
      "#119eb9",
      "#0d8ca7",
      "#097996",
      "#046784",
      "#005472"
    ],
    pattern: [
      "pattern-fill-0",
      "pattern-fill-1",
      "pattern-fill-2",
      "pattern-fill-3",
      "pattern-fill-4",
      "pattern-fill-5",
      "pattern-fill-6"
    ]
  };

  const patternImages = {
    "pattern-fill-0":
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'%3E%3Crect fill='none' stroke='%23119eb9' stroke-width='3' width='100%25' height='100%25' %3E%3C/rect%3E%3C/svg%3E",
    "pattern-fill-1":
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'%3E%3Crect fill='none' stroke='%23119eb9' stroke-width='2' width='100%25' height='100%25' transform='rotate(45)' %3E%3C/rect%3E%3C/svg%3E",
    "pattern-fill-2":
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'%3E%3Cpath stroke='%23119eb9' stroke-width='2' fill='none' d='M0,0L5,5L10,0L5,5L0,0Z' %3E%3C/path%3E%3C/svg%3E",
    "pattern-fill-3":
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'%3E%3Cpath stroke='%23119eb9' stroke-width='2' fill='none' d='M0,0L10,10' %3E%3C/path%3E%3Cpath stroke='%23119eb9' stroke-width='2' fill='none' d='M10,0L0,10' %3E%3C/path%3E%3C/svg%3E",
    "pattern-fill-4":
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'%3E%3Cpath fill='%23119eb9' d='M0,0L10,10L10,0L0,10Z'%3E%3C/path%3E%3C/svg%3E",
    "pattern-fill-5":
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'%3E%3Ccircle fill='%23119eb9' cx='-5' cy='0' r='2'%3E%3C/circle%3E%3Ccircle fill='%23119eb9' cx='5' cy='0' r='2'%3E%3C/circle%3E%3Ccircle fill='%23119eb9' cx='0' cy='-5' r='2'%3E%3C/circle%3E%3Ccircle fill='%23119eb9' cx='0' cy='5' r='2'%3E%3C/circle%3E%3C/svg%3E",
    "pattern-fill-6":
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='5' height='5'%3E%3Cpath fill='%23119eb9' d='M-10,0L0,10L10,0L0,-10z'%3E%3C/path%3E%3Ccircle fill='white' cx='-5' cy='0' r='2'%3E%3C/circle%3E%3Ccircle fill='white' cx='5' cy='0' r='2'%3E%3C/circle%3E%3Ccircle fill='white' cx='0' cy='-5' r='2'%3E%3C/circle%3E%3Ccircle fill='white' cx='0' cy='5' r='2'%3E%3C/circle%3E%3C/svg%3E"
  };

  var margin = { top: 50, right: 75, bottom: 50, left: 50 };
  bar_width = 10;

  // Extract options
  const el = option.el;
  const columnBars = option.columnBars;
  const isGrouped = option.hasOwnProperty("columnGrouping");
  const columnGrouping = option.columnGrouping;
  const columnMeasure = option.columnMeasure;
  const operationMeasure = option.operationMeasure || "avg";
  const paletteFill = option.paletteFill || "full";
  const positionLegend = option.positionLegend || "top";
  const sort = option.sort || "atoz";
  const labelXAxis = option.labelXAxis || "X Axis";
  const labelYAxis = option.labelYAxis || "Y Axis";

  // Process data
  option.data.forEach(d => {
    d[columnMeasure] = parseFloat(d[columnMeasure]);
  });

  const allValues = [];
  if (isGrouped) {
    var data = d3
      .nest()
      .key(function(d) {
        return d[columnGrouping];
      })
      .sortKeys(sortBars(sort))
      .key(function(d) {
        return d[columnBars];
      })
      .sortKeys(sortBars(sort))
      .rollup(function(v) {
        const value = aggregate(v, operationMeasure, columnMeasure);
        allValues.push(value);
        return value;
      })
      .entries(option.data);
  } else {
    var data = d3
      .nest()
      .key(function(d) {
        return d[columnBars];
      })
      .sortKeys(sortBars(sort))
      .rollup(function(v) {
        const value = aggregate(v, operationMeasure, columnMeasure);
        allValues.push(value);
        return value;
      })
      .entries(option.data);

    data = [{ key: "", values: data }];
  }

  const groupKeys = data.map(function(d) {
    return d.key;
  });

  const singleKeys = data[0].values.map(function(d) {
    return d.key;
  });

  console.log(data);
  const maxValue = d3.max(allValues);

  console.log(maxValue);
  const n = allValues.length;

  bar_width = 20;
  singleSpacing = 10;
  groupSpacing = 20;

  const svg_width =
    (singleKeys.length * (bar_width + singleSpacing) + groupSpacing) *
      groupKeys.length +
    margin.left +
    groupSpacing;
  const svg_height = 300;
  var margin = { top: 10, right: 50, bottom: 50, left: 50 };

  const colorScale = d3
    .scaleOrdinal()
    .domain(singleKeys)
    .range(colors[paletteFill]);

  // Render chart
  const container = d3.select(el).classed("column-chart-viz", true);

  let legendContainer;
  if (positionLegend === "top") {
    legendContainer = container.insert("div", ".chart-container");
  }

  var chartContainer = container
    .append("svg")
    .attr("width", svg_width)
    .attr("height", svg_height)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  if (paletteFill === "pattern") {
    colors.pattern.forEach(function(v) {
      chartContainer
        .append("defs")
        .append("pattern")
        .attr("id", v)
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", 10)
        .attr("height", 10)
        .append("image")
        .attr("xlink:href", patternImages[v])
        .attr("width", 10)
        .attr("height", 10);
    });
  }

  if (positionLegend === "bottom") {
    legendContainer = container.append("div");
  }

  x0 = d3
    .scaleBand()
    .domain(groupKeys)
    .rangeRound([groupSpacing, svg_width - margin.right]);

  console.log(x0.bandwidth());

  x1 = d3
    .scaleBand()
    .domain(singleKeys)
    .rangeRound([0, x0.bandwidth() - groupSpacing]);

  y = d3
    .scaleLinear()
    .domain([0, maxValue])
    .nice()
    .rangeRound([svg_height - margin.bottom, margin.top]);

  render(chartContainer, data);

  function render(container, data) {
    container
      .append("g")
      .selectAll("g")
      .data(data)
      .join("g")
      .attr("transform", d => `translate(${x0(d.key)},0)`)
      .attr("class", "test")
      .selectAll("rect")
      .data(function(d) {
        d.values.forEach(function(v) {
          v.parentKey = d.key;
        });
        return d.values;
      })
      .join("rect")
      /*.each(function(d) {
        d3.select(this.parentNode)
          .append("text")
          .datum(d)
          .attr("class", "value-label")
          .attr("x", x1(d.key) + bar_width / 2)
          .attr("y", function(d) {
            return y(0) - 5;
          })
          .text(formatNumber(d.value))
          .attr("opacity", 0);
      })*/
      .attr("x", d => x1(d.key))
      .attr("y", d => y(0))
      .attr("width", bar_width)
      .attr("height", d => 0)
      .attr("fill", function(d) {
        if (paletteFill === "pattern") {
          return "url(#" + colorScale(d.key) + ")";
        } else {
          return colorScale(d.key);
        }
      })
      .attr("class", function() {
        if (paletteFill === "pattern") {
          return "pattern-fill";
        }
      })
      .on("mouseover", function(d) {
        showTooltip(d, data);
      })
      .on("mousemove", moveTooltip)
      .on("mouseout", hideTooltip);

    container
      .append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y));

    container
      .append("g")
      .attr("class", "x-axis-0")
      .call(d3.axisBottom(x0))
      .attr(
        "transform",
        "translate(" + -20 + "," + (svg_height - margin.bottom) + ")"
      );

    container
      .append("text")
      .attr(
        "transform",
        "translate(" +
          (svg_width - margin.left - margin.right) / 2 +
          " ," +
          (svg_height - margin.top) +
          ")"
      )
      .attr("class", "x-axis axis-label")
      .text(labelXAxis);

    container
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (svg_height - margin.bottom - margin.top) / 2)
      .attr("dy", "1em")
      .attr("class", "y-axis axis-label")
      .text(labelYAxis);
  }

  init();

  function init() {
    chartContainer
      .selectAll("rect")
      .transition()
      .duration(1000)
      .delay(500)
      .attr("height", function(d) {
        return y(0) - y(d.value);
      })
      .attr("y", function(d) {
        return y(d.value);
      });

    chartContainer
      .selectAll(".value-label")
      .transition()
      .duration(1000)
      .delay(500)
      .attr("y", function(d) {
        return y(d.value) - 5;
      })
      .attr("opacity", 1);
  }

  // Tooltip
  const tooltip = container.append("div").attr("class", "chart-tooltip");
  tooltip.append("div").attr("class", "tooltip-outer-group-label");
  tooltip.append("div").attr("class", "tooltip-inner-group-label");
  tooltip.append("div").attr("class", "tooltip-inner-group-value");

  function moveTooltip() {
    let padding = 10;
    const { width, height } = tooltip.datum();
    let x = d3.event.clientX;
    if (x + padding + width > window.innerWidth) {
      x = x - padding - width;
    } else {
      x = x + padding;
    }
    let y = d3.event.clientY;
    if (y + padding + height > window.innerHeight) {
      y = y - padding - height;
    } else {
      y = y + padding;
    }
    tooltip.style("transform", `translate(${x}px,${y}px)`);
  }

  function showTooltip(d) {
    tooltip.select(".tooltip-outer-group-label").text(d.parentKey);
    tooltip.select(".tooltip-inner-group-label").text(d.key);
    tooltip.select(".tooltip-inner-group-value").text(formatNumber(d.value));
    tooltip
      .style(
        "border-color",
        paletteFill === "pattern" ? "#119eb9" : colorScale(d[0])
      )
      .transition()
      .style("opacity", 1);
    const { width, height } = tooltip.node().getBoundingClientRect();
    tooltip.datum({ width, height });
  }

  function hideTooltip() {
    tooltip.transition().style("opacity", 0);
  }

  // Render legend
  legendContainer
    .attr("class", "legend-container")
    .selectAll(".legend-item")
    .data(colorScale.domain())
    .join("div")
    .attr("class", "legend-item")
    .call(item =>
      item
        .append("div")
        .attr("class", d =>
          paletteFill === "pattern"
            ? `${colorScale(d)} pattern-fill legend-swatch`
            : "legend-swatch"
        )
        .style("background", d =>
          paletteFill === "pattern" ? null : colorScale(d)
        )
    )
    .call(item =>
      item
        .append("div")
        .attr("class", "legend-label")
        .text(d => d)
    );

  console.log(isGrouped);

  // Utilities
  function aggregate(v, op, col) {
    switch (op) {
      case "sum":
        return d3.sum(v, v => v[col]);
      case "avg":
        return d3.mean(v, v => v[col]);
      case "count":
        return v.length;
      default:
        break;
    }
  }

  function sortBars(sortOrder) {
    switch (sortOrder) {
      case "atoz":
        return d3.ascending;
      case "ztoa":
        return d3.descending;
      default:
        break;
    }
  }

  // Format number
  function formatNumber(d) {
    if (d < 1e3) {
      return d3.format(".3s")(d);
    } else if (d < 1e5) {
      return `${(d / 1e3).toFixed(1)}K`;
    } else if (d < 1e6) {
      return `${(d / 1e3).toFixed(0)}K`;
    } else if (d < 1e8) {
      return `${(d / 1e6).toFixed(1)}M`;
    } else if (d < 1e9) {
      return `${(d / 1e6).toFixed(0)}M`;
    } else if (d < 1e11) {
      return `${(d / 1e9).toFixed(1)}B`;
    } else if (d < 1e12) {
      return `${(d / 1e9).toFixed(0)}B`;
    } else if (d < 1e14) {
      return `${(d / 1e12).toFixed(1)}T`;
    } else {
      return `${(d / 1e12).toFixed(1)}T`;
    }
  }
}
