// draw individual histogram for each cell in the matrix
function histogram(fileName, x, y, i, j) {

    d3.json(fileName, function (error, data) {
        var mysvg = d3.select("#gFront")
                .append("svg")
        //.attr("transform", "translate(" + x + "," + y + ")")
                .attr("x", x)
                .attr("y", y)
                .attr("width", matrixW)
                .attr("height", matrixH)
                .style("background-color", "black")
                 .on("click", function () {
                     //alert("Hey, don't click that!");
                     clickfun(fileName, i, j);
                 });

        process(data, mysvg, matrixW, matrixH);
       

    });
  
}