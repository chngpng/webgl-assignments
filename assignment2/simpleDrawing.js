"use strict";

var gl;

var delay = 100;
var direction = true;
var beginDrawing = false;

var vertices = [];

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );
    gl.clear( gl.COLOR_BUFFER_BIT );

    console.log("canvas width: " + canvas.width + ", height: " + canvas.height);

    canvas.addEventListener("mousedown", function(event) {
      console.log("mousedown event!");
      beginDrawing = true;
      var rect = event.target.getBoundingClientRect();
      console.log("rect left: " + rect.left + ", right: " + rect.right);
      var x = (event.clientX - rect.left - canvas.width / 2) / (canvas.width / 2);
      var y = (canvas.height / 2  + rect.top - event.clientY) / (canvas.height / 2);

      if (vertices.length > 0) vertices.pop();
      vertices.push(vec2(x, y));
    });

    canvas.addEventListener("mouseup", function(event) {
      console.log("mouseup event!");
      beginDrawing = false;
    });

    canvas.addEventListener("mousemove", function(event) {
      if (beginDrawing) console.log("mousemove event: x: " + event.clientX + ", y: " + event.clientY);
      if (beginDrawing) {
        var rect = event.target.getBoundingClientRect();
        var x = (event.clientX - rect.left - canvas.width / 2) / (canvas.width / 2);
        var y = (canvas.height / 2  + rect.top - event.clientY) / (canvas.height / 2);

        vertices.push(vec2(x, y));
        vertices.push(vec2(x, y));

        var vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
        var vPosition = gl.getAttribLocation( program, "vPosition");
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
        render();
      }
    });

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
};

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.lineWidth(5);
    gl.drawArrays(gl.LINES, 0, vertices.length);
}
