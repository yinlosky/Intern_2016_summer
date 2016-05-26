function scatterPlot(name1, name2, json, imageX, imageY, width, height, svg, xTicks, yTicks, needLable) {
    d3.json(json, function (error, data) {
        var dataset = data.payload.populationData.data;
        var dataset2 = data.payload.collectionData;
        var name = data.payload.populationData.columns; // ["pct_tree", "temp_p50", "median_ele", "prec_p50wm", "pct_crop"];
       // console.log(name.length);
        var fullName = [];
        for (var i = 0; i < name.length; i++) {
            fullName.push(data.payload.meta[name[i]].fullName);
        }
        var idx1 = 0;
        var idx2 = 0;
        for (var i = 0; i < name.length; i++) {
            if (name1 == name[i]) {
                idx1 = i;
            }
            if (name2 == name[i]) {
                idx2 = i;
            }
        }

        var dx = width,
            dy = height;

        //var xMin = d3.min(dataset[idx1]);
        //var xMax = d3.max(dataset[idx1]);
        //var yMin = d3.min(dataset[idx2]);
        //var yMax = d3.max(dataset[idx2]);
        var xMin = xTicks[idx1][0];
        var xMax = xTicks[idx1][xTicks[idx1].length - 1];
        var yMin = yTicks[idx2][0];
        var yMax = yTicks[idx2][yTicks[idx2].length - 1];
        var xScale = d3.scale.linear()
                             .domain([xMin, xMax])
                             .range([0, width - 1]);

        var yScale = d3.scale.linear()
                             .domain([yMin, yMax])
                             .range([height - 1, 0]);

        //        var xAxis = d3.svg.axis()
        //            .scale(xScale)
        //            .tickSize(0, 0, 0)
        //            .orient("top");

        //        var yAxis = d3.svg.axis()
        //            .scale(yScale)
        //            .tickSize(0, 0, 0)
        //            .orient("right");

        var xAxis = d3.svg.axis()
                      .scale(xScale)
                      .orient("bottom")
                     .tickValues(xTicks[idx1]);
        var yAxis = d3.svg.axis()
                      .scale(yScale)
                      .orient("left")
                      .tickValues(yTicks[idx2]);
        //var svg = d3.select("body").append("svg")
        //    .attr("width", width + 100)
        //    .attr("height", height)
        //    .attr("transform", "translate("+imageX+","+imageY+")");

        block = svg.append("g")
            .attr("transform", "translate(" + imageX + "," + imageY + ")");

        block.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', width)
            .attr('height', height)
            .style('fill', 'none')
            .style('stroke', 'black');

        if (needLable == 1) {
            block.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .call(removeZero);

            block.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .call(removeZero);
        }

        // grid lines
        //block.selectAll("line.horizontalGrid").data(yScale.ticks()).enter()
        block.selectAll("line.horizontalGrid").data(yTicks[idx2]).enter()
            .append("line")
              .attr(
              {
                  "class": "horizontalGrid",
                  "x1": 0,
                  "x2": width,
                  "y1": function (d) { return yScale(d); },
                  "y2": function (d) { return yScale(d); },
                  "fill": "none",
                  "shape-rendering": "crispEdges",
                  "stroke": "grey",
                  "opacity": 0.4,
                  "stroke-width": "1px"
              });

        // block.selectAll("line.verticalGrid").data(xScale.ticks()).enter()
        block.selectAll("line.verticalGrid").data(xTicks[idx1]).enter()
            .append("line")
              .attr(
              {
                  "class": "verticalGrid",
                  "x1": function (d) { return xScale(d); },
                  "x2": function (d) { return xScale(d); },
                  "y1": 0,
                  "y2": height,
                  "fill": "none",
                  "shape-rendering": "crispEdges",
                  "stroke": "grey",
                  "opacity": 0.4,
                  "stroke-width": "1px"
              });

        if (needLable == 1) {
            // The axis label
            block.append("text")
              .attr("class", "x label")
              .attr("text-anchor", "end")
              .attr("x", width)
              .attr("y", height + 30)
              .text(fullName[idx1]);

            block.append("text")
              .attr("class", "y label")
              .attr("text-anchor", "end")
              .attr("x", 0)
              .attr("y", -30)
              .attr("dy", ".5em")
              .attr("transform", "rotate(-90)")
              .text(fullName[idx2]);

            for (var i = 0; i < xTicks[idx1].length; i++) {
                var texAnchor = 'middle';
                var xOffset = 0;
                var yOffset = 0;
                //                block.append("text")
                //                  .attr("text-anchor", texAnchor)
                //                  .attr("x", xScale(xTicks[idx1][i]) + xOffset)
                //                  .attr("y", height)//yScale(yTicks[idx2][i]) + yOffset)
                //                  .attr("dy", ".75em")
                //			      .attr("font-size", 12)
                //                  .text(xTicks[idx1][i]);

                //                block.append("text")
                //                  .attr("text-anchor", texAnchor)
                //                  .attr("x", 0)
                //                  .attr("y", yScale(yTicks[idx2][i]) + yOffset)
                //                  .attr("dy", ".75em")
                //			      .attr("font-size", 12)
                //                  .text(yTicks[idx2][i]);
            }
            //            block.selectAll('text')
            //            .data(xTicks[idx1])
            //            .enter()
            //            .append('text')
            //            .attr("font-size", 14)
            //            .attr('x', function (d, i) {
            //                return xScale(d);
            //            })
            //            .attr('y', function (d, i) {
            //                return yScale(d);
            //            })
            //            .text(function (d, i) {
            //                return d;
            //            });
        }

        block.selectAll("circle")
            .data(dataset2)
            .enter()
            .append("circle")
            .attr("stroke", "white")
            .attr("fill", "black")
            .attr("cx", function (d) {
                //return xScale(idxToDataX(d, idx1));
                return xScale(d[name[idx1]]);
            })
            .attr("cy", function (d) {
                //return yScale(idxToDataY(d, idx2));
                return yScale(d[name[idx2]]);
            })
            .attr("r", function (d) {
                return width / 200;
            })
            .style("stroke-width", function (d) {
                if (needLable) {
                    return "1px";
                }
                else return '0px';
            })
            .on("click", function (d, i) {
                clickFunction('Information on the site:\n' +
                '\nCase ID = ' + d.caseid +
                '\nSitename = ' + d.sitename +
                '\n' + fullName[idx1] + ' = ' + d[name[idx1]] +
                "\n" + fullName[idx2] + ' = ' + d[name[idx2]])
            })
            .append("svg:title")
            .text(function (d, i) {
                return 'Case ID = ' + d.caseid +
                '\nSitename = ' + d.sitename +
                '\n' + fullName[idx1] + ' = ' + d[name[idx1]] +
                "\n" + fullName[idx2] + ' = ' + d[name[idx2]];
            });

        function removeZero(axis) {
            axis.selectAll("g").filter(function (d) { return !d; }).remove();
        }


        function clickFunction(MsgAlert) {
            alert(MsgAlert);

        }
    });
}
