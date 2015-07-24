"use strict";

var gl;

var maxNumPoints = 5000;
var beginDrawing = false;

var index = 0;
var lineStartEnd = [];

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );

    // Set canvas color.
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );
    gl.clear( gl.COLOR_BUFFER_BIT );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 8 * maxNumPoints, gl.STATIC_DRAW);

    canvas.addEventListener("mousedown", function(event) {
      beginDrawing = true;
      var rect = event.target.getBoundingClientRect();
      var x = (event.clientX - rect.left - canvas.width / 2) / (canvas.width / 2);
      var y = (canvas.height / 2  + rect.top - event.clientY) / (canvas.height / 2);

      gl.bufferSubData(gl.ARRAY_BUFFER, 8 * index , flatten(vec2(x, y)));
      index++;
      lineStartEnd.push([index, index]);
    });

    // Note that this event listener is registered on the window because everything time the
    // mouseup event should stop drawing no matter where the mouse is in or out of the canvas.
    window.addEventListener("mouseup", function(event) {
      beginDrawing = false;
    })

    // Note that this event handler is registered on the canvas because only start drawing if the
    // mousedown event is happening when the mouse is in the canvas boundary.
    canvas.addEventListener("mousemove", function(event) {
      var rect = event.target.getBoundingClientRect();
      if (beginDrawing) {
        var x = (event.clientX - rect.left - canvas.width / 2) / (canvas.width / 2);
        var y = (canvas.height / 2  + rect.top - event.clientY) / (canvas.height / 2);

        gl.bufferSubData(gl.ARRAY_BUFFER, 8 * index , flatten(vec2(x, y)));
        index++;
        lineStartEnd[lineStartEnd.length - 1][1] = index;

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
    for (var i = 0; i < lineStartEnd.length; i++)
      gl.drawArrays(gl.LINE_STRIP, lineStartEnd[i][0] - 1, lineStartEnd[i][1] - lineStartEnd[i][0] + 1);
}
