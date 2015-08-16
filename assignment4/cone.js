"use strict";

var canvas;
var gl;

var draw = false;
var numTimesToSubdivide = 1;

// Each cone gets its own program, with its own shaders.
var programs = [];
 
var index = 0;

var pointsArray = [];
var fColor;

var near = -10;
var far = 10;

var radius = 0;

var left = -2.0;
var right = 2.0;
var ytop = 2.0;
var bottom = -2.0;

var xAngle = 0;
var yAngle = 0;
var zAngle = 0;

var xPos = 0;
var yPos = 0;
var zPos = 0;

var scaleFactor = 1;

var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

const red = vec4(1.0, 0.0, 0.0, 1.0);
const black = vec4(0.0, 0.0, 0.0, 1.0);

function triangle(a, b, c) {
     pointsArray.push(a); 
     pointsArray.push(b); 
     pointsArray.push(c);     
     index += 3;
}

function getRandomColor() {
  return vec4(Math.random(), Math.random(), Math.random(), 1);
}

function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {
        var ab = normalize(mix( a, b, 0.5), true);
                                
        divideTriangle( a, ab, c, count - 1 );
        divideTriangle( ab, b, c, count - 1 );
    }
    else { 
        triangle( a, b, c );
    }
}

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    var vxpos = vec4(1, 0.0, 0.0, 1);
    var vxneg = vec4(-1, 0.0, 0.0, 1);
    var vzpos = vec4(0.0, 0.0, 1, 1);
    var vzneg = vec4(0.0, 0.0, -1, 1);
    var vypos = vec4(0.0, 1, 0.0, 1);
    var vcenter = vec4(0.0, 0.0, 0.0, 1.0);

    divideTriangle(vxpos, vzpos, vypos, numTimesToSubdivide);
    divideTriangle(vxpos, vzneg, vypos, numTimesToSubdivide);
    divideTriangle(vxneg, vzpos, vypos, numTimesToSubdivide);
    divideTriangle(vxneg, vzneg, vypos, numTimesToSubdivide);
    divideTriangle(vxpos, vzpos, vcenter, numTimesToSubdivide);
    divideTriangle(vxpos, vzneg, vcenter, numTimesToSubdivide);
    divideTriangle(vxneg, vzpos, vcenter, numTimesToSubdivide);
    divideTriangle(vxneg, vzneg, vcenter, numTimesToSubdivide);

    document.getElementById("draw").onclick = function(event) {
      console.log("draw button clicked");

      //  Load shaders and initialize attribute buffers
      var program = initShaders( gl, "vertex-shader", "fragment-shader" );
      programs.push(program);

      var vBuffer = gl.createBuffer();
      gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
      gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

      program.vPosition = gl.getAttribLocation( program, "vPosition");
      gl.vertexAttribPointer( program.vPosition, 4, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray( program.vPosition);

      program.fColor = gl.getUniformLocation(program, "fColor");
      program.modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
      program.projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

      program.xAngle = xAngle;
      program.yAngle = yAngle;
      program.zAngle = zAngle;
      program.xPos = xPos;
      program.yPos = yPos;
      program.zPos = zPos;
      program.scaleFactor = scaleFactor;

      draw = true;
      render();
    }
    document.getElementById("x-angle-slider").onchange = function(event) {
      console.log("x-angle = " + event.target.value);
      xAngle = event.target.value;
    };
    document.getElementById("y-angle-slider").onchange = function(event) {
      console.log("y-angle = " + event.target.value);
      yAngle = event.target.value;
    };
    document.getElementById("z-angle-slider").onchange = function(event) {
      console.log("z-angle = " + event.target.value);
      zAngle = event.target.value;
    };
    document.getElementById("x-pos-slider").onchange = function(event) {
      console.log("x-pos = " + event.target.value);
      xPos = event.target.value;
    };
    document.getElementById("y-pos-slider").onchange = function(event) {
      console.log("y-pos = " + event.target.value);
      yPos = event.target.value;
    };
    document.getElementById("z-pos-slider").onchange = function(event) {
      console.log("z-pos = " + event.target.value);
      zPos = event.target.value;
    };
    document.getElementById("size-small").onchange = function(event) {
      console.log("size small checked = " + event.target.value);
      scaleFactor = 0.5;
    };
    document.getElementById("size-medium").onchange = function(event) {
      console.log("size medium checked = " + event.target.value);
      scaleFactor = 1;
    };
    document.getElementById("size-large").onchange = function(event) {
      console.log("size large checked = " + event.target.value);
      scaleFactor = 2;
    };

    render();
}


function render() {
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
  if (draw === false) {
    console.log("not draw");
    return;
  }

  // Draw all the cones.
  for (var i = 0; i < programs.length; i++) {
    console.log("process i = " + i);
    processProgram(programs[i]);
  }
}

function processProgram(program) {
    gl.useProgram( program );

    // eye here is essentially at the origin as the radius is 0.
    eye = vec3(0, 0, radius);

    var rotateX = rotate(program.xAngle, 1, 0, 0) // rotate around the x axis.
    var rotateY = rotate(program.yAngle, 0, 1, 0) // rotate around the y axis.
    var rotateZ = rotate(program.zAngle, 0, 0, 1) // rotate around the z axis.

    // angle adjustment.
    program.modelViewMatrix = lookAt(eye, at , up);
    program.modelViewMatrix = mult(rotateX, program.modelViewMatrix);
    program.modelViewMatrix = mult(rotateY, program.modelViewMatrix);
    program.modelViewMatrix = mult(rotateZ, program.modelViewMatrix);

    // position adjustment.
    var tMatrix = translate(program.xPos, program.yPos, program.zPos);
    program.modelViewMatrix = mult(tMatrix, program.modelViewMatrix);
    var scaleMatrix = mat4(program.scaleFactor, 0, 0, 0,
                           0, program.scaleFactor, 0, 0,
                           0, 0, program.scaleFactor, 0,
                           0, 0, 0, 1);
    program.modelViewMatrix = mult(scaleMatrix, program.modelViewMatrix);

    program.projectionMatrix = ortho(left, right, bottom, ytop, near, far);
            
    gl.uniformMatrix4fv( program.modelViewMatrixLoc, false, flatten(program.modelViewMatrix) );
    gl.uniformMatrix4fv( program.projectionMatrixLoc, false, flatten(program.projectionMatrix) );
        

    for( var i=0; i<index; i+=3) {
      // Fill in random colors for the triangles.
      gl.uniform4fv(program.fColor, flatten(getRandomColor()));
      gl.drawArrays( gl.TRIANGLES, i, 3 );

      // Draw the wire frames.
      gl.uniform4fv(program.fColor, flatten(black));
      gl.drawArrays( gl.LINE_LOOP, i, 3 );
    }
}
