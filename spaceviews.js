var DESIRED_TRAVERSAL_TIME_MS = 1000;
var C_MVU = 100;
var AGENT_MASS = 5;

var views = {
    "intro": [
        {
            name: "Bob",
            title: `<span class="character-bob">Bob</span>, standing on the porch of his space-train, sees the light particle moving at <span class="magicunits">${C_MVU} mvu</span>.`,
            velocity: 0
        },
        {
            name: "c",
            velocity: C_MVU
        }
    ],
    "relativity": [
        {
            name: "Bob",
            velocity: 0,
            title: `<span class="character-bob">Bob</span> sees <span class="character-taylor">Taylor</span>
            moving at <span class="magicunits nohighlight">20 mvu</span> and <span class="character-allie">Allie</span> moving at
            <span class="magicunits nohighlight">40 mvu</span>.`,
        },
        {
            name: "Taylor",
            velocity: 20,
            title: `<span class="character-taylor">Taylor</span> sees <span class="character-bob">Bob</span>
            moving backwards at <span class="magicunits nohighlight">-20 mvu</span> and <span class="character-allie">Allie</span> moving forwards at
            <span class="magicunits nohighlight">20 mvu</span>.`
        },
        {
            name: "Allie",
            velocity: 40,
            title: `<span class="character-allie">Allie</span> sees both of the others moving backwards; <span class="character-bob">Bob</span>
             at <span class="magicunits nohighlight">-40 mvu</span> and <span class="character-taylor">Taylor</span> at <span class="magicunits nohighlight">-20 mvu</span>.`
        }
    ],
    "specialrelativity" : [
        {
            name: "Bob",
            velocity: 0,
            title: `<span class="character-bob">Bob</span> sees <span class="character-taylor">Taylor</span>
            moving at <span class="magicunits nohighlight">20 mvu</span> and the light particle moving at
            <span class="magicunits nohighlight">100 mvu</span>.`,
        },
        {
            name: "Taylor",
            velocity: 20,
            title: `<span class="character-taylor">Taylor</span> sees <span class="character-bob">Bob</span>
            moving backwards at <span class="magicunits nohighlight">-20 mvu</span>. Taylor <em>also</em> sees the light particle moving at
            <span class="magicunits nohighlight">100 mvu</span>.`
        },
        {
            name: "c",
            velocity: C_MVU
        }
    ],
    "timedilation": [
        {
            name: "Bob",
            velocity: 0,
            
        },
        {
            name: "Taylor",
            velocity: 80,
        },
        {
            name: "c",
            velocity: C_MVU
        }
    ],
    "lengthcontraction": [
        {
            name: "Bob",
            velocity: 0,
            
        },
        {
            name: "Taylor",
            velocity: 80,
        },
        {
            name: "c",
            velocity: C_MVU
        }
    ],
    "massexpansion": [
        {
            name: "Bob",
            velocity: 0,
            
        },
        {
            name: "Taylor",
            velocity: 80,
        },
        {
            name: "c",
            velocity: C_MVU
        }
    ],
    "conclusion": [
        {
            name: "Bob",
            velocity: 0,
            
        },
        {
            name: "Taylor",
            velocity: 80,
        },
        {
            name: "Allie",
            velocity: 90,
        },
        {
            name: "Pat",
            velocity: 99.9,
        },
        {
            name: "c",
            velocity: C_MVU
        }
    ]
};


window.addEventListener("load", function() {
   var views = document.getElementsByClassName("view");
   for(var i = 0; i < views.length; i++) addView(views[i]);
});

/**
 * 
 * @param {Element} view 
 */
function addView(view) {
    var viewId = view.getAttribute("data-viewid");
    var viewData = views[viewId];
    
    var perspective = 0;
    
    var viewBox = view.getClientRects()[0];
    
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    var w = viewBox.width;
    var h = viewBox.height;
    
    var initialDistanceFromTop = viewBox.y;
    
    svg.setAttribute("height", h);
    svg.setAttribute("width", w);
    svg.style.position = "absolute";
    
    var agents = [];
    
    viewData.reverse().forEach((x,i,a)=> {
        x.clock = view.hasAttribute("data-clock");
        x.mass = view.hasAttribute("data-mass");
        x.length = view.hasAttribute("data-length");
        
        var agentLayerRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        var height = h / a.length;
        agentLayerRect.setAttribute( "height", height);
        agentLayerRect.setAttribute("y", i * height);
        agentLayerRect.setAttribute("x", 0);
        agentLayerRect.setAttribute("width", w);
        agentLayerRect.setAttribute("tabIndex", 0);
        
        agentLayerRect.style.fill = "#00000001";
        
        agents.push(makeAgent(x, i, a.length, w, h, svg, initialDistanceFromTop));
        
        agentLayerRect.addEventListener("click", function() {
            if(x.velocity != C_MVU) {
                perspective = x.velocity;
                redrawCanvasIfPossible(view, i);
                agents.forEach((x,i)=>x(calculateRelativeSpeed(viewData[i].velocity, perspective)));
            }
        });
        
        
        svg.appendChild(agentLayerRect);
    });
    view.appendChild(svg);
}

/**
 * 
 * @param {Element} view 
 */
function redrawCanvasIfPossible(view, index) {
    if(view.hasAttribute("data-star-canvas-id")) {
        ___canvasClearFunctions[view.getAttribute("data-star-canvas-id")](index);
    }
} 

function makeAgent(config, index, totalCount, fieldWidth, fieldHeight, parent, initialDistanceFromTop) {
    var container = document.createElementNS("http://www.w3.org/2000/svg", "g");
    parent.appendChild(container);
    
    var visualiser = makeAgentVisualisation(config);
    container.appendChild(visualiser.elem);
    
    var rowHeight = (fieldHeight / totalCount);
    //set it halfway through the assigned row
    var heightTransform = rowHeight * index + rowHeight/2;
    
    container.setAttribute("transform", `translate(0, ${heightTransform})`);
    
    var resetSimulation = false;
    
    var vInC = config.velocity / C_MVU;
    
    var vInPixelsPerMs = (vInC * fieldWidth) / DESIRED_TRAVERSAL_TIME_MS;
    
    var x = fieldWidth / 2;
    
    var initialScrollY = window.scrollY;
    
    var tooltip = createTooltip(config, container, index);
    
    var lastTimeFrame = 0;
    var timeSinceLastFrame = 0;
    var isInViewport = true;
    function anim(t) {
        if(!lastTimeFrame) lastTimeFrame = t;
        timeSinceLastFrame = t - lastTimeFrame;
        
        visualiser.updateClock(vInC, t, resetSimulation);
        resetSimulation = false;
        
        x += vInPixelsPerMs * timeSinceLastFrame;
        if(x <= 0) x += fieldWidth*2;
        x %= fieldWidth;
        
        var scrollTransform = (window.scrollY - initialScrollY - initialDistanceFromTop + rowHeight * index) * 0.2;
        
        if(tooltip && vInC == 0) {
            tooltip.style.opacity = (window.scrollY - initialScrollY - initialDistanceFromTop + fieldHeight) * ( 2 / rowHeight );
            tooltip.setAttribute("transform", `translate(0, ${Math.round(1000 * 10 * Math.sin(scrollTransform / 20)) / 1000})`);
        } else if(tooltip) {
            tooltip.style.opacity = 0;
        }
        
        container.setAttribute("transform", `translate(${x}, ${heightTransform + scrollTransform})`);
        
        lastTimeFrame = t;
        
        if(isInViewport) requestAnimationFrame(anim);
    }
    //requestAnimationFrame(anim);
    
    (new IntersectionObserver(function(entries) {
        if(entries[0].isIntersecting) {
            isInViewport = true;
            requestAnimationFrame(anim);
        } else {
            isInViewport = false;
        }
    })).observe(parent);
    
    return function(newRelativeVelocity) {
        vInC = newRelativeVelocity / C_MVU;
    
        vInPixelsPerMs = (vInC * fieldWidth) / 1000;
        x = fieldWidth / 2;
        
        resetSimulation = true;
    }
}

function createTooltip(config, parent, index) {
    var forigenObj = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
    if(config.title) {
    
        forigenObj.innerHTML = `<span class="view-tooltip">${config.title}</span>`;
        
        if(index % 2) {
            forigenObj.setAttribute("x", 40);
        } else {
            forigenObj.setAttribute("x", -340);
        }
        forigenObj.setAttribute("y", -50);
        forigenObj.setAttribute("width", 300);
        forigenObj.setAttribute("height", 100);
        
        parent.appendChild(forigenObj);
    }
    
    return forigenObj;
}

function makeAgentVisualisation(config) {
    var group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    
    var elem;
    if(config.velocity == C_MVU) elem = makeLightSvg();
    else elem = makePlanetSvg(config.velocity, config);
    
    group.appendChild(elem.elem);
    
    var visSize = elem.size;
    
    var clock, clockText, firstClockTime;

    var mass;

    var length = false;
    
    if(config.velocity != C_MVU) {
        if(config.clock) {
            clock = document.createElementNS("http://www.w3.org/2000/svg", "path");
            clock.style.fill = "#0008";
            
            clockText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            clockText.style.fill = "#fff";
            
            group.appendChild(clock);
            group.appendChild(clockText);
        }
        if(config.mass) {
            mass = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
            mass.style.fill = elem.elem.style.fill;
            mass.style.opacity = 0.2;
            group.appendChild(mass);
        }

        length = config.length;
    }
    
    return {
        elem: group,
        updateClock: function(relativeVelocity, time, reset) {  
            if(!firstClockTime || reset) firstClockTime = time;
                      
            if(clock) {
                time = time - firstClockTime;
                
                time /= gamma(relativeVelocity);
                
                var timeNorm = (time / DESIRED_TRAVERSAL_TIME_MS);
                
                clockText.textContent = Math.round(timeNorm);
                
                timeNorm -= Math.floor(timeNorm);
                
                //subtract pi/4 to normalise cartesian vs svg
                var circleNormY = visSize * Math.sin(timeNorm * Math.PI * 2);
                var circleNormX = visSize * Math.cos(timeNorm * Math.PI * 2);
                
                if(circleNormX == visSize) circleNormX += 0.1;
                
                var pathParams = ["M", 0, 0,
                    "H", visSize,
                                    "A", visSize, visSize, 0, +(timeNorm < 0.5), +false, circleNormX, circleNormY,
                                    "L", 0, 0,
                                "Z"];
                
                clock.setAttribute("d", pathParams.join(" ") );
            }
            if(mass) {
                var massVisSize = visSize + gamma(relativeVelocity) * AGENT_MASS * 2;
                mass.setAttribute("rx", massVisSize);
                mass.setAttribute("rx", massVisSize);
            }
            if(length) {
                var trans = `scaleX(${1/gamma(relativeVelocity)})`;
                elem.elem.style.transform = trans;
                if(mass) mass.style.transform = trans;
                if(clock) clock.style.transform = trans;
            }
        }
    }
}
function makePlanetSvg(v, config) {
    
    var size = 0.75;
    
    var colors = {"bob": "#F2E678", "taylor": "#0A8754", "pat": "#CC2803", "allie": "#48ACF0"};
    
    var color = colors[config.name.toLowerCase()] || "#ffffff";
    
    var e = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
    e.setAttribute("rx", size*20);
    e.setAttribute("ry", size*20);
    e.style.fill = color;
    return {
        elem: e,
        size: size*20
    };
}
function makeLightSvg() {
    var e = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
    e.setAttribute("rx", 7);
    e.setAttribute("ry", 7);
    e.style.fill = "#ffffff";
    return {
        elem: e,
        size: 7
    };
}

function gamma(v) {
    var g = 1 / Math.sqrt(
            1 - (v*v)
        );
        

    return g;
}

function calculateRelativeSpeed(v, p) {
    return (v - p) / (1 - (v*p)/(C_MVU*C_MVU));
}