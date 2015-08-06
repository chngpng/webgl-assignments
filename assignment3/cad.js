"use strict";

var canvas;
var gl;

var draw = false;
var geometry = "";
var numTimesToSubdivide = 4;

// All the geometrical objects.
var objects = [];

var index = 0;

var pointsArray = [];
var fColor;

var near = -10;
var far = 10;

var radius = 0;

var left = -4.0;
var right = 4.0;
var ytop = 4.0;
var bottom = -4.0;

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

function processCylinder() {
  var vxposBottom = vec4(1.0, 0.0, 0.0, 1);
  var vxnegBottom = vec4(-1.0, 0.0, 0.0, 1);
  var vzposBottom = vec4(0.0, 0.0, 1.0, 1);
  var vznegBottom = vec4(0.0, 0.0, -1.0, 1);

  var vxposTop = vec4(1.0, 1.0, 0.0, 1);
  var vxnegTop = vec4(-1.0, 1.0, 0.0, 1);
  var vzposTop = vec4(0.0, 1.0, 1.0, 1);
  var vznegTop = vec4(0.0, 1.0, -1.0, 1);

  var vcenterBottom = vec4(0.0, 0.0, 0.0, 1.0);
  var vcenterTop = vec4(0.0, 1.0, 0.0, 1.0);

  divideRectangleForCylinder(vxposBottom, vzposBottom, vcenterBottom, vxposTop, vzposTop, vcenterTop, numTimesToSubdivide);
  divideRectangleForCylinder(vxposBottom, vznegBottom, vcenterBottom, vxposTop, vznegTop, vcenterTop, numTimesToSubdivide);
  divideRectangleForCylinder(vxnegBottom, vzposBottom, vcenterBottom, vxnegTop, vzposTop, vcenterTop, numTimesToSubdivide);
  divideRectangleForCylinder(vxnegBottom, vznegBottom, vcenterBottom, vxnegTop, vznegTop, vcenterTop, numTimesToSubdivide);

}
function processSphere() {
  var vxpos = vec4(1.0, 0.0, 0.0, 1);
  var vxneg = vec4(-1.0, 0.0, 0.0, 1);
  var vypos = vec4(0.0, 1.0, 0.0, 1);
  var vyneg = vec4(0.0, -1.0, 0.0, 1);
  var vzpos = vec4(0.0, 0.0, 1.0, 1);
  var vzneg = vec4(0.0, 0.0, -1.0, 1);

  divideTriangleForSphere(vxpos, vypos, vzpos, numTimesToSubdivide);
  divideTriangleForSphere(vxpos, vypos, vzneg, numTimesToSubdivide);
  divideTriangleForSphere(vxpos, vyneg, vzpos, numTimesToSubdivide);
  divideTriangleForSphere(vxpos, vyneg, vzneg, numTimesToSubdivide);
  divideTriangleForSphere(vxneg, vypos, vzpos, numTimesToSubdivide);
  divideTriangleForSphere(vxneg, vypos, vzneg, numTimesToSubdivide);
  divideTriangleForSphere(vxneg, vyneg, vzpos, numTimesToSubdivide);
  divideTriangleForSphere(vxneg, vyneg, vzneg, numTimesToSubdivide);
}

function processCone() {
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
}

function triangle(a, b, c) {
     pointsArray.push(a); 
     pointsArray.push(b); 
     pointsArray.push(c);     
     index += 3;
}

function getRandomColor() {
  return vec4(Math.random(), Math.random(), Math.random(), 1);
}

function divideRectangleForCylinder(a, b, center1, c, d, center2, count) {
    if ( count > 0 ) {
        var aa = vec4(a[0], 0, a[2], 1.0);
        var bb = vec4(b[0], 0, b[2], 1.0);
        var cc = vec4(c[0], 0, c[2], 1.0);
        var dd = vec4(d[0], 0, d[2], 1.0);

        var ab = normalize(mix( aa, bb, 0.5), true);
        var cd = normalize(mix( cc, dd, 0.5), true);
        ab[1] = a[1];
        cd[1] = c[1];
                                
        divideRectangleForCylinder( a, ab, center1, c, cd, center2, count - 1 );
        divideRectangleForCylinder( ab, b, center1, cd, d, center2, count - 1 );
    }
    else { 
        triangle( a, b, c );
        triangle( c, d, b );
        triangle( a, b, center1);
        triangle( c, d, center2);
    }
}

function divideTriangleForSphere(a, b, c, count) {
    if ( count > 0 ) {
                
        var ab = normalize(mix( a, b, 0.5), true);
        var ac = normalize(mix( a, c, 0.5), true);
        var bc = normalize(mix( b, c, 0.5), true);
                                
        divideTriangleForSphere( a, ab, ac, count - 1 );
        divideTriangleForSphere( ab, b, bc, count - 1 );
        divideTriangleForSphere( bc, c, ac, count - 1 );
        divideTriangleForSphere( ab, bc, ac, count - 1 );
    }
    else { // draw tetrahedron at end of recursion
        triangle( a, b, c );
    }
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

    document.getElementById("draw").onclick = function(event) {
      console.log("draw button clicked");

      //  Load shaders and initialize attribute buffers
      var program = initShaders( gl, "vertex-shader", "fragment-shader" );

      if (geometry === "cone") {
        program.indexStart = index;
        processCone();
        program.indexEnd = index;
      }  else if (geometry === "cylinder") {
        program.indexStart = index;
        processCylinder();
        program.indexEnd = index;
      } else {
        console.log("skip");
        program.indexStart = index;
        processSphere();
        program.indexEnd = index;
      }

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

      // Associate each object with its own program.
      var object = {};
      object.program = program;
      objects.push(object);
      render();
    }
    document.getElementById("cone").onchange = function(event) {
      console.log("geometry checked = " + event.target.value);
      geometry = "cone";
    };
    document.getElementById("sphere").onchange = function(event) {
      console.log("geometry checked = " + event.target.value);
      geometry = "sphere";
    };
    document.getElementById("cylinder").onchange = function(event) {
      console.log("geometry checked = " + event.target.value);
      geometry = "cylinder";
    };
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

  // Draw all the geometries.
  for (var i = 0; i < objects.length; i++) {
    console.log("process object i = " + i);
    processProgram(objects[i].program);
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

    // scale the size.
    var scaleMatrix = mat4(program.scaleFactor, 0, 0, 0,
                           0, program.scaleFactor, 0, 0,
                           0, 0, program.scaleFactor, 0,
                           0, 0, 0, 1);
    program.modelViewMatrix = mult(scaleMatrix, program.modelViewMatrix);

    // position adjustment.
    var tMatrix = translate(program.xPos, program.yPos, program.zPos);
    program.modelViewMatrix = mult(tMatrix, program.modelViewMatrix);

    program.projectionMatrix = ortho(left, right, bottom, ytop, near, far);
            
    gl.uniformMatrix4fv( program.modelViewMatrixLoc, false, flatten(program.modelViewMatrix) );
    gl.uniformMatrix4fv( program.projectionMatrixLoc, false, flatten(program.projectionMatrix) );
        

    for( var i=program.indexStart; i<program.indexEnd; i+=3) {
      // Fill in random colors for the triangles.
      //gl.uniform4fv(program.fColor, flatten(getRandomColor()));
      gl.uniform4fv(program.fColor, flatten(red));
      gl.drawArrays( gl.TRIANGLES, i, 3 );

      // Draw the wire frames.
      gl.uniform4fv(program.fColor, flatten(black));
      gl.drawArrays( gl.LINE_LOOP, i, 3 );
    }
}
