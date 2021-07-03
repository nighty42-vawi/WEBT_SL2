class PopulationDensity {
  static createChart(data) {


    let svg = d3.select("#population_density"),
      width = svg.attr("width"),
      height = svg.attr("height"),
      radius = Math.min(width, height) / 2,
      g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    let color = d3.scaleOrdinal(data.map((d) => d.color));

    // Generate the pie
    let pie = d3.pie();

    // Generate the arcs
    let arc = d3.arc().innerRadius(0).outerRadius(radius);

    //Generate groups
    let arcs = g
      .selectAll("arc")
      .data(pie(data.map((d) => d.value)))
      .enter()
      .append("g")
      .attr("class", "arc")
      .on('mouseover', function() {
        var current = this
        var others = svg.selectAll(".arc").filter(function(el) {
          return this != current
        });
        others.selectAll("path").style('opacity', 0.3);
      })
      .on('mouseout', function() {
        var current = this;
        d3.select(this)
          .style('opacity', 1);
        var others = svg.selectAll(".arc").filter(function(el) {
          return this != current
        });
        others.selectAll("path").style('opacity', 1);
      });
    arcs
      .append("path")
      .attr("fill", (d, i) => color(i))
      .attr("d", arc);
    arcs
       .append("svg:text")
       .attr( "transform",function(d) {
       var c = arc.centroid(d);
       return "translate("+ arc.centroid(d) + ")"; })
      .attr("text-anchor","middle")
      .style("font-size","18px")
      .style("text-decoration","bold")
      .text(function(d,i) { return data[i].label;});
}


  static showData() {
    let dataset =  [];
    let color = ["#e2bed3", "#22c1c3", "#fcb045", "#e6d358", "#7ee3b1", "#e6fc46", "#fc6446",  "#8c9ade", "#fc466b" ]
    Countries.getData().then( (json) => {
      // recursive function to load country data completely before creating the pie chart
      function getCountryData(json) {
        if (json.length == 0) { // termination condition: no country left to load, so draw chart
          PopulationDensity.createChart (dataset);
        } else { // while countries left
          let item = json.pop(); // get next country and remove it from array
          // call API and call getCountryData recursively in promise
          fetch(`https://l1n.de/tl2/public/country/${item.code}/population_density`).then((response) => response.json())
          .then((data) => {
            dataset.push({ "value": data, "color": color.pop(), "label":item.country});
            getCountryData (json);
          })
        }
      }
      getCountryData (json);
    })
  }
}
