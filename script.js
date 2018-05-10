let svg = d3.select('body > svg#map'),
    svgWidth = 1080,
    svgHeight = 1560,
    ratio = 1,
    radius = svgWidth * 0.04;

// Handle screen resolutions
function setRatio() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    if (width <= height * (1080 / 1560)) {
        svgWidth = width;
        svgHeight = width * (1560 / 1080);
    } else {
        svgWidth = height / (1560 / 1080);
        svgHeight = height;
    }
    ratio = 1080 / svgWidth;
    svg.attr('width', svgWidth).attr('height', svgHeight)
}
setRatio();
d3.select(window).on('resize', function() {
    setRatio()
});

// Load SVG
let vectors;
d3.xml('assets/italia-3-01.svg')
    .then(function(loadedSVG) {
        // console.log(loadedSVG);

        vectors = loadedSVG;
        d3.select(loadedSVG).select('svg > #sfondo').each(function() {
            svg.node().appendChild(this);
        })

        let rails = svg.append('g')
            .attr('class', 'rails')
            .attr('mask', 'url(#hole-mask)');

        let railsNetwork = svg.append("svg:image")
            .attr('x', 0)
            .attr('y', -0)
            .attr('width', svgWidth)
            .attr('height', svgHeight)
            .attr("xlink:href", "assets/rail.png")

        let road = svg.append('g')
            .attr('class', 'roads')
            .attr('mask', 'url(#circle-mask)');

        let roadsNetwork = svg.append("svg:image")
            .attr('x', 0)
            .attr('y', -0)
            .attr('width', svgWidth)
            .attr('height', svgHeight)
            .attr("xlink:href", "assets/road.png")

        d3.select(loadedSVG).selectAll('svg > #label').each(function() {
            svg.node().appendChild(this);
        })

        let cities = d3.select(loadedSVG).selectAll('svg > g:not(#label)').each(function(d, i) {
            // console.log(this);
            let thisCity = d3.select(this).attr('id')
            d3.select(this).selectAll(':scope > g').each(function(d, i) {
                d3.select(this)
                    .classed(thisCity, true)

                if (i == 1) {
                    d3.select('g.roads')
                        .node()
                        .appendChild(this);
                } else {
                    d3.select('g.rails')
                        .node()
                        .appendChild(this);
                }

                d3.selectAll('g.roads > g > *')
                    .style('display', 'none')
                    .style('opacity', 1e-6);

                d3.selectAll('g.rails > g > *')
                    .style('display', 'none')
                    .style('opacity', 1e-6);

            })
        });

        d3.select('svg > g#label')
            .selectAll('g')
            .on('click', function(d) {
                let thisId = d3.select(this).attr('id');
                // console.log(thisId);
                thisId = thisId.replace('label-', '')
                showVectors(thisId);
                idle = false;
            })
            .on('touchstart', function(d) {
                let thisId = d3.select(this).attr('id');
                // console.log(thisId);
                if (d3.event.touches.length < 2) {
                    thisId = thisId.replace('label-', '');
                    showVectors(thisId);
                    idle = false;
                }
            })

        d3.selectAll('svg > g#label text').attr('filter', 'url(#dropshadow)')

    })

// Handle city selection
let selectedCity;
let showVectors = function(cityName) {

    if (selectedCity != cityName) {
        selectedCity = cityName;

        console.log('show', cityName);

        d3.selectAll(`.rails > g:not(.${cityName}) > *`)
            .transition()
            .duration(350)
            .style('opacity', 1e-6)
            .on('end', function() {
                d3.select(this).style('display', 'none')
            })
        d3.selectAll(`.roads > g:not(.${cityName}) > *`)
            .transition()
            .duration(350)
            .style('opacity', 1e-6)
            .on('end', function() {
                d3.select(this).style('display', 'none')
            })

        d3.select('.rails').selectAll(`.${cityName} > *`)
            .style('display', 'block')
            .style('opacity', 1);

        let railsGeometries = d3.select('.rails').selectAll(`.${cityName} > *`);
        railsGeometries
            .style('opacity', 1e-6)
            .transition()
            .duration(500)
            .delay(function(d, i) {
                return (railsGeometries.size() - i) * 10
            })
            .style('opacity', 1)


        d3.select('.roads').selectAll(`.${cityName} > *`)
            .style('display', 'block')
            .style('opacity', 1);

        let roadsGeometries = d3.select('.roads').selectAll(`.${cityName} > *`);
        roadsGeometries
            .style('opacity', 1e-6)
            .transition()
            .duration(500)
            .delay(function(d, i) {
                return (roadsGeometries.size() - i) * 10
            })
            .style('opacity', 1)
    }
}

let removeIsochronousVectors = function() {
    console.log('hide vectors');

    selectedCity = '';

    d3.selectAll(`.rails > g > *`)
        .transition()
        .duration(1000)
        .style('opacity', 1e-6)
        .on('end', function() {
            d3.select(this).style('display', 'none')
        })

    d3.selectAll(`.roads > g > *`)
        .transition()
        .duration(1000)
        .style('opacity', 1e-6)
        .on('end', function() {
            d3.select(this).style('display', 'none')
        })
}

// Handle idle time
let idle = true;
let idleTime = 0;
let secondsInterval = 2;
let idleInterval = setInterval(timerIncrement, secondsInterval * 1000); // Count seconds
let sexyCircleCount = 0;

timerIncrement(); // run imediately only the first time
function timerIncrement() {
    idleTime = idleTime + secondsInterval;
    if (idleTime >= 20 && !idle) {
        removeIsochronousVectors();
        idle = true;
        let idleTime = 0;
    }
    if (idle) {
        console.log(idleTime, idle);
        d3.selectAll('g#label > g').select('circle').filter(function(d, i) { return i == sexyCircleCount })
            .attr('r', 0)
            .style('fill', 'transparent')
            .style('stroke-width', 1)
            .style('stroke', '#faf7c1')
            .style('pointer-events', 'none')
            .style('opacity', .7)
            .transition()
            .duration(5000)
            .ease(d3.easeCircleOut)
            .style('stroke','#342364')                
            .attr('r', 150)
            .style('opacity', 1e-6);
        sexyCircleCount++;
        if (sexyCircleCount >= d3.selectAll('g#label > g').select('circle').size()) {
            sexyCircleCount = 0;
        }
    }
}

// Handle interactions with buttons
// "fill: #e5e5e5;stroke: #000"
d3.select('#button-2018')
    .on('click', function() {
        d3.select(this).select('rect')
            .style('fill', '#e5e5e5')
            .style('stroke', '#000')
        d3.select(this).select('text')
            .style('fill', '#000')

        d3.select('#button-2050').select('rect')
            .style('fill', '#000')
            .style('stroke','#e5e5e5')
        d3.select('#button-2050').select('text')
            .style('fill', '#e5e5e5')

        d3.select('g.rails').attr('mask', 'url(#hole-mask)');
        d3.select('g.roads').attr('mask', 'url(#circle-mask)');
    })
    .on('touchstart', function() {
        d3.select(this).select('rect')
            .style('fill', '#e5e5e5')
            .style('stroke', '#000')
        d3.select(this).select('text')
            .style('fill', '#000')

        d3.select('#button-2050').select('rect')
            .style('fill', '#000')
            .style('stroke','#e5e5e5')
        d3.select('#button-2050').select('text')
            .style('fill', '#e5e5e5')

        d3.select('g.rails').attr('mask', 'url(#hole-mask)');
        d3.select('g.roads').attr('mask', 'url(#circle-mask)');
    })

d3.select('#button-2050')
    .on('click', function() {
        d3.select(this).select('rect')
            .style('fill', '#e5e5e5')
            .style('stroke', '#000')
        d3.select(this).select('text')
            .style('fill', '#000')

        d3.select('#button-2018').select('rect')
            .style('fill', '#000')
            .style('stroke','#e5e5e5')
        d3.select('#button-2018').select('text')
            .style('fill', '#fff')

        d3.select('g.rails').attr('mask', 'url(#circle-mask)');
        d3.select('g.roads').attr('mask', 'url(#hole-mask)');
    })
    .on('touchstart', function() {
        d3.select(this).select('rect')
            .style('fill', '#e5e5e5')
            .style('stroke', '#000')
        d3.select(this).select('text')
            .style('fill', '#000')

        d3.select('#button-2018').select('rect')
            .style('fill', '#000')
            .style('stroke','#e5e5e5')
        d3.select('#button-2018').select('text')
            .style('fill', '#fff')

        d3.select('g.rails').attr('mask', 'url(#circle-mask)');
        d3.select('g.roads').attr('mask', 'url(#hole-mask)');
    })

d3.selectAll('.toggle-vision')
    .on('click', function() {
        d3.select("#vision")
            .classed("closed", function(d, i) {
                return !d3.select(this).classed("closed");
            });
    })

d3.selectAll('#button-vision')
    .on('click', function() {
        d3.select("#vision")
            .classed("closed", function(d, i) {
                return !d3.select(this).classed("closed");
            });
    })

let defs = svg.append('defs');

defs.html(`<filter xmlns="http://www.w3.org/2000/svg" id="dropshadow" height="130%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="2" dy="2" result="offsetblur" />
            <feComponentTransfer>
                <feFuncA type="linear" slope="0.7" />
            </feComponentTransfer>
            <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic" />
            </feMerge>
        </filter>`)

let holeMask = defs.append('mask')
    .attr('id', 'hole-mask')
    .append('g');

holeMask.append('rect')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('x', 0)
    .attr('y', 0)
    .attr('fill', 'white');

let circleMask = defs.append('mask')
    .attr('id', 'circle-mask')
    .append('g');

let circlesShape = defs.append('mask')
    .attr('id', 'circles-shape')
    .append('g')
    .attr('id', 'g-circles-shape');

let myTouches, circles;

let holeMaskCircles = holeMask.selectAll('.hole-mask-circles');
let circleMaskCircles = circleMask.selectAll('.circle-mask-circles');
let circlesShapeMask = circlesShape.selectAll('.circles-shape-mask');

// Handle mask on touch or mouse events
svg.on('touchstart', function(d) {
        d3.event.preventDefault();
        myTouches = d3.event.touches;
        onStart();
    })
    .on('touchmove', function(d) {
        d3.event.preventDefault();
        myTouches = d3.event.touches;
        onMove();
    })
    .on('touchend', function(d) {
        d3.event.preventDefault();
        myTouches = d3.event.touches;
        onEnd();
    })
    .on('mousedown', function() {
        d3.event.preventDefault();
        d3.event.identifier = 1;
        myTouches = [d3.event]
        onStart();
    })
    .on('mousemove', function(d) {
        d3.event.preventDefault();
        d3.event.identifier = 1;
        myTouches = [d3.event]
        onMove();
    })
    .on('mouseup', function(d) {
        d3.event.preventDefault();
        myTouches = [d3.event]
        onEnd();
    })


function onStart() {
    idleTime = 0;
    idle = false;
    holeMaskCircles = holeMaskCircles.data(myTouches, function(d) { return d.identifier; })
    holeMaskCircles.exit().remove();
    holeMaskCircles = holeMaskCircles.enter().append('circle')
        .attr('class', 'hole-mask-circles')
        .attr('cx', function(d) { return d.clientX * ratio; })
        .attr('cy', function(d) { return d.clientY * ratio; })
        .attr('r', 0)
        .attr('fill', 'black')
        .merge(holeMaskCircles);

    holeMaskCircles.transition()
        .duration(350)
        .ease(d3.easeBackOut)
        .attr('r', radius);

    circleMaskCircles = circleMaskCircles.data(myTouches, function(d) { return d.identifier; })
    circleMaskCircles.exit().remove();
    circleMaskCircles = circleMaskCircles.enter().append('circle')
        .attr('class', 'circle-mask-circles')
        .attr('cx', function(d) { return d.clientX * ratio; })
        .attr('cy', function(d) { return d.clientY * ratio; })
        .attr('r', 0)
        .attr('fill', 'white')
        .merge(circleMaskCircles);

    circleMaskCircles.transition()
        .duration(350)
        .ease(d3.easeBackOut)
        .attr('r', radius);

    circlesShapeMask = circlesShapeMask.data(myTouches, function(d) { return d.identifier; })
    circlesShapeMask.exit().remove();
    circlesShapeMask = circlesShapeMask.enter().append('circle')
        .attr('class', 'circles-shape-mask')
        .attr('cx', function(d) { return d.clientX * ratio; })
        .attr('cy', function(d) { return d.clientY * ratio; })
        .attr('r', 0)
        .attr('fill', 'transparent')
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .merge(circlesShapeMask);

    circlesShapeMask.transition()
        .duration(350)
        .ease(d3.easeBackOut)
        .attr('r', radius);
}

function onMove() {
    idleTime = 0;
    idle = false;
    holeMaskCircles.data(myTouches, function(d) { return d.identifier; })
        .attr('cx', function(d) { return d.clientX * ratio; })
        .attr('cy', function(d) { return d.clientY * ratio; })

    circleMaskCircles.data(myTouches, function(d) { return d.identifier; })
        .attr('cx', function(d) { return d.clientX * ratio; })
        .attr('cy', function(d) { return d.clientY * ratio; })

    circlesShapeMask.data(myTouches, function(d) { return d.identifier; })
        .attr('cx', function(d) { return d.clientX * ratio; })
        .attr('cy', function(d) { return d.clientY * ratio; })
}

function onEnd() {
    holeMaskCircles = holeMaskCircles.data(myTouches, function(d) { return d.identifier; })
    holeMaskCircles.exit()
        .transition()
        .duration(350)
        .ease(d3.easeBackIn)
        .attr('r', 0)
        .remove();

    circleMaskCircles = circleMaskCircles.data(myTouches, function(d) { return d.identifier; })
    circleMaskCircles.exit()
        .transition()
        .duration(350)
        .ease(d3.easeBackIn)
        .attr('r', 0)
        .remove();

    circlesShapeMask = circlesShapeMask.data(myTouches, function(d) { return d.identifier; })
    circlesShapeMask.exit()
        .transition()
        .duration(350)
        .ease(d3.easeBackIn)
        .attr('r', 0)
        .remove();
}