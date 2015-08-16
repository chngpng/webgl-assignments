"use strict";

var canvas;
var gl;

var numTimesToSubdivide = 3;
 
var index = 0;

var pointsArray = [];
var normalsArray = [];
//var fColor;

var near = -10;
var far = 10;
var radius = 6.0;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 20.0;

var ambientColor, diffuseColor, specularColor;
var modelView, projection;
var viewerPos;

var left = -2.0;
var right = 2.0;
var ytop = 2.0;
var bottom = -2.0;

var modelViewMatrix, projectionMatrix, normalMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;
var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

const red = vec4(1.0, 0.0, 0.0, 1.0);
const black = vec4(0.0, 0.0, 0.0, 1.0);

function triangle(a, b, c) {
     pointsArray.push(a); 
     pointsArray.push(b); 
     pointsArray.push(c);     

     // normals are vectors
     
     normalsArray.push(a[0],a[1], a[2], 0.0);
     normalsArray.push(b[0],b[1], b[2], 0.0);
     normalsArray.push(c[0],c[1], c[2], 0.0);

     index += 3;
}

function getRandomColor() {
  return vec4(Math.random(), Math.random(), Math.random(), 1);
}

function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {
                
        var ab = normalize(mix( a, b, 0.5), true);
        var ac = normalize(mix( a, c, 0.5), true);
        var bc = normalize(mix( b, c, 0.5), true);
                                
        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else { // draw tetrahedron at end of recursion
        triangle( a, b, c );
    }
}

function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
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
    
    var vxpos = vec4(1.0, 0.0, 0.0, 1);
    var vxneg = vec4(-1.0, 0.0, 0.0, 1);
    var vypos = vec4(0.0, 1.0, 0.0, 1);
    var vyneg = vec4(0.0, -1.0, 0.0, 1);
    var vzpos = vec4(0.0, 0.0, 1.0, 1);
    var vzneg = vec4(0.0, 0.0, -1.0, 1);

    divideTriangle(vxpos, vypos, vzpos, numTimesToSubdivide);
    divideTriangle(vxpos, vypos, vzneg, numTimesToSubdivide);
    divideTriangle(vxpos, vyneg, vzpos, numTimesToSubdivide);
    divideTriangle(vxpos, vyneg, vzneg, numTimesToSubdivide);
    divideTriangle(vxneg, vypos, vzpos, numTimesToSubdivide);
    divideTriangle(vxneg, vypos, vzneg, numTimesToSubdivide);
    divideTriangle(vxneg, vyneg, vzpos, numTimesToSubdivide);
    divideTriangle(vxneg, vyneg, vzneg, numTimesToSubdivide);

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( vPosition);

    //fColor = gl.getUniformLocation(program, "fColor");
    
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );

    //viewerPos = vec3(0.0, 0.0, -20.0 );
    viewerPos = vec3(0.0, 0.0, -10.0 );

    //projection = ortho(-1, 1, -1, 1, -100, 100);
    
    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
       flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
       flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), 
       flatten(specularProduct) );	
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), 
       flatten(lightPosition) );
       
    gl.uniform1f(gl.getUniformLocation(program, 
       "shininess"),materialShininess);
    
    //gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),
    //   false, flatten(projection));

    document.getElementById("Button0").onclick = function(){theta += dr; init()};
    document.getElementById("Button1").onclick = function(){theta -= dr; init()};
    document.getElementById("Button2").onclick = function(){phi += dr; init()};
    document.getElementById("Button3").onclick = function(){phi -= dr; init()};
    
    document.getElementById("Button4").onclick = function(){
        numTimesToSubdivide++; 
        index = 0;
        pointsArray = []; 
        normalsArray = [];
        init();
    };
    document.getElementById("Button5").onclick = function(){
        if(numTimesToSubdivide) numTimesToSubdivide--;
        index = 0;
        pointsArray = []; 
        normalsArray = [];
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

    // normal matrix only really need if there is nonuniform scaling
    // it's here for generality but since there is
    // no scaling in this example we could just use modelView matrix in shaders
    normalMatrix = [
        vec3(modelViewMatrix[0][0], modelViewMatrix[0][1], modelViewMatrix[0][2]),
        vec3(modelViewMatrix[1][0], modelViewMatrix[1][1], modelViewMatrix[1][2]),
        vec3(modelViewMatrix[2][0], modelViewMatrix[2][1], modelViewMatrix[2][2])
    ];
            
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix) );

    for( var i=0; i<index; i+=3) {
      //gl.uniform4fv(fColor, flatten(getRandomColor()));
      gl.drawArrays( gl.TRIANGLES, i, 3 );

      //gl.uniform4fv(fColor, flatten(black));
      //gl.drawArrays( gl.LINE_LOOP, i, 3 );
    }

    //window.requestAnimFrame(render);


}
