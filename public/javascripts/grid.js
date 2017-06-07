var removePreviousGrids = function() {
    d3.selectAll('.grid').remove();
}

var prevCol = null;
var prevCell = null;

var displayGrid = function() {
    removePreviousGrids();
    
    var data = [];
    for (var i = 0; i < snps.length; i++) {
        var snp = snps[i];
        if (snp.loc >= lowerBound || snp.loc <= upperBound) {
            data.push(snp);
        }
    }

    const boxWidth = 7.5, boxHeight = 7.5;
    const gridWidth = data.length * boxWidth, gridHeight = 116 * boxHeight;

    d3.select('#grid-container')
        .style('width', gridWidth).style('height', gridHeight);
    var grid = d3.select('#grid-container').append('svg')
        .attr('class', 'grid').attr('width', gridWidth).attr('height', gridHeight);

    var rect = rectFor('.grid');
    var x = d3.scaleLinear().range([rect.left, rect.right]).domain([0, boxWidth * snps.length]);
    var y = d3.scaleLinear().range([rect.bottom, rect.top]).domain([0, boxHeight * 116]);

    grid.append('text')
        .attr('class', 'axisLabel')
        .attr('x', gridWidth / 2).attr('dy', '-2em')
        .style('text-anchor', 'middle').style('fill', 'white')
        .text('SNPs on Chr ' + currChr + ' from ' + lowerBound + '-' + upperBound);

    grid.append('text')
        .attr('class', 'axisLabel')
        .attr('transform', 'rotate(-90)')
        .attr('x', -gridHeight / 2).attr('dx', '-1em')
        .style('text-anchor', 'middle').style('fill', 'white')
        .text('ROIs');

    d3.select('.grid').selectAll('g').data(data)
        .enter().append('g')
            .attr('class', 'column').attr('id', function(s, i) { return 'col' + i; })
            .attr('snp', function(s) { return s.name; })
            .attr('transform', function(s, i) { return 'translate(' + (boxWidth * i) + ',0)'})
            .on('click', function(s, i) {
                if (prevCol) {
                    d3.select('#col' + prevCol).selectAll('rect').style('stroke', 'black');
                }
                d3.select('#col' + i).selectAll('rect').style('stroke', 'white');
                prevCol = i;

                colortable = 'http://localhost:8000/colortable?chr=' + currChr + '&snp=' + s.name;
                slices.labelmap.colortable.file = colortable;
                r2.render();
            })
            .selectAll('rect').data(function(s) { return s.pvalues; }).enter().append('rect')
                .attr('id', function(p, j) { return 'p-' + (parseInt(Math.random() * 10000)) + '-' + j; })
                .attr('snp', s.name).attr('p', function(p) { return p; })
                .attr('x', 0).attr('y', function(p, j) { return boxHeight * j; })
                .attr('width', boxWidth).attr('height', boxHeight)
                .style('stroke', 'black')
                .style('fill', function(p) { 
                    return pToRGB(p); 
                })
                .on('mouseover', function() {
                    const id = d3.event.target.id;
                    d3.select('#' + id)
                        .attr('transform', 'scale(2)')
                        .style('fill', 'white').style('stroke', 'white');
                    prevCell = id;
                })
                .on('mouseout', function() {
                    if (prevCell) {
                        d3.select('#' + prevCell)
                            .attr('transform', 'scale(1)')
                            .style('stroke', 'black');
                    }
                });
}