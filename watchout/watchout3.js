//version 3.3.10
//https://github.com/d3/d3-3.x-api-reference/blob/master/API-Reference.md
// start slingin' some d3 here.
//<circle cx="20" cy="20" r="20" fill="red"/>
var collision = false;
var collisions = 0;
var highScore = 0;
var neo = false;
var score = 0;
var enemies = [{'x': 0, 'y': 10}];
var player = enemies[0];
//create 10 enemies
for (var i = 0; i < 10; i++) {
  var thisDude = {
    x: 0,
    y: 0
  };
  enemies.push(thisDude);
}

var svg = d3.select('svg');
var width = +svg.attr("width");
var height= +svg.attr("height");

// creates enemies
svg.selectAll('.asteroid')
.data(enemies.slice(1))
.enter()
.append('image')
.attr('xlink:href','asteroid.png')
.attr('x', function(d){
  console.log(d.x + 'px');
  return d.x;
})
.attr('y', function(d){
  return d.y;
})
.attr('class', 'asteroid')
.attr('height',20)
.attr('width',20);

//gives enemies random placement
var createRandomLocation = function (){
  var randex = function(max) {
    return Math.floor(Math.random()*max);
  };

  svg.selectAll(".asteroid")
  .data(enemies.slice(1))
  .transition()
  .duration(500)
  .attrTween("x", function(d,i,a) {
    //d.x += d3.event.dx;

    return d3.interpolate(a, randex(width));
  })
  .attrTween("y", function(d,i,a){
    //d.y += d3.event.y;
    return d3.interpolate(a, randex(height));
  });
};

setInterval(()=> {
  if (!neo) {
    force.stop();
    createRandomLocation();
  } else {
    gravity();
  }
},1000);


//player.fixed = true;


var drag = d3.behavior.drag()
.on("drag",function(d,i){
  d.x += d3.event.dx;
  d.y += d3.event.dy;
  d3.select(this).attr("transform",function(d,i){
    return "translate(" + [d.x, d.y] + ")";
  });
});

svg.selectAll('rect')
  .data([enemies[0]])
  .enter()
  .append('rect')
  .attr('width', 20)
  .attr('height', 20)
  .attr("x", enemies[0].x)
  .attr("y", enemies[0].y)
  .attr('fill', 'blue')
  .call(drag);


/// example


var checkCollision = function(x,y) {
  if (!collision) {
    var threshold = 25;
    var player = enemies[0];
    //console.log(x, y)
    var distance = Math.sqrt(Math.pow((10 + player.x - x), 2) + Math.pow((20 + player.y - y), 2)) - 3;
    if (distance <= threshold) {
      if (score > highScore) {
        highScore = score;
        console.log(highScore)
      }
      collisions++;
      collision = true;
      score = 0;
      d3.select('.current span').text(score);
      d3.select('.highscore span').text(highScore);
      d3.select('.collisions span').text(collisions);
      setTimeout(function() {collision = false;}, 250);
    }
  }
};

//if collision = false
var getEnemyPosition = function() {
  if (collision === false) {
    var badGuys = {};
    svg.selectAll('.asteroid')
    .each(function(d,i) {
      badGuys['x' + i] = d3.select(this).attr('x');
      badGuys['y' + i] = d3.select(this).attr('y');
    });
    for (var i = 0; i < enemies.length; i++) {
      var x = badGuys['x' + i];
      var y = badGuys['y' + i];
      checkCollision(x,y);
    }
  }
};

setInterval(getEnemyPosition, 5);


setInterval(function() {
  score++;

  d3.select('.current span').text(score);
}, 100);


//Neo mode
//on click neo option
var force = d3.layout.force()
.gravity(0.05)
.charge(function(d, i) { return i ? 0 : -500; })
.nodes(enemies)
.size([width,height]);

function gravity () {
force.start();

force.on('tick', (e) => {
  var q = d3.geom.quadtree(enemies),
      i = 0,
      n = enemies.length;

  while (++i < n) q.visit(collide(enemies[i]));

  svg.selectAll('.asteroid')
    // .transition()
    // .duration(.07)
    .attr('x', (d) => {return d.x})
    .attr('y', (d) => {return d.y});
});

var drag = d3.behavior.drag()
  .on('drag', function () {
    var p1 = d3.mouse(this);
    player.px = p1[0];
    player.py = p1[1];
    force.resume();
  })

function collide(node) {
  var r = node.radius + 16,
      nx1 = node.x - r,
      nx2 = node.x + r,
      ny1 = node.y - r,
      ny2 = node.y + r;
  return function(quad, x1, y1, x2, y2) {
    if (quad.point && (quad.point !== node)) {
      var x = node.x - quad.point.x,
          y = node.y - quad.point.y,
          l = Math.sqrt(x * x + y * y),
          r = node.radius + quad.point.radius;
      if (l < r) {
        l = (l - r) / l * .5;
        node.x -= x *= l;
        node.y -= y *= l;
        quad.point.x += x;
        quad.point.y += y;
      }
    }
    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
  };
}

}




