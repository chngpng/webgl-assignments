"use strict";

var canvas;
var gl;

var points = [];

var numTimesToSubdivide = 5;
var theta = 90;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, 8 * Math.pow(3, 10), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    document.getElementById("slider").onchange = function(event) {
        numTimesToSubdivide = parseInt(event.target.value);
        console.log("value = " + numTimesToSubdivide);
        render();
    };

    document.getElementById("degree_slider").onchange = function(event) {
        theta = parseInt(event.target.value);
        console.log("theta = " + theta);
        render();
    };
    render();
};

function rotateWithTwist(a) {
    // assuming that a is a vec2
    var d = 1.8 * Math.sqrt(a[0] * a[0] + a[1] * a[1]);
    var thetaConverted = theta / 180 * Math.PI;
    var xPrime = a[0] * Math.cos(d * thetaConverted) - a[1] * Math.sin(d * thetaConverted);
    var yPrime = a[0] * Math.sin(d * thetaConverted) + a[1] * Math.cos(d * thetaConverted);
    var aPrime = [xPrime, yPrime];

    points.push(aPrime);
}

function divideTriangle( a, b, c, count )
{

    // check for end of recursion

    if ( count === 0 ) {
        rotateWithTwist(a);
        rotateWithTwist(b);
        rotateWithTwist(c);
    }
    else {

        //bisect the sides

        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        --count;

        // three new triangles

        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );
        divideTriangle( b, bc, ab, count );
        divideTriangle( ab, ac, bc, count );
    }
}

function render()
{
    // First, initialize the corners of our gasket with three points.
    var vertices = [
        vec2( -0.5, -0.5 ),
        vec2(  0,  0.5 ),
        vec2(  0.5, -0.5 )
    ];

    divideTriangle(vertices[0], vertices[1], vertices[2], numTimesToSubdivide);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
    points = [];
}
