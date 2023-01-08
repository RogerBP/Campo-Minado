var game;

function setup() {
  createCanvas(windowWidth, windowHeight);
  game = new CampoMinado();
}

function draw() {
  game.update();
  game.render();
}

function mousePressed() {
  game.click({
    x: mouseX,
    y: mouseY
  });
}