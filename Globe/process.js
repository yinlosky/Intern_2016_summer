function process(data,mysvg,w,h){
	
	var rightMargin = 5;  // define the margin for the cell in histogram
	var numofglobal = data.payload.histograms.population.totalCount; // total count of global data
    var numofcollection = data.payload.histograms.collection.totalCount;//total count of collection data
    var probability = numofcollection/numofglobal;                      // ratio of the recommended data
    var popCountMx = data.payload.histograms.population.countMx;        // recommended global data
    var maxRecommendationNum = probability * findMax(popCountMx);       // max recommended number of sites = ratio * maxnumber of max population data
   // console.log(maxRecommendationNum);

    var xBins = data.payload.histograms.population.dims[0].bins // store the x(first dimension) bins
    var yBins = data.payload.histograms.population.dims[1].bins // store the y(second dimension) bins

    var xRange=data.payload.histograms.population.dims[0].range // store the range of first dimension
    var yRange=data.payload.histograms.population.dims[1].range // store the range of the second dimension

	var xWidth=Math.abs(data.payload.histograms.population.dims[0].range.right-data.payload.histograms.population.dims[0].range.left);
	var yWidth=Math.abs(data.payload.histograms.population.dims[1].range.right-data.payload.histograms.population.dims[1].range.left);
    
	
    var xTickValues=eliminateDuplicates(transferBinsToArraysOfValues(xBins)); // this is the tick value for x axis
    var yTickValues=eliminateDuplicates(transferBinsToArraysOfValues(yBins)); // this is the tick value for y axis
	
    var xScale = d3.scale.linear()
                         .domain([xRange.left,xRange.right])
                         .range([rightMargin, matrixW-rightMargin]);
    var yScale = d3.scale.linear()
                         .domain([yRange.left,yRange.right])
                         .range([matrixH-rightMargin, rightMargin]);

    
    var collectionCountMx = data.payload.histograms.collection.countMx;
	
	
	var grayScale = d3.scale.linear()
	                        .domain([0,maxRecommendationNum])
	                        .range(["#E2E8E5", "#626664"]);

    var xTicksSorted=xTickValues.sort(function(a,b){return a - b});
    var yTicksSorted=yTickValues.sort(function(a,b){return a - b});
   // console.log(yTicksSorted[1],yTicksSorted[0]);
    
    var xAxis = d3.svg.axis()
                      .scale(xScale)
                      .orient("top")
                     .tickValues(xTicksSorted)
					 .tickFormat("");
    var yAxis = d3.svg.axis()
                      .scale(yScale)
                      .orient("right")
                      .tickValues(yTicksSorted)
					 .tickFormat("");
					 
	
    //create X axis
    mysvg.append("g")
	   .attr("class","axis")
	   .attr("transform","translate(0," + ( matrixH - rightMargin) + ")")
	   .call(xAxis);
    // create Y Axis
    mysvg.append("g")
       .attr("class", "axis")
       .attr("transform","translate(" + (rightMargin+rightMargin) + ",0)")
       .call(yAxis);
	
	// add x label
	//var xLabelName = data.payload.histograms.population.dims[0].column.dbName;
	//mysvg.append("text")
     //  .attr("class", "x label")
     //  .attr("text-anchor", "end")
      // .attr("x", matrixW-cellPadding-30)
      // .attr("y", matrixH-cellPadding+10)
	  // .attr("font-size",10)
      // .text(xLabelName);	
	// add y label
	//var yLabelName = data.payload.histograms.population.dims[1].column.dbName;
	//mysvg.append("text")
   //    .attr("class", "y label")
  ////     .attr("text-anchor", "end")
	//   .attr("x",-cellPadding-20)
   //    .attr("y", cellPadding-10)
   //    .attr("dy", ".5em")
	//   .attr("font-size",10)
  //     .attr("transform", "rotate(-90)")
   //    .text(yLabelName);

    var i;
    var j;
    var colorScale = d3.scale.ordinal()
                             .domain(["-10",
                                      "-9","-8","-7","-6","-5",
                                      "-4","-3","-2",
                                      "-1",
                                      "0",
                                      "1",
                                      "2","3","4",
                                      "5","6","7","8","9",
                                      "10"])
                             .range(["#af0700", 
                                     "#de4c2a","#de4c2a","#de4c2a","#de4c2a","#de4c2a",
                                     "#f88e4f","#f88e4f","#f88e4f",
                                     "#fbcd80",
                                     "#176830",
                                     "#a5dab0",
                                     "#4db6c6","#4db6c6","#4db6c6",
                                     "#327ebd","#327ebd","#327ebd","#327ebd","#327ebd",
                                     "#22329a"]);

    for(i=0;i<xTicksSorted.length-1;i++)
    {
        for(j=1;j<yTicksSorted.length;j++)
        {
            mysvg.append("rect")
               .attr("class","tile")
               .attr("x",xScale(xTicksSorted[i]))
               .attr("y",yScale(yTicksSorted[j]))
               .attr("width", (matrixW-2*rightMargin)*(xTicksSorted[i+1]-xTicksSorted[i])/xWidth)
               .attr("height", (matrixH-2*rightMargin)*(yTicksSorted[j]-yTicksSorted[j-1])/yWidth)
               .style("fill","white")
               .style("stroke","gray")
               .style("stroke-width","1px")
               .style("fill", function(){
                        return popCountMx[i][j-1]>0 ? grayScale(probability*popCountMx[i][j-1]):"white"; //Math.ceil(probability*popCountMx[i+1][j-1]) is the number of required sites
                     })
			   .append("title")
               .text(function() {
                    tD = Math.ceil(probability*popCountMx[i][j-1] - collectionCountMx[i][j-1]);
                    return "recommended: "+Math.ceil(probability*popCountMx[i][j-1])+"site(s), you have: "+collectionCountMx[i][j-1]+" site(s)";
               });
        }
    }
	  
    for(i=0;i<xTicksSorted.length-1;i++){
        for(j=1;j<yTicksSorted.length;j++){
            var tempDiff=0;  // store the difference of recommended sites and the real sites
            var tD=0;
            mysvg.append("circle")
               .attr("r", radius)
               .attr("cx", xScale(xTicksSorted[i])+(matrixW-2*rightMargin)*(xTicksSorted[i+1]-xTicksSorted[i])/xWidth/2)
               .attr("cy", yScale(yTicksSorted[j])+(matrixH-2*rightMargin)*(yTicksSorted[j]-yTicksSorted[j-1])/yWidth/2)
               .style("stroke", "black")
               .style("fill", function(){
                    tempDiff =Math.ceil(collectionCountMx[i][j-1]-probability*popCountMx[i][j-1]);
                    if (tempDiff<"-10"||tempDiff=="-10") return "#af0700";
                    else if(tempDiff>"-10"&&tempDiff<"11") return colorScale(tempDiff);
                    else return "#22329a";
               })
               .append("title")
               .text(function() {
                    tD = Math.ceil(probability*popCountMx[i][j-1] - collectionCountMx[i][j-1]);
                    return "recommended: "+Math.ceil(probability*popCountMx[i][j-1])+"site(s), you have: "+collectionCountMx[i][j-1]+" site(s)";
               });
	    }
    }

        // console.log(xTicksSorted,yTicksSorted);
     //   console.log(Math.ceil(maxRecommendationNum));

	}