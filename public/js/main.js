
const getEmissionsdata = function(year){
    return new Promise(resolve => {
        fetch('/emissions_data?year='+year)
        .then(response => response.json())
        .then(data => {
            resolve(data)
        })
        .catch(err => {
            console.log(err)
        })
    })
}

const buildD3 = function(){
    this.pointSize = 5
    this.pointColor = 'red'
    this.titleBackground = 'white'
    this.borders = 'rgb(' + 71 + ',' + 186 + ',' + 224 + ')'
    this.titleTextColor = 'black'
    var p;
    var year;
    year = 2010
    const mousedown =function() {
        m0 = [d3.event.pageX, d3.event.pageY];
        svg.selectAll("path").attr("d", path);
        d3.event.preventDefault();
      }
      
    const width = 960,
        height = 500;

    d3.select(window)
        .on("mouseup", function(){
            m0 = null;
        })

    const proj = d3.geo.orthographic()
        .translate([width / 2, height / 2])
        .clipAngle(90)
        .scale(220);

    const path = d3.geo.path().projection(proj).pointRadius(2);

    var tooltip = d3.select("body").append("div")   
        .attr("class", "tooltip")               
        .style("opacity", 0);

    const graticule = d3.geo.graticule()

    var λ = d3.scale.linear()
        .domain([0, width])
        .range([-180, 180]);

    var φ = d3.scale.linear()
        .domain([0, height])
        .range([90, -90]);

    const svg = d3.select("svg")
        .attr("width", width)
        .attr("height", height)
        .on("mousedown", mousedown);

    svg.on("mousemove", function() {
        if (m0 && !lock) {
            p = d3.mouse(this);
            proj.rotate([λ(p[0]), φ(p[1])]);
            svg.selectAll("path").attr("d", path);
        }
    });

    
    d3.queue()
        .defer(d3.json, "https://unpkg.com/world-atlas@1.1.4/world/110m.json")
        .defer(d3.csv, "/world-country-names.csv")
        .await(ready);
    
    function ready (err, world, names){
        if (err) throw err
        var countries1 = topojson.feature(world, world.objects.countries).features;
        countries = countries1.filter(function(d) {
            return names.some(function(n) {
                if (d.id == n.id) return d.name = n.name;
            })
        });
        svg.append("path")
            .datum(graticule)
            .attr("class", "graticule")
            .attr("d", path);

        svg.append("path")
            .datum(graticule.outline)
            .attr("class", "foreground")
            .attr("d", path);

        svg.append("path")
            .datum(topojson.feature(world, world.objects.land))
            .attr("class", "land")
            .attr("d", path);

        var countries_em = []
        getEmissionsdata(year).then(function(result){
            
            countries.forEach(c => {
                new_record = c
                em_record = result.filter(res => res.id == c.id)[0]
                if (em_record){
                    new_record.total = em_record.total
                    new_record.perCapita = em_record.perCapita
                    
                }else {
                    new_record.total = -1
                    new_record.perCapita = -1
                }
                countries_em.push(new_record)
            })
            svg.append("g")
                .selectAll("path")
                .data(countries_em)
                .attr("class", "countries")
                .enter().append("path")
                .attr("d", path)
                .style("fill", function(d){
                    if(d.total == -1){
                        return "white"
                    }else{
                        let score, max
                        if(total){
                            score = d.total
                            max = 2500000
                        }else{
                            score = d.perCapita
                            max = 500
                        }
                        d_rel = 100*Math.log(100*score)/Math.log(max)
                        var r, g, b = 0;
                        if(d_rel > 50) {
                            r = 255;
                            g = Math.round(510 - 5.1 * d_rel);
                        }
                        else {
                            g = 255;
                            r = Math.round(5.10 * d_rel);
                        }
                        var h = r * 0x10000 + g * 0x100 + b * 0x1;
                        return '#' + ('000000' + h.toString(16)).slice(-6);
                    }
                })
                .on('mouseover', function(d, i) {
                    let text;
                    if(d.total == -1){
                        text= d.name + " had no emission data for this year"
                    }else{
                        if(total){
                            text =  d.name + " had emission of " + d.total + " metric tons of Co2"
                        }else{
                            text =  d.name + " had emission of " + d.perCapita + " metric tons of Co2 per capita"
                        }
                    }
                    
                    tooltip.transition()        
                        .duration(200)      
                        .style("opacity", 1);      
                        tooltip.html(text)
                        .style("left", (d3.event.pageX + 15) + "px")     
                        .style("top", (d3.event.pageY - 28) + "px")
                    d3.select(this).style('fill-opacity', 1);
                })
                .on('mouseout', function(d, i) {

                    d3.selectAll('path')
                        .style({
                            'fill-opacity':.7
                        });
                        tooltip.transition()        
                            .duration(500)      
                            .style("opacity", 0); 
            });
        })
        
    }

    
  
      this.changeBorders = function () {
        svg.selectAll('path')
          .attr('stroke', this.borders)
      }
  
      this.changeInfoBackground = function () {
        d3.select('body').select('tooltip')
          .attr('style', 'background: ' + this.titleBackground)
      }
  
      this.changeInfoTextColor = function () {
        d3.select('body').select('tooltip')
          .attr('style', 'color: ' + this.titleTextColor)
      }

    this.updateColours = function(r_d, g_d, b_d){
        console.log("updating")
        svg.selectAll("countries").style("fill", function(d){
            if(d.total == -1){
                return "white"
            }else{
                
                let score, max, r_base = 255 + r_d, g_base = 255 + g_d
                if(total){
                    score = d.total
                    max = 2500000
                }else{
                    score = d.perCapita
                    max = 500
                }
                d_rel = 100*Math.log(100*score)/Math.log(max)
                var r, g, b = 0 + b_d;
                if(d_rel > 50) {
                    r = r_base;
                    g = Math.round(510 - 5.1 * d_rel);
                }
                else {
                    g = g_base;
                    r = Math.round(5.10 * d_rel);
                }
                var h = r * 0x10000 + g * 0x100 + b * 0x1;
                return '#' + ('000000' + h.toString(16)).slice(-6);
            }
        })
    }
}

var m0, o0, lock = false, total = true;

globeConfig = {
    pointSize: 2
}
window.onload = function(){
    
    var gui = new dat.GUI();
    gui.add(globeConfig, "pointSize", 0, 10).onChange(function() {
        console.log("Value changed");
    })
    buildD3()

    document.getElementById("rotationOption").addEventListener("change", function(){
        if(document.getElementById("rotationOption").value == "Fixed"){
            lock = true
        }else{
            lock = false
        }
    })

    document.getElementById("dataOption").addEventListener("change", function(){
        if(document.getElementById("dataOption").value == "total"){
            total = true
        }else{
            total = false
        }
        buildD3()
        updateColours(-100, -100, 100)
    })
}