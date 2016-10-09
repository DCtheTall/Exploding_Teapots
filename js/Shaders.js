
// WebGL Exploding Teapots: Program for initializing shaders
// ---------------------------------------------------------
// Author: Dylan Cutler
// --------------------

// Initialize shader programs
//   @param gl: WebGLRenderingContext renders the scene
function initShaders(gl) {
  var vertexShader = getShader(gl, 'shader-vs')
  ,   fragmentShader = getShader(gl, 'shader-fs');

  if( !vertexShader || !fragmentShader ) {
    console.log("Shaders failed to compile.");
    return null;
  }

  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  if( !gl.getProgramParameter(shaderProgram, gl.LINK_STATUS) ) {
    console.error("Could not initialize shader program.");
    return null;
  }
  gl.useProgram(shaderProgram);

  return shaderProgram;
}


// Get shader program from the document and compile it
//   @param gl: WebGLRenderingContext
//   @param id: string id of shader script in index.html
function getShader(gl, id) {
  var source = document.getElementById(id).textContent
  ,   shader = id === 'shader-vs' ? gl.createShader(gl.VERTEX_SHADER)
                                  : gl.createShader(gl.FRAGMENT_SHADER);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if( !gl.getShaderParameter(shader, gl.COMPILE_STATUS) ) {
    console.error('Shader failed to compile: '+ gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}
