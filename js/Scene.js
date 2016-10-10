
// WebGL Exploding Teapots: WebGL Scene object
// -------------------------------------------
// Author: Dylan Cutler
// --------------------


// This function initializes the WebGL scene and
// returns an object with methods to manipulate the
// WebGL scene
//   @param canvas: HTMLCanvasElement the scene is rendered on
//   @param teapot: Teapot model
function buildScene(canvas, teapot) {

  // Initializing WebGL
  var gl = canvas.getContext('webgl')
            || canvas.getContext('experimental-webgl');
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0, 0, 0, 0.5);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);

  // Initializing shaders (see Shaders.js)
  shaderProgram = initShaders(gl);
  if( !shaderProgram === null ) {
    throw new Error("Could not initialize shaders. See error message(s).");
  }

  // Initialize buffers (see Buffers.js)
  var buffers = initBuffers(gl);

  // Initialize Teapot models (see Teapots.js)
  var teapots = initTeapots(teapot);

 // Scene() returns an object which allows
 // main.js to access functions defined in this scope
 // and the teapots object in the scene
 return { teapots:       teapots,
          render:        render.bind(null, gl, buffers, teapots) };
}

// Blow up teapots in the scene

// Render the scene
//   @param gl: WebGLRenderingContext
//   @param buffers: see Buffers.js
//   @param teapots: see Teapots.js
function render(gl, buffers, teapots) {
  if(teapots.exploding) teapots.explode();

  // Clear last frame
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  for(var i = 0; i < teapots.numTeapots; i++) {
    // Sending model data to the GPU
    sendAttributeData(gl, shaderProgram, buffers, teapots);
    sendUniformData(gl, shaderProgram, teapots, i);

    // Draw triangles
    gl.drawArrays(gl.TRIANGLES, 0, teapots.numTriangles);
  }

 // Render next animation frame
 window.requestAnimationFrame(render.bind(null, gl, buffers, teapots));
}
