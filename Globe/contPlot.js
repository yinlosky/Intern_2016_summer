function contPlot(name1, name2, json, imageX, imageY, width, height, group, colorSequence) {
    var padding = 0;

    d3.json(json, function (error, data) {
        var dataset = data.payload.populationData.data;
        var dataset2 = data.payload.collectionData;
        var name = data.payload.populationData.columns; // ["pct_tree", "temp_p50", "median_ele", "prec_p50wm", "pct_crop"];

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
        console.log(name1 + ',' + name2);
        var heatmap = new Array();
        var numSample = dataset[0].length;

        var xMin = d3.min(dataset[idx1]);
        var xMax = d3.max(dataset[idx1]);
        var yMin = d3.min(dataset[idx2]);
        var yMax = d3.max(dataset[idx2]);

        console.log(xMin + ',' + xMax);
        console.log(yMin + ',' + yMax);
        console.log('samples = ' + numSample);
        var xScale = d3.scale.linear()
                             .domain([xMin, xMax])
                             .range([0, width - 1]);

        var yScale = d3.scale.linear()
                             .domain([yMin, yMax])
                             .range([height - 1, 0]);

        for (var yp = 0; yp < height; yp++) {
            //heatmap.push([]);
            heatmap[yp] = new Array();
            for (var xp = 0; xp < width; xp++) {
                heatmap[yp].push(0);
            }
        }

        var kerHeight = 10; // height
        var kerSigX = width / 50;     // pixels
        var kerSigY = height / 50;     // pixels
        var kerVarX = kerSigX * kerSigX;     // pixels
        var kerVarY = kerSigY * kerSigY;     // pixels
        var kerLengthX = kerSigX * 3; // pixels
        var kerLengthY = kerSigY * 3; // pixels

        for (var is = 0; is < numSample; is++) {
            var tx = xScale(dataset[idx1][is]);
            var ty = yScale(dataset[idx2][is]);

            // kernal function
            //console.log(kerLength);
            for (var ky = Math.max(0, ty - kerLengthY); ky <= Math.min(ty + kerLengthY, height - 1); ky++) {
                for (var kx = Math.max(0, tx - kerLengthX); kx <= Math.min(tx + kerLengthX, width - 1); kx++) {
                    var dkx = kx - tx;
                    var dky = ky - ty;
                    //var distSqd = dkx * dkx + dky * dky;
                    // use Gaussian kernel
                    var kz = Math.exp(-((dkx * dkx) / (2 * kerVarX) + (dky * dky) / (2 * kerVarY))) * kerHeight;
                    heatmap[Math.round(ky)][Math.round(kx)] += kz;
                }
            }

        }

        var dx = heatmap[1].length,
            dy = heatmap.length;

        // Fix the aspect ratio.
        // var ka = dy / dx, kb = height / width;
        // if (ka < kb) height = width * ka;
        // else width = height / ka;

        //var maxDensity = d3.max(d3.max(heatmap));
        var maxDensity = 0;
        for (var i = 0; i < height; i++) {
            for (var j = 0; j < width; j++) {
                if (heatmap[i][j] > maxDensity) {
                    maxDensity = heatmap[i][j];
                }
            }
        }
        console.log('maxDensity = ' + maxDensity);
        var densityStep = maxDensity / colorSequence.length;
        //var densitySteps = [densityStep * 0, densityStep * 1, densityStep * 2, densityStep * 3, densityStep * 4, densityStep * 5];
        var densitySteps = [];
        for (var i = 0; i < colorSequence.length; i++) {
            densitySteps.push(densityStep * i);
        }

        var color = d3.scale.linear()
            .domain(densitySteps)
        //.range(["#0a0", "#6c0", "#ee0", "#eb4", "#eb9", "#fff"]);
        //.range(["#ccf", "#ddf", "#eef", "#fdd", "#fbb", "#f99"]);
            .range(colorSequence);
        //.range(["#eee8dc", "#ddf", "#eef", "#fdd", "#fbb", "#f99"]);
        //.range(["#000", "#333", "#666", "#999", "#bbb", "#eee"]);

        //d3.select("body")
        var theCanvas =
            group
            .append("canvas")
            .attr("width", dx)
            .attr("height", dy)
        //.attr("z-index", -1)
            .style("width", width + "px")
            .style("height", height + "px")
            .style("position", "absolute")
            .style("left", imageX + "px")
            .style("top", imageY + "px")
            .call(drawImage);


        theCanvas.node().addEventListener('click', on_canvas_click, false);
        console.log(theCanvas.node());
        var context = theCanvas.node().getContext("2d");

        // Compute the pixel colors; scaled by CSS.
        function drawImage(canvas) {
            var context = canvas.node().getContext("2d");
            image = context.createImageData(dx, dy);

            for (var y = 0, p = -1; y < dy; ++y) {
                for (var x = 0; x < dx; ++x) {
                    var colorIndex = heatmap[y][x];
                    //// discrete versiondensityStep
                    //colorIndex = Math.floor(colorIndex / densityStep) * densityStep;
                    //var c = d3.rgb(color(colorIndex));
                    var c = d3.rgb(colorSequence[Math.min(Math.floor(colorIndex / densityStep), colorSequence.length - 1)]);
                    image.data[++p] = c.r;
                    image.data[++p] = c.g;
                    image.data[++p] = c.b;
                    image.data[++p] = 255;
                }
            }

            context.putImageData(image, 0, 0);
        }

        function on_canvas_click(ev) {

            alert(imageX + " You shall never see this.\n Contact your service provide/ " + imageY);
        }
    });


}

function drawLegend(imageX, imageY, width, height, colorSequence, svg) {
    var cellHeight = 25;
    var cellDist = 5;
    svg.selectAll("rect")
    .data(colorSequence)
    .enter()
    .append("rect")
    .attr("x", imageX)
    .attr("y", function (d, i) {
        return imageY - i * (cellHeight+cellDist)
    })
    .attr("width", width)
    .attr("height", cellHeight)
    .style("fill", function (d, i) {
        return d;
        console("d="+d);
    })
    .style("stroke", "gray")
    .style("stroke-width", "1px");

    var steps = 100/(colorSequence.length)
    svg.selectAll("text")
    .data(colorSequence)
    .enter()
    .append("text")
    .attr("x", imageX - 25)
    .attr("y", function (d, i) {
        return imageY - i * (cellHeight + cellDist)
    })
    .attr("dy", "1.3em")
    .style("text-anchor", "end")
    .attr("font-size", 14)
    .text(function (d, i) {
        if (i == colorSequence.length) {
            return Math.floor(i * steps*10)/10 + '% ~ 100%';
        }
        else return Math.floor(i * steps * 10) / 10 + '% ~ ' + Math.floor((i + 1) * steps * 10) / 10 + '%';
        //return 'legend';
    });

    svg.append('text')
    .attr('x', imageX - 55)
    .attr('y', imageY - colorSequence.length * (cellHeight + cellDist))
    .attr("font-size", 18)
    .style("text-anchor", "middle")
    .text('Relative Prob Density');

}

