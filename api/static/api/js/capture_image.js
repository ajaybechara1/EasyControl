var capture;
var canvas_ab;
var width_ab = 256;
var height_ab = 256;

let sketch = function(p) {
    p.setup = function(){
        canvas_ab = p.createCanvas(width_ab, height_ab);
        capture = p.createCapture(p.VIDEO);
        capture.hide()
    }

    p.draw = function() {
        p.push();
        p.translate(p.width, 0);
        p.scale(-1, 1);
        p.image(capture, 0, 0, width_ab, height_ab);
        // p.filter(p.THRESHOLD, 0.35);
        p.pop();
    }
};

new p5(sketch, 'container');

function capture_image(){
    return canvas_ab.elt.toDataURL();
}
