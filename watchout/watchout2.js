//version 3.3.10
//https://github.com/d3/d3-3.x-api-reference/blob/master/API-Reference.md
// start slingin' some d3 here.
//<circle cx="20" cy="20" r="20" fill="red"/>
var collision = false;
var collisions = 0;
var highScore = 0;
var neo = false;
var heroVisible = false;
var asteroids = 'asteroid.png';
var score = 0;
var enemies = [{'x': 0, 'y': 10}];
var player = enemies[0];
var svg = d3.select('svg');
var width = +svg.attr("width");
var height= +svg.attr("height");

d3.select(".scoreboard").style({
  opacity: "0"
})

function initialize (choice) {
  d3.select(".buttons").remove();
  var pill = choice.toLowerCase();
  if (pill ==="red") {
    neoMode()
    d3.select(".scoreboard").style({
  opacity: "1"
})
  } else {
    toggleHero();
    d3.select(".scoreboard").style({
  opacity: "1"
})
  }

}

function neoMode () {
  neo = true;
  if (neo) {
    heroVisible= false;
    asteroids = 'mrSmith1.png';
    svg.selectAll('.asteroid')
    .remove();
    svg.selectAll('rect').style("opacity", '0');
    createEnemies(500);
    d3.select('body')
    .transition()
    .duration(2000)
    .ease("ease-in")
    .style({
      'background-color': '#c0392b',
    })
    gravity();
  } else {
    svg.selectAll('rect').style("opacity", '1');
    force.stop();
    svg.on('mousemove', null);
    d3.select('.mouse')
    .style('z-index', '-20');
    asteroids = 'asteroid.png';
    svg.selectAll('.asteroid')
    .remove();
    createEnemies(10);

  }
}

// creates enemies
var createEnemies = (num) => {
  enemies.splice(1, enemies.length-1);
  for (var i = 0; i < num; i++) {
  var thisDude = {
    x: 0,
    y: 0
  };
  enemies.push(thisDude);
}
  svg.selectAll('.asteroid')
  .data(enemies.slice(1))
  .enter()
  .append('image')
  .attr('xlink:href',asteroids)
  .attr('x', function(d){
    return d.x;
  })
  .attr('y', function(d){
    return d.y;
  })
  .attr('class', 'asteroid')
  .attr('height',40)
  .attr('width',40);
}

// if(!neo) {
//   createEnemies(10);
// }
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
    return d3.interpolate(a, randex(width));
  })
  .attrTween("y", function(d,i,a){
    return d3.interpolate(a, randex(height));
  });
};

setInterval(function () {
  if (!neo) {
    asteroids = 'asteroid.png'
    createRandomLocation();
  }
} ,1000);


var drag = d3.behavior.drag()
.on("drag",function(d,i){
  d.x += d3.event.dx;
  d.y += d3.event.dy;
  d3.select(this).attr("transform",function(d,i){
    return "translate(" + [d.x, d.y] + ")";
  });
});


var hero = svg.selectAll('rect')
  .data([enemies[0]])
  .enter()
  .append('rect')
  .attr('width', 20)
  .attr('height', 20)
  .attr("x", enemies[0].x)
  .attr("y", enemies[0].y)
  .attr('fill', 'blue')
  .style('opacity','0')
  .call(drag);

var toggleHero = function (){
  neo = false;
  heroVisible = true;
  force.stop()
  d3.select('body')
  .transition()
  .duration(2000)
  .ease("ease-in")
  .style('background-color', '#3498db')
  if (heroVisible) {
    svg.selectAll('rect').style("opacity", '1');
    svg.on('mousemove', null);
    d3.select('.mouse')
    .style('z-index', '-20');
    asteroids = 'asteroid.png';
    svg.selectAll('.asteroid')
    .remove();
    createEnemies(10);
  }
  
}

/// example
//on collision, make scree flash
var flashScreen = function () {
  d3.select('.board')
    .style('background', '#c0392b')
    .transition()
    .delay(100)
    .duration(150)
    .style('background', '#3498db');
};

//see if enemy is too close to hero
var checkCollision = function(x,y) {
  if (!collision) {
    var threshold = 25;
    var player = hero.data()[0];
    //console.log(x, y)
    var distance = Math.sqrt(Math.pow((10 + player.x - x), 2) + Math.pow((20 + player.y - y), 2)) - 3;
    if (distance <= threshold) {
      // if (score > highScore) {
      //   highScore = score;
      // }
      if (!neo) {
        flashScreen();
      }
      collisions++;
      collision = true;
      score = 0;
      // d3.select('.current span').text(score);
      // d3.select('.highscore span').text(highScore);
      d3.select('.collisions span').text(collisions);
      setTimeout(function() {collision = false;}, 750);
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

d3.timer(getEnemyPosition);


setInterval(function() {
  highScore = Math.max(score, highScore);
  score++;

  d3.select('.current span').text(score);
  d3.select('.highscore span').text(highScore);
}, 100);


//Neo mode
//on click neo option
    var mouse = {x: 325, y:200};
    enemies[0] = mouse;

    // mouse = mouse[0];
    mouse.fixed = true;
    //neo shows up now, added him in css
    var force = d3.layout.force()
    .gravity(0.05)
    .charge(function(d, i) { return i ? 0 : -2000; })
    .nodes(enemies)
    .size([width,height]);

function gravity () {
      d3.select('.mouse')
      .style({
        top: mouse.y + 'px',
        left: mouse.x + 'px',
        width: '20px',
        height: '40px',
        'z-index': 20
      })

    force.start();

    force.on('tick', (e) => {
      var q = d3.geom.quadtree(enemies),
          i = 0,
          n = enemies.length;

      while (++i < n) q.visit(collide(enemies[i]));

      svg.selectAll('.asteroid')
        //.data(enemies.slice(1))
        .attr('x', (d) => {return d.x})
        .attr('y', (d) => {return d.y});
    });

      svg.on('mousemove', function () {
        var loc = d3.mouse(this);
        //mouse = { x: loc[0] - 10, y: loc[1] - 20 };
        d3.select('.mouse')
        .style({
          top: mouse.y - 20 + 'px',
          left: mouse.x - 10 + 'px'
        })

        mouse.px = loc[0];
        mouse.py = loc[1];
        force.resume();
      })

    function collide(node) {
      var r = 10 + 16,
          nx1 = node.x - r,
          nx2 = node.x + r,
          ny1 = node.y - r,
          ny2 = node.y + r;
      return function(quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== node)) {
          var x = node.x - quad.point.x,
              y = node.y - quad.point.y,
              l = Math.sqrt(x * x + y * y),
              r = 10 + 10;
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




