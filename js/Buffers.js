
// WebGL Exploding Teapots: WebGL Buffers
// --------------------------------------
// Author: Dylan Cutler

// This function initializes the WebGLBuffer objects
//   @param gl: WebGLRenderingContext
function initBuffers(gl) {
  return { positions:    gl.createBuffer(),
           offsets:      gl.createBuffer(),
           normals:      gl.createBuffer(),
           randomSeeds:  gl.createBuffer(),
           rotationAxes: gl.createBuffer() };
}

// This function sends data from the model to the
// attribute values in the shader
//   @param gl: WebGLRenderingContext
//   @param shaderProgram: WebGLProgram
//   @param buffers: object returned by initBuffers
//   @param teapots: Teapots object (see Teapots.js)
//   @param index: Number representing which teapot currently being rendered
function sendAttributeData(gl, shaderProgram, buffers, teapots, index) {
  // Sending vertex position data using the array buffer
  var aPosition = gl.getAttribLocation(shaderProgram, 'a_Position');
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.positions);
  gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPosition);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(teapots.vertices), gl.STATIC_DRAW);

  // Sending normal vectors to the GPU
  var aOffset = gl.getAttribLocation(shaderProgram, 'a_Offset');
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.offsets);
  gl.vertexAttribPointer(aOffset, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aOffset);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(teapots.offsets), gl.DYNAMIC_DRAW);

  // Sending normal vectors to the GPU
  var aNormal = gl.getAttribLocation(shaderProgram, 'a_Normal');
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normals);
  gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aNormal);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(teapots.normals), gl.DYNAMIC_DRAW);

  // Sending random numbers to the GPU
  var aRandom = gl.getAttribLocation(shaderProgram, 'a_Random');
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.randomSeeds);
  gl.vertexAttribPointer(aRandom, 1, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aRandom);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(teapots.randomSeeds), gl.DYNAMIC_DRAW);

  // Sending rotation axes to the GPU
  var aAxis = gl.getAttribLocation(shaderProgram, 'a_Axis');
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.rotationAxes);
  gl.vertexAttribPointer(aAxis, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aAxis);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(teapots.rotationAxes), gl.DYNAMIC_DRAW);
}

// Send data from the model to the uniforms in the
// WebGL shader
//   @param gl: WebGLRenderingContext
//   @param shaderProgram: WebGLProgram
//   @param teapots: Teapots object (see Teapots.js)
//   @param index: Number represents which teapot is being rendered
function sendUniformData(gl, shaderProgram, teapots, index) {
  // Camera position
  var eye = { x: 0, y: 1, z: 1.5+2.25*teapots.numTeapots };
  // Sending camera position to GPU
  var cameraPosLocation = gl.getUniformLocation(shaderProgram, 'cameraPos');
  gl.uniform3fv(cameraPosLocation, new Float32Array([eye.x, eye.y, eye.z]));

  // Time since explosion started
  var expTimeLocation = gl.getUniformLocation(shaderProgram, 'expTime');
  gl.uniform1f(expTimeLocation, teapots.explosionTime);

  // Translation matrix for multiple teapots
  var translationMatrix = teapots.getTranslationMatrix(index)
  ,   tMatrixLocation = gl.getUniformLocation(shaderProgram, 'tMatrix');
  gl.uniformMatrix4fv(tMatrixLocation, false, translationMatrix.elements);

  // View matrix
  var viewMatrix = new Matrix4().setLookAt(eye.x, eye.y, eye.z, 0, 0.5, 0, 0, 1, 0)
  ,   vMatrixLocation = gl.getUniformLocation(shaderProgram, 'vMatrix');
  gl.uniformMatrix4fv(vMatrixLocation, false, viewMatrix.elements);

  // Perspective matrix
  var perspectiveMatrix = new Matrix4().setPerspective(45, 1, 0.1, 1000)
  ,   pMatrixLocation = gl.getUniformLocation(shaderProgram, 'pMatrix');
  gl.uniformMatrix4fv(pMatrixLocation, false, perspectiveMatrix.elements);
}
