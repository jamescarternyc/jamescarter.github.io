//version 3.3.10
// start slingin' some d3 here.
var collision = false;
var collisions = 0;
var highScore = 0;
var enemies = "123456789".split("");
var svg = d3.select('svg');
var width = +svg.attr("width");
var height= +svg.attr("height");
var player= [{'x': 0, 'y': 10}];
var score = 0;

// // creates enemies
// svg.selectAll('circle')
// .data(enemies)
// .enter()
// .append('circle')
// .attr('cx', 200)
// .attr('cy', 200)
// .attr('r', 20)
// .attr('fill', 'red');

//gives enemies random placement
var createRandomLocation = function (){
  var randex = function(max) {
    return Math.floor(Math.random()*max);
  };
  svg.selectAll("circle")
  .data(enemies,function(d) {
    return d;
  })
  .transition()
  .duration(750)
  .attrTween("cx", function(d,i,a) {
    return d3.interpolate(a, randex(width));
  })
  .attrTween("cy", function(d,i,a){
    return d3.interpolate(a, randex(height));
  });
};

//create draggable hero
var drag = d3.behavior.drag()
.on("drag",function(d,i){
  d.x += d3.event.dx;
  d.y += d3.event.dy;
  d3.select(this).attr("transform",function(d,i){
    return "translate(" + [d.x, d.y] + ")";
  });
});

var hero = svg.selectAll('rect')
  .data(player)
  .enter()
  .append('rect')
  .attr('width', 20)
  .attr('height', 20)
  .attr("x", player[0].x)
  .attr("y", player[0].y)
  .attr('fill', 'blue')
  .call(drag);

//on collision, make scree flash
var flashScreen = function () {
  d3.select('.board')
    .style('background', 'lime')
    .transition()
    .delay(50).ease("ease-in")
    .duration(5000)
    .style('background', 'green');
};

//see if enemy is too close to hero
var checkCollision = function(x,y) {
  if (!collision) {
    var threshold = 25;
    var player = hero.data()[0];
    //console.log(x, y)
    var distance = Math.sqrt(Math.pow((10 + player.x - x), 2) + Math.pow((20 + player.y - y), 2)) - 3;
    if (distance <= threshold) {
      if (score > highScore) {
        highScore = score;
        console.log(highScore);
      }
      flashScreen();
      collisions++;
      collision = true;
      score = 0;
      d3.select('.current span').text(score);
      d3.select('.highscore span').text(highScore);
      d3.select('.collisions span').text(collisions);
      setTimeout(function() {collision = false;}, 750);
    }
  }
};

//get cx and cy attributes of enemy circles
var getEnemyPosition = function() {
  if (collision === false) {
    var badGuys = {};
    svg.selectAll('circle')
    .each(function(d,i) {
      badGuys['x' + i] = d3.select(this).attr('cx');
      badGuys['y' + i] = d3.select(this).attr('cy');
    });
    for (var i = 0; i < enemies.length; i++) {
      var x = badGuys['x' + i];
      var y = badGuys['y' + i];
      checkCollision(x,y);
    }
  }
};

//move enemies
setInterval(createRandomLocation,1000);
//monitor enemy positions
d3.timer(getEnemyPosition)
//setInterval(getEnemyPosition, 5);
//increment score continuously
setInterval(function() {
  if (!collision) {
    score++;
    d3.select('.current span').text(score);
  }
}, 25);










