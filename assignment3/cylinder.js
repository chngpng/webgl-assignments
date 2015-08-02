"use strict";

var canvas;
var gl;

var numTimesToSubdivide = 3;
 
var index = 0;

var pointsArray = [];
var fColor;

var near = -10;
var far = 10;
var radius = 6.0;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

var left = -2.0;
var right = 2.0;
var ytop = 2.0;
var bottom = -2.0;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
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

function divideRectangle(a, b, center1, c, d, center2, count) {
    if ( count > 0 ) {
        var aa = vec4(a[0], 0, a[2], 1.0);
        var bb = vec4(b[0], 0, b[2], 1.0);
        var cc = vec4(c[0], 0, c[2], 1.0);
        var dd = vec4(d[0], 0, d[2], 1.0);

        var ab = normalize(mix( aa, bb, 0.5), true);
        var cd = normalize(mix( cc, dd, 0.5), true);
        ab[1] = a[1];
        cd[1] = c[1];
                                
        divideRectangle( a, ab, center1, c, cd, center2, count - 1 );
        divideRectangle( ab, b, center1, cd, d, center2, count - 1 );
    }
    else { 
        triangle( a, b, c );
        triangle( c, d, b );
        triangle( a, b, center1);
        triangle( c, d, center2);
    }
}

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
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

    divideRectangle(vxposBottom, vzposBottom, vcenterBottom, vxposTop, vzposTop, vcenterTop, numTimesToSubdivide);
    divideRectangle(vxposBottom, vznegBottom, vcenterBottom, vxposTop, vznegTop, vcenterTop, numTimesToSubdivide);
    divideRectangle(vxnegBottom, vzposBottom, vcenterBottom, vxnegTop, vzposTop, vcenterTop, numTimesToSubdivide);
    divideRectangle(vxnegBottom, vznegBottom, vcenterBottom, vxnegTop, vznegTop, vcenterTop, numTimesToSubdivide);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( vPosition);

    fColor = gl.getUniformLocation(program, "fColor");
    
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    document.getElementById("Button0").onclick = function(){theta += dr; init()};
    document.getElementById("Button1").onclick = function(){theta -= dr; init()};
    document.getElementById("Button2").onclick = function(){phi += dr; init()};
    document.getElementById("Button3").onclick = function(){phi -= dr; init()};
    
    document.getElementById("Button4").onclick = function(){
        numTimesToSubdivide++; 
        index = 0;
        pointsArray = []; 
        init();
    };
    document.getElementById("Button5").onclick = function(){
        if(numTimesToSubdivide) numTimesToSubdivide--;
        index = 0;
        pointsArray = []; 
        init();
    };
    render();
}


function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    eye = vec3(radius*Math.sin(theta)*Math.cos(phi), 
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
            
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

    for( var i=0; i<index; i+=3) {
      //gl.uniform4fv(fColor, flatten(getRandomColor()));
      //gl.drawArrays( gl.TRIANGLES, i, 3 );

      gl.uniform4fv(fColor, flatten(black));
      gl.drawArrays( gl.LINE_LOOP, i, 3 );
    }

    //window.requestAnimFrame(render);


}
