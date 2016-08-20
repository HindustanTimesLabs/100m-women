require("../css/styles.scss");
d3 = require("d3")
$ = jQuery = require("jQuery")
_ = require("underscore")

// scroll check to hide stepper

$(window).scroll(function() {
    var windscroll = $(window).scrollTop();
    var chartpos = ($('.chart').position().top)+50
    if ($('.stepper-container').hasClass('active')){
        if (chartpos>windscroll){
            d3.select('.stepper-container')
                .transition()
                .style('opacity',0)
                .duration(50)
            } else {
            d3.select('.stepper-container')
                .transition()
                .style('opacity',1)
                .duration(50)
        }
    }
}).scroll();

var share = '<p>At <b>10.49 seconds</b>, Flo-Jo is still the fastest woman ever. She died in 1998.</p><a href="https://www.facebook.com/sharer/sharer.php?u=http://www.hindustantimes.com/static/olympics/every-country-fastest-woman-in-one-race-100m" target="_blank"><div class = "share fb"><i class="fa fa-facebook social-button" aria-hidden="true"></i> Share</div></a><a href = "http://twitter.com/intent/tweet?url=http://www.hindustantimes.com/static/olympics/every-country-fastest-woman-in-one-race-100m&text=Every country\'s fastest woman in one race" target="_blank"><div class = "share tw"><i class="fa fa-twitter social-button" aria-hidden="true"></i> Tweet</div></a>'

var steps = [
    {
        'highlight':'Jamaica',
        'arrow':'Jamaica',
        'text':'Usain Bolt',
        'narrative':'Elaine Thompson is the new Olympic Champion. The Jamaican is also the <b>fastest woman</b> in the world right now.'
    },
    {
        'narrative':'But she shares Jamaica’s national record with 2012 champion Shelly-Ann Fraser-Pryce. Both have run the 100-metre sprint in <b>10.7 seconds.</b>'
    },
    {
        'narrative':'At <b>11.24 seconds</b>, <span class = "india">India’s</span> Dutee Chand trails 67 countries. She’s ahead of <b>130.</b>'
    },
    {
        'narrative':'<span class = "india">India</span> is the <b>9th fastest country</b> in Asia (Russia is the fastest) and the second fastest in South Asia, after Sri Lanka.'
    },
    {
        'narrative':'Chand’s national record, set in 2016, is among the latest. Slovakia’s is the oldest &mdash; it was last set in 1968. <b>Ten national records</b> haven’t been broken since the 1970s.'
    },
    {
        'narrative':'In fact, the world record was last broken in 1988 by USA’s Florence Griffith-Joyner, also known as Flo-Jo.'
    },
    {
        'narrative':'Jamaica’s Thompson, the current Olympic champion, is a <b>fifth of a second slower</b>. That\'s the average time it takes for your reflexes to kick in.'
    },
    {
        'narrative':''
    }
]

var box = {
            height: $(window).height()*2.3,
            width: $(window).width(),  
            sidemargin: 50, 
            topmargin: 50
        }

// this animates our lovely scroll
var scrollAnimator = function(){
    $("html, body").animate(
        { scrollTop: ($('.legend').position().top)-($(window).height()*0.97)}
        , 100/9.53288846520496 * 700, 'swing'
    );
};

var starttime, currenttime

var barwidth = 2, arrowlength = 40

var ease = d3.easeLinear;

box.effectiveheight = box.height-(box.topmargin*3)

var svg = d3.select(".chart")
    .append("svg")
    .attr("class","chart-svg")
    .attr('height', (box.height))
    .attr('width',(box.width-box.sidemargin))

d3.csv("data/data.csv",function(error,men){

    // calculate min time. That is our friend Usain!
    var mintime = d3.min(men, function(e){return parseFloat(e.cleantime)})

    // STOPWATCH YAY
    var stopWatchTimer = function(){
        currenttime = Date.now()
        if (currenttime-starttime <= mintime*1000){
            d3.select('.time')
                .text(getcleantime(currenttime - starttime)+"s")
        } else {
            if ($('body').attr('time')!='Y'){
                $('body').attr('time','Y')
                d3.select('.time')
                .text('10.49s')
            }

            clearInterval(stopWatchTimer)
        }
    }
    var countryList = _.chain(men).pluck('Country').uniq().value()
    // define scale bands
    var x = d3.scaleBand()
                .domain(countryList)
                .range([0,(box.width-(box.sidemargin*2))])

    // y scales!
    var y = d3.scaleLinear()
        .range([(box.height-(box.topmargin*3.5)), 0])
        .domain([100,0]);

    // continent list! In alphabetical order
    var continentList = _.chain(men).pluck('Continent').uniq().value().sort()

    // Continents are best when they are colorful!
    var colorList = ["#334D5C","#DF5A49","#EFC94C","#45b29D","#2980B9","#E37A3f","#FDEEA7"]
    
    // color range cause we need to connect our continents and some colors
    var colorRange = d3.scaleOrdinal(colorList)
                        .domain(continentList);

    // legend stuff!
    var legend = d3.select('.legend')

    legend.selectAll('.key')
            .data(continentList)
            .enter()
            .append('div')
            .attr('class','key')
            .append('div')
            .attr('class','legend-box')
            .style('background-color',function(e){return colorRange(e)})

    legend.selectAll('.key')
            .append('p')
            .text(function(e){return e})

    // We begin the chart here peoplezzzzz
    var chart = svg.append('g')
        .attr("class","chart-container")
        .attr("transform","translate(" + box.sidemargin + "," + (box.topmargin) + ")")

    var xAxis = d3.axisTop()
        .scale(x)

    var yAxis = d3.axisLeft()
        .scale(y)
        .ticks('10')
        .tickFormat(function(d) { if (d == 0){ return "Start"} else if (d==10 || d==100){return d+"m"} else {return d} })
        .tickSize(-box.width, 0, 0)

    chart.append("g")
        .attr("transform","translate(0,0)")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("dy", ".71em")

    chart.selectAll(".bar")
        .data(men)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x (d['Country']); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return 0; })
        .attr("height",0)
        .style("fill",function(e){return colorRange(e['Continent'])})

    var India = _.findWhere(men,{Country:'India'})

    // what happens when you click on the start button
    $('.button').on("click",function(){
        $('.stopwatch').removeClass('inactive')
        starttime = Date.now()
        setTimeout(scrollAnimator, 1000);
        var timer = setInterval(stopWatchTimer, 0.5);

        d3.selectAll('.bar')
            .transition()
            .attr("height", function(d) { return y(d['pos_at_max_dist']); })
            .duration(function(e){return e['pos_at_max_dist']/e['speed'] * 1000 })

            firstSlide((mintime*1000)+1000)
        d3.select('.stepper-container')
            .transition()
            .style('z-index',10)
            .transition()
            .delay((mintime*1000)+2000)
            .attr('class','stepper-container active')
            .style('opacity',1)
            .duration(1000)

        d3.select('.stopwatch')
            .transition()
            .delay((mintime*1000)+1000)
            .style('opacity',0)
            .duration(1000)
    })

    chart.append('line')
        .attr("class","finish-line axis")
        .attr("x1", 0)     // x position of the first end of the line
        .attr("y1", y(100))      // y position of the first end of the line
        .attr("x2", box.width)     // x position of the second end of the line
        .attr("y2", y(100))
        .style("stroke-width","5px")

    chart.append('text')
        .attr("class","finish-line-text")
        .text("Finish Line")
        .attr("transform","translate("+((box.width/2)-100)+","+(box.height-box.topmargin-80)+")")

    var stepperpos = 1;

    $('#next').on('click',function(){
        if (stepperpos>=1){
            $('#prev').removeClass('inactive')
        } 
        if (stepperpos<steps.length-1){
            $('#next').removeClass('inactive')
        } else {
            $('#next,#prev').addClass('inactive')
            $('#replay').removeClass('inactive')
        }
        stepperpos = changeSlide(stepperpos)
        
    })
    $('#prev').on('click',function(){
        if (stepperpos==2){
            $('#prev').addClass('inactive')
        } 

        if (stepperpos<=steps.length){
            $('#next').removeClass('inactive')
        }
        stepperpos = changeSlide(stepperpos-2)
    })

    $('#replay').on('click',function(){
        stepperpos = 0
        stepperpos = changeSlide(0)
        $('#next').removeClass('inactive')
            $('#replay').addClass('inactive')

    })

    // code for round function
    function round(value, precision) {
        var multiplier = Math.pow(10, precision || 0);
        return Math.round(value * multiplier) / multiplier;
    }

    // code for stopwatch
    var stopwatch = d3.select('.stopwatch')

    // code to clean time

    function getcleantime(time){
        var milliseconds = ((time % 1000)/10).toFixed(0)
        var seconds = parseInt(time/1000)
        if (seconds<1){
            seconds = '00'
        } else if (seconds<10){
            seconds = '0'+seconds
        }
        if (milliseconds<1){
            milliseconds = '00'
        } else if (milliseconds<10){
            milliseconds = '0'+milliseconds
        }
        return seconds + "." + milliseconds 
    }

    // Slide 1
    function firstSlide(timedelay){
        updateText(1)
        $('.a-step').remove()
        // arrow for Jamaica
        var arrowright = chart.append("g")
            .attr('class','a-step arrowright arrow')
            .attr('id','step1-arrow')
            .style("opacity", 0)

        var labelLineR = arrowright.append("line")
            .attr("x1", (x("Jamaica") + x.bandwidth()))
            .attr("y1", y(94.5))
            .attr("x2", x("Jamaica") + arrowlength)
            .attr("y2", y(94.5))
            .attr("stroke-width", 1)
            .attr("stroke", "#2D2D2D");

        var rightR = arrowright.append("line")
            .attr("y1", y(94.5))
            .attr("x1", x("Jamaica") + arrowlength)
            .attr("y2", y(94.5) + 5)
            .attr("x2", x("Jamaica") + (arrowlength - 8))
            .attr("stroke-width", 1)
            .attr("stroke", "#2D2D2D");

        var leftR = arrowright.append("line")
            .attr("x1", rightR.attr("x1"))
            .attr("y1", rightR.attr("y1"))
            .attr("x2", rightR.attr("x2"))
            .attr("y2", rightR.attr("y2") - 10)
            .attr("stroke-width", 1)
            .attr("stroke", "#2D2D2D");

         var rightArrowText = arrowright.append("text")
                                .attr("class","label-text right-arrow-text")
                                .text("Thompson")
                                .attr('transform','translate('+ (parseInt(labelLineR.attr("x2"))+10) +","+ (parseInt(labelLineR.attr("y1"))+5) +")")
    
        // fade in the arrow
        d3.selectAll('#step1-arrow')
            .transition()
            .delay(timedelay)
            .style("opacity",1)
            .duration(1000)
        
        if (timedelay==0){
            resetOpacity()
        }

        // highlight Usain Bolt
        d3.selectAll('.bar')
            .transition()
            .delay(timedelay)
            .style("fill",function(e){if (e.Country=='Jamaica'){return colorRange(e['Continent'])} else {return "#E5E5E5"}})
            .duration(1000)
    }

    // Slide 2
    function secondSlide(){
        resetOpacity()
        hideRefLine()
        $('.a-step, .difference').remove()

        // arrow for Jamaica

        var arrowright = chart.append("g")
                            .attr('class','a-step arrowright arrow')
                            .attr('id','step1-arrow')
                            .style("opacity", 0)

        var labelLineR = arrowright.append("line")
            .attr("x1", (x("Jamaica") + x.bandwidth()))
            .attr("y1", y(94.5))
            .attr("x2", x("Jamaica") + arrowlength)
            .attr("y2", y(94.5))
            .attr("stroke-width", 1)
            .attr("stroke", "#2D2D2D");

        var rightR = arrowright.append("line")
            .attr("y1", y(94.5))
            .attr("x1", x("Jamaica") + arrowlength)
            .attr("y2", y(94.5) + 5)
            .attr("x2", x("Jamaica") + (arrowlength - 8))
            .attr("stroke-width", 1)
            .attr("stroke", "#2D2D2D");

        var leftR = arrowright.append("line")
            .attr("x1", rightR.attr("x1"))
            .attr("y1", rightR.attr("y1"))
            .attr("x2", rightR.attr("x2"))
            .attr("y2", rightR.attr("y2") - 10)
            .attr("stroke-width", 1)
            .attr("stroke", "#2D2D2D");

         var rightArrowText = arrowright.append("text")
                                .attr("class","label-text right-arrow-text")
                                .text("Jamaica")
                                .attr('transform','translate('+ (parseInt(labelLineR.attr("x2"))+10) +","+ (parseInt(labelLineR.attr("y1"))+5) +")")

        
    arrowright.transition()
                .style('opacity',1)
                .duration(1000)

        d3.selectAll('.bar')
            .transition()
            .style("fill",function(e){if (e.Country=='Jamaica'){return colorRange(e['Continent'])} else {return "#E5E5E5"}})
            .duration(1000)
    }

    // Slide 3
    function thirdSlide(){
         resetOpacity()
        appendRefLine(India.pos_at_max_dist)
        showRefLine()
        $('.arrow').remove()
        d3.selectAll('.bar')
            .transition()
            .style("fill",function(e){
                if (parseFloat(e.pos_at_max_dist)<=parseFloat(India.pos_at_max_dist)){
                    return colorRange(e['Continent'])
                } else {
                    return "#F7F7F7"}
                })
            .style("opacity",function(e){
                if ( parseFloat(e.pos_at_max_dist) < parseFloat(India.pos_at_max_dist) ){
                    return 0.4
                } else if (parseFloat(e.pos_at_max_dist)==parseFloat(India.pos_at_max_dist)) {
                    if (e.Country == 'India'){
                                        return 1
                                    } else {
                                        return 0.4
                                    }
                } else {
                    return 1
                }
            })
            .duration(1000)
    }

    // Slide 4

    function fourthSlide(){
        resetOpacity()
        showRefLine()
        d3.selectAll('.arrow').remove()

        var arrowleft = chart.append("g")
                            .attr('class','arrowleft arrow a-step')
                            .style("opacity", 0)

        var labelLine = arrowleft.append("line")
            .attr("x1", x("Russia"))
            .attr("y1", y(97))
            .attr("x2", x("Russia") - arrowlength+(x.bandwidth()*2))
            .attr("y2", y(97))
            .attr("stroke-width",1)
            .attr("stroke", "#2D2D2D");

        var right = arrowleft.append("line")
            .attr("y1", y(97))
            .attr("x1", x("Russia") - arrowlength+(x.bandwidth()*2))
            .attr("y2", y(97) + 5)
            .attr("x2", x("Russia") - arrowlength+(x.bandwidth()*2) + 8)
            .attr("stroke-width",1)
            .attr("stroke", "#2D2D2D");

        var left = arrowleft.append("line")
            .attr("x1", right.attr("x1"))
            .attr("y1", right.attr("y1"))
            .attr("x2", right.attr("x2"))
            .attr("y2", right.attr("y2")-10)
            .attr("stroke-width",1)
            .attr("stroke", "#2D2D2D");

        var leftArrowtextshadow = arrowleft.append("text")
                                .attr("class","label-text shadow left-arrow-text")
                                .text("Russia")
                                .attr('transform','translate('+ (labelLine.attr("x2")-45) +","+ (parseInt(labelLine.attr("y1"))+5) +")")
        
        var leftArrowtext = arrowleft.append("text")
                                .attr("class","label-text left-arrow-text")
                                .text("Russia")
                                .attr('transform','translate('+ (labelLine.attr("x2")-45-(x.bandwidth()*2)) +","+ (parseInt(labelLine.attr("y1"))+5) +")")

        // arrow for Lanka
        var arrowleft1 = chart.append("g")
                            .attr('class','arrowleft arrow a-step')
                            .style("opacity", 0)

        var labelLine1 = arrowleft1.append("line")
            .attr("x1", x("Sri Lanka"))
            .attr("y1", y(94.3))
            .attr("x2", x("Sri Lanka") - arrowlength-(x.bandwidth()*2))
            .attr("y2", y(94.3))
            .attr("stroke-width",1)
            .attr("stroke", "#2D2D2D");

        var right1 = arrowleft1.append("line")
            .attr("y1", y(94.3))
            .attr("x1", x("Sri Lanka") - arrowlength-(x.bandwidth()*2))
            .attr("y2", y(94.3) + 5)
            .attr("x2", x("Sri Lanka") - arrowlength-(x.bandwidth()*2) + 8)
            .attr("stroke-width",1)
            .attr("stroke", "#2D2D2D");

        var left1 = arrowleft1.append("line")
            .attr("x1", right1.attr("x1"))
            .attr("y1", right1.attr("y1"))
            .attr("x2", right1.attr("x2"))
            .attr("y2", right1.attr("y2")-10)
            .attr("stroke-width",1)
            .attr("stroke", "#2D2D2D");

        var leftArrowtextshadow1 = arrowleft1.append("text")
                                .attr("class","label-text shadow left-arrow-text")
                                .text("Sri Lanka")
                                .attr('transform','translate('+ (labelLine1.attr("x2")-60) +","+ (parseInt(labelLine1.attr("y1"))+5) +")")
        var leftArrowtext1 = arrowleft1.append("text")
                                .attr("class","label-text left-arrow-text")
                                .text("Sri Lanka")
                                .attr('transform','translate('+ (labelLine1.attr("x2")-60) +","+ (parseInt(labelLine1.attr("y1"))+5) +")")

            arrowleft1.transition()
                        .style('opacity',1)
                        .duration(1000)

        arrowleft.transition()
                .style('opacity',1)
                .duration(1000)

        d3.selectAll('.bar')
            .transition()
            .style("fill",function(e){if (e.Continent=="Asia"){return colorRange(e['Continent'])} else {return "#E5E5E5"}})
            .style('opacity',1)
            .duration(1000)

        
    }

    // Slide 5

    function fifthSlide(){
        resetOpacity()
        hideRefLine()
        $('.arrow').remove()

        var list = ['Slovakia', 'Chinese Taipei', 'Israel', 'Cambodia', 'Republic of Macedonia', 'Croatia', 'Vanuatu', 'Bermuda', 'Turks and Caicos Islands', 'Peru', 'Bolivia']


        d3.selectAll('.bar')
            .transition()
            .style("fill",function(e){
                if (_.contains(list, e.Country)){
                    return colorRange(e['Continent'])
                } else {
                    return "#E5E5E5"
                }
            })
            .duration(1000)

        var arrowleft1 = chart.append("g")
                            .attr('class','arrowleft arrow a-step')
                            .style("opacity", 0)

        var labelLine1 = arrowleft1.append("line")
            .attr("x1", x("Slovakia"))
            .attr("y1", y(91))
            .attr("x2", x("Slovakia") - arrowlength-(x.bandwidth()*2))
            .attr("y2", y(91))
            .attr("stroke-width",1)
            .attr("stroke", "#2D2D2D");

        var right1 = arrowleft1.append("line")
            .attr("y1", y(91))
            .attr("x1", x("Slovakia") - arrowlength-(x.bandwidth()*2))
            .attr("y2", y(91) + 5)
            .attr("x2", x("Slovakia") - arrowlength-(x.bandwidth()*2) + 8)
            .attr("stroke-width",1)
            .attr("stroke", "#2D2D2D");

        var left1 = arrowleft1.append("line")
            .attr("x1", right1.attr("x1"))
            .attr("y1", right1.attr("y1"))
            .attr("x2", right1.attr("x2"))
            .attr("y2", right1.attr("y2")-10)
            .attr("stroke-width",1)
            .attr("stroke", "#2D2D2D");

        var leftArrowtextshadow1 = arrowleft1.append("text")
                                .attr("class","label-text shadow left-arrow-text")
                                .text("Slovakia")
                                .attr('transform','translate('+ (labelLine1.attr("x2")-60-(x.bandwidth()*2.5)) +","+ (parseInt(labelLine1.attr("y1"))+5) +")")
        var leftArrowtext1 = arrowleft1.append("text")
                                .attr("class","label-text left-arrow-text")
                                .text("Slovakia")
                                .attr('transform','translate('+ (labelLine1.attr("x2")-60-(x.bandwidth()*2.5)) +","+ (parseInt(labelLine1.attr("y1"))+5) +")")

            arrowleft1.transition()
                        .style('opacity',1)
                        .duration(1000)
    }

    // Slide 6

    function sixthSlide(){
        hideRefLine()
        resetOpacity()
        
        $('.arrow , .difference').remove()
        // arrow for Flo-Jo
        var arrowleft = chart.append("g")
                            .attr('class','arrowleft arrow a-step')
                            .style("opacity", 0)

        var labelLine = arrowleft.append("line")
            .attr("x1", x("United States"))
            .attr("y1", y(95.5))
            .attr("x2", x("United States") - arrowlength+(x.bandwidth()*2))
            .attr("y2", y(95.5))
            .attr("stroke-width",1)
            .attr("stroke", "#2D2D2D");

        var right = arrowleft.append("line")
            .attr("y1", y(95.5))
            .attr("x1", x("United States") - arrowlength+(x.bandwidth()*2))
            .attr("y2", y(95.5) + 5)
            .attr("x2", x("United States") - arrowlength+(x.bandwidth()*2) + 8)
            .attr("stroke-width",1)
            .attr("stroke", "#2D2D2D");

        var left = arrowleft.append("line")
            .attr("x1", right.attr("x1"))
            .attr("y1", right.attr("y1"))
            .attr("x2", right.attr("x2"))
            .attr("y2", right.attr("y2")-10)
            .attr("stroke-width",1)
            .attr("stroke", "#2D2D2D");

        var leftArrowtextshadow = arrowleft.append("text")
                                .attr("class","label-text shadow left-arrow-text")
                                .text("Flo-Jo")
                                .attr('transform','translate('+ (labelLine.attr("x2")-45-(x.bandwidth()*2)) +","+ (parseInt(labelLine.attr("y1"))+5) +")")
        
        var leftArrowtext = arrowleft.append("text")
                                .attr("class","label-text left-arrow-text")
                                .text("Flo-Jo")
                                .attr('transform','translate('+ (labelLine.attr("x2")-45-(x.bandwidth()*2)) +","+ (parseInt(labelLine.attr("y1"))+5) +")")

        
        arrowleft.transition()
                .style('opacity',1)
                .duration(1000)


        d3.selectAll('.bar')
            .transition()
            .style("fill",function(e){if (e.Country=="United States"){return colorRange(e['Continent'])} else {return "#E5E5E5"}})
            .style('opacity',1)
            .duration(1000)

    }

    // Slide 7
    function seventhSlide(){
       resetOpacity()

        d3.selectAll('.bar')
            .transition()
            .style('fill',function(e){
                if (e.Country=='United States' || e.Country=='Jamaica'){
                    return colorRange(e['Continent'])
                } else {
                    return '#E5E5E5'
                }
            })
            .duration(1000)

         // arrow for jamaica
         var jamaica = _.findWhere(men,{Country:'Jamaica'})
        var arrowleft1 = chart.append("g")
                            .attr('class','arrowleft arrow a-step')
                            .style("opacity", 0)

        var labelLine1 = arrowleft1.append("line")
            .attr("x1", x("United States"))
            .attr("y1", y(96.5))
            .attr("x2", x("United States") - arrowlength-(x.bandwidth()*2))
            .attr("y2", y(96.5))
            .attr("stroke-width",1)
            .attr("stroke", "#2D2D2D");

        var right1 = arrowleft1.append("line")
            .attr("y1", y(96.5))
            .attr("x1", x("United States") - arrowlength-(x.bandwidth()*2))
            .attr("y2", y(96.5) + 5)
            .attr("x2", x("United States") - arrowlength-(x.bandwidth()*2) + 8)
            .attr("stroke-width",1)
            .attr("stroke", "#2D2D2D");

        var left1 = arrowleft1.append("line")
            .attr("x1", right1.attr("x1"))
            .attr("y1", right1.attr("y1"))
            .attr("x2", right1.attr("x2"))
            .attr("y2", right1.attr("y2")-10)
            .attr("stroke-width",1)
            .attr("stroke", "#2D2D2D");

        var leftArrowtextshadow1 = arrowleft1.append("text")
                                .attr("class","label-text shadow left-arrow-text")
                                .text("United States")
                                .attr('transform','translate('+ (labelLine1.attr("x2")-60) +","+ (parseInt(labelLine1.attr("y1"))+5) +")")
        var leftArrowtext1 = arrowleft1.append("text")
                                .attr("class","label-text left-arrow-text")
                                .text("United States")
                                .attr('transform','translate('+ (labelLine1.attr("x2")-60) +","+ (parseInt(labelLine1.attr("y1"))+5) +")")
        
     var arrowleft = chart.append("g")
                            .attr('class','arrowleft arrow a-step')
                            .style("opacity", 0)

        var labelLine = arrowleft.append("line")
            .attr("x1", x("Jamaica"))
            .attr("y1", y(94))
            .attr("x2", x("Jamaica") - arrowlength+x.bandwidth())
            .attr("y2", y(94))
            .attr("stroke-width",1)
            .attr("stroke", "#2D2D2D");

        var right = arrowleft.append("line")
            .attr("y1", y(94))
            .attr("x1", x("Jamaica") - arrowlength+x.bandwidth())
            .attr("y2", y(94) + 5)
            .attr("x2", x("Jamaica") - arrowlength+x.bandwidth() + 8)
            .attr("stroke-width",1)
            .attr("stroke", "#2D2D2D");

        var left = arrowleft.append("line")
            .attr("x1", right.attr("x1"))
            .attr("y1", right.attr("y1"))
            .attr("x2", right.attr("x2"))
            .attr("y2", right.attr("y2")-10)
            .attr("stroke-width",1)
            .attr("stroke", "#2D2D2D");

        var leftArrowtext = arrowleft.append("text")
                                .attr("class","label-text left-arrow-text")
                                .text("Jamaica")
                                .attr('transform','translate('+ (labelLine.attr("x2")-55-(x.bandwidth()*2)) +","+ (parseInt(labelLine.attr("y1")              )+5) +")")
        

        arrowleft.transition()
                    .style('opacity',1)
                    .duration(1000)


        // highlight difference

        var difference = chart.append('g')
            .attr('class','difference')
            .style('opacity',0)
            .append('line')
            .attr('class','difference-l')
            .attr("x1", (x("Jamaica")-(x.bandwidth())*2))
            .attr("y1", y(jamaica.pos_at_max_dist))
            .attr("x2", (x("Jamaica")-(x.bandwidth())*2))
            .attr("y2", y(100))
            .style('stroke','black')
            .style('stroke-width','1px')

        d3.select('.difference').transition()
            .delay(200)
            .style("opacity",1)
            .duration(1000)

        d3.select('.difference').append('line')
            .attr('class','difference-l')
            .attr("x1", (x("Jamaica")-(x.bandwidth())*2))
            .attr("y1", y(jamaica.pos_at_max_dist))
            .attr("x2", (x("Jamaica")))
            .attr("y2", y(jamaica.pos_at_max_dist))
            .style('stroke','black')
            .style('stroke-width','1px')
            .style('opacity',0)
            .transition()
            .delay(200)
            .style("opacity",1)
            .duration(1000)

        d3.select('.difference').append('line')
            .attr('class','difference-l')
            .attr("x1", (x("Jamaica")-(x.bandwidth())*2))
            .attr("y1", y(100))
            .attr("x2", (x("Jamaica")))
            .attr("y2", y(100))
            .style('stroke','black')
            .style('stroke-width','1px')
            .style('opacity',0)
            .transition()
            .delay(200)
            .style("opacity",1)
            .duration(1000)

        var diff = round((100 - jamaica.pos_at_max_dist),2)

        d3.select('.difference')
            .append('text')
            .text(diff+"m")
            .attr("class","label-text")
            .attr('transform','translate(' + ( x("Jamaica")-(x.bandwidth()*7)-45) + "," + y(parseFloat(jamaica.pos_at_max_dist)+parseFloat(diff/2)) +")")
    }

    
    function eighthSlide(){
        $('.text').html(share)
        $('.arrow, .difference').remove()
        d3.selectAll('.bar')
            .transition()
            .style('fill',function(e){
                return colorRange(e['Continent'])
            })
            .duration(1000)
    }

    // MISC

    function appendRefLine(val){
        var refline = chart.append('g')
                            .attr('class', 'refline')

        refline.append('line')
                        .attr("y1", y(val))
                        .attr("x1", 0)
                        .attr("y2", y(val))
                        .attr("x2", box.width)

        refline.append('text')
                .attr('class','desktoplabel label-text shadow')
                .text('India')
                .attr('transform','translate('+ (box.width-150) +","+ y(val-0.5) +")")

        refline.append('text')
                .attr('class','desktoplabel label-text')
                .text('India')
                .attr('transform','translate('+ (box.width-150) +","+ y(val-0.5) +")")

        var refval = parseFloat(val)+0.2
        refline.append('text')
                .attr('class','mobilelabel label-text shadow')
                .text('India')
                .attr('transform','translate('+ (-25) +","+ y(refval) +")")

        refline.append('text')
                .attr('class','mobilelabel label-text')
                .text('India')
                .attr('transform','translate('+ (-25) +","+ y(refval) +")")

    }

    function changeSlide(pos){
        pos = pos+1;
        if (pos == 1){
            firstSlide (0)
        } else if (pos == 2){
            secondSlide()
        } else if (pos == 3){
            thirdSlide()
        } else if (pos == 4){
            fourthSlide()
            appendRefLine(India.pos_at_max_dist)
        } else if (pos == 5){
            fifthSlide()
        } else if (pos == 6){
            sixthSlide()
        } else if (pos == 7){
            seventhSlide()
        } else if (pos == 8){
            eighthSlide()
        } else if (pos == 9){
            ninthSlide()
        } else if (pos == 10){
            tenthSlide()
        }
        updateText(pos)
        return pos
    }

    $('.steps').width((100/steps.length)*1+"%")


    function updateText(pos){
        if (pos!=steps.length){
            d3.select('.stepper-container .text')
                .transition()
                .delay(100)
                .style('opacity',0)
                .duration(300)
                .transition()
                .delay(100)
                .style('opacity',1)
                .duration(300)
                setTimeout(function(){$('.stepper-container .text').html(steps[pos-1].narrative)},450)
            }
            $('.steps').width((100/steps.length)*pos+"%")
    }

    function resetOpacity(){
        d3.selectAll('.bar')
            .transition()
            .style('opacity',1)
            .duration(1000)
    }

    function hideRefLine(){
        d3.selectAll('.refline')
            .transition()
            .style('opacity',0)
            .duration(1000)
    }

    function showRefLine(){
        d3.selectAll('.refline')
            .transition()
            .style('opacity',1)
            .duration(1000)
    }
})
