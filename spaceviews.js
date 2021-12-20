var C_MVU = 100;

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
                agents.forEach((x,i)=>x(viewData[i].velocity - perspective));
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
    
    container.appendChild(makeAgentVisualisation(config));
    
    var rowHeight = (fieldHeight / totalCount);
    //set it halfway through the assigned row
    var heightTransform = rowHeight * index + rowHeight/2;
    
    container.setAttribute("transform", `translate(0, ${heightTransform})`);
    
    var vInC = config.velocity / C_MVU;
    
    var vInPixelsPerMs = (vInC * fieldWidth) / 1000;
    
    var x = fieldWidth / 2;
    
    var initialScrollY = window.scrollY;
    
    var tooltip = createTooltip(config, container, index);
    
    var lastTimeFrame = 0;
    var timeSinceLastFrame = 0;
    requestAnimationFrame(function anim(t) {
        if(!lastTimeFrame) lastTimeFrame = t;
        timeSinceLastFrame = t - lastTimeFrame;
        
        
        x += vInPixelsPerMs * timeSinceLastFrame;
        if(x <= 0) x += fieldWidth*2;
        x %= fieldWidth;
        
        var scrollTransform = (window.scrollY - initialScrollY - initialDistanceFromTop + rowHeight * index) * 0.2;
        
        if(tooltip && vInC == 0) {
            tooltip.style.opacity = (window.scrollY - initialScrollY - initialDistanceFromTop + fieldHeight) * ( 2 / rowHeight );
            tooltip.setAttribute("transform", `translateY(${100 * Math.sin(scrollTransform)})`)
        } else if(tooltip) {
            tooltip.style.opacity = 0;
        }
        
        container.setAttribute("transform", `translate(${x}, ${heightTransform + scrollTransform})`);
        
        lastTimeFrame = t;
        
        requestAnimationFrame(anim);
    });
    
    return function(newRelativeVelocity) {
        vInC = newRelativeVelocity / C_MVU;
    
        vInPixelsPerMs = (vInC * fieldWidth) / 1000;
        x = fieldWidth / 2;
        
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
    if(config.velocity == C_MVU) return makeLightSvg();
    else return makePlanetSvg(config.velocity, config);
}
function makePlanetSvg(v, config) {
    v /= C_MVU;
    
    var size = 1 - v*v;
    
    var colors = {"bob": "#F2E678", "taylor": "#0A8754", "pat": "#CC5803", "allie": "#48ACF0"};
    
    var color = colors[config.name.toLowerCase()] || "#ffffff";
    
    var e = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
    e.setAttribute("rx", size*20);
    e.setAttribute("ry", size*20);
    e.style.fill = color;
    return e;
}
function makeLightSvg() {
    var e = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
    e.setAttribute("rx", 7);
    e.setAttribute("ry", 7);
    e.style.fill = "#ffffff";
    return e;
}