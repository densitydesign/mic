let svg = d3.select('body > svg'),
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

let morphologyBG = svg.append('rect')
    .attr('class', 'morphology')
    .attr('width', svgWidth)
    .attr('height', svgHeight)
    .attr('x', 0)
    .attr('y', 0)
    .attr('fill', '#17202A')

let morphology = svg.append("svg:image")
    .attr('x', 0)
    .attr('y', -0)
    .attr('width', svgWidth)
    .attr('height', svgHeight)
    .attr("xlink:href", "assets/morphology.png")

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

let sexyCircles = svg.append('g')
    .attr('class', 'sexy-circles');

let cityNames = svg.append('g')
    .attr('class', 'city-names');

d3.xml('assets/layer-names-01.svg')
    .then(function(vectors) {

        d3.select(vectors).selectAll('svg > g').each(function() {
            d3.select('.city-names').node().appendChild(this)
        })

        d3.selectAll('.city-names text').attr('filter', 'url(#dropshadow)')

        d3.selectAll('.city-names > g')
            .on('click', function(d) {
                let thisId = d3.select(this).attr('id');
                loadVectors(thisId);
                idle = false;
            })
            .on('touchstart', function(d) {
                let thisId = d3.select(this).attr('id');
                if (d3.event.touches.length < 2) {
                    loadVectors(thisId);
                    idle = false;
                }
            })

    })

// Handle city selection
let selectedCity;
let loadVectors = function(cityName) {
    if (selectedCity != cityName) {
        selectedCity = cityName;
        d3.xml(`assets/${cityName}.svg`)
            .then(function(vectors) {
                removeIsochronousVectors();
                d3.select(vectors).selectAll('svg > #rail > *').each(function(d, i) {
                    let thisElement = d3.select('.rails').node().appendChild(this);
                    d3.select(thisElement)
                        .style('opacity', 1e-6)
                        .transition()
                        .delay((16 - i) * 25)
                        .duration(500)
                        .style('opacity', 1);
                })
                d3.select(vectors).selectAll('svg > #road > g').each(function(d, i) {
                    let thisElement = d3.select('.roads').node().appendChild(this);
                    d3.select(thisElement)
                        .style('opacity', 1e-6)
                        .transition()
                        .delay((16 - i) * 25)
                        .duration(500)
                        .style('opacity', 1);
                })
            })
    }
}

let removeIsochronousVectors = function() {
    // console.log('remove vectors');
    // idleTime = 0;
    d3.selectAll('.rails > *')
        .transition()
        .duration(250)
        .delay(function(d, i) {
            return i * 20;
        })
        .style('opacity', 1e-6)
        .remove();

    d3.selectAll('.roads > *')
        .transition()
        .duration(250)
        .delay(function(d, i) {
            return i * 20;
        })
        .style('opacity', 1e-6)
        .remove();
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
    if (idleTime >= 20) {
        removeIsochronousVectors();
        idle = true;
    }
    // console.log(idleTime, idle)

    if (idle) {
        d3.selectAll('g.city-names > g').select('circle').filter(function(d, i) { return i == sexyCircleCount })
            .attr('r', 0)
            .style('fill', 'transparent')
            .style('fill', 'transparent')
            .style('stroke', '#ffffff')
            // .style('stroke', '#faf7c1')
            .style('pointer-events', 'none')
            .style('stroke-width', 2)
            .style('opacity', 1)
            .transition()
            .duration(4000)
            .ease(d3.easeCubicOut)
            // .style('stroke','#342364')                
            .attr('r', 400)
            .style('opacity', 1e-6);
        sexyCircleCount++;
        if (sexyCircleCount >= d3.selectAll('g.city-names > g').select('circle').size()) {
            sexyCircleCount = 0;
        }
    }
}

// Handle interactions
d3.select('#present')
    .on('click', function() {
        d3.select('.rails').attr('mask', 'url(#hole-mask)');
        d3.select('.roads').attr('mask', 'url(#circle-mask)');
    })
    .on('touchstart', function() {
        d3.select('.rails').attr('mask', 'url(#hole-mask)');
        d3.select('.roads').attr('mask', 'url(#circle-mask)');
    })

d3.select('#future')
    .on('click', function() {
        d3.select('.rails').attr('mask', 'url(#circle-mask)');
        d3.select('.roads').attr('mask', 'url(#hole-mask)');
    })
    .on('touchstart', function() {
        d3.select('.rails').attr('mask', 'url(#circle-mask)');
        d3.select('.roads').attr('mask', 'url(#hole-mask)');
    })

d3.selectAll('.toggle-vision')
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