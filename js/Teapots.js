
// WebGL Exploding Teapots: Teapots
// --------------------------------
// Author: Dylan Cutler
// --------------------

// TO DO: Tessellation

// This function loads the teapot model and returns
// an object which stores model data for the teapot mesh
//   @param teapot: Teapot model
function initTeapots(teapot) {

  // TO DO: convert what's in OBJ into a format for drawing triangles
  var vertices = []
  ,   normals = [];
  teapot.indices.map(function(current) {
    for(var i = 0; i < 3; i++) {
      vertices.push(teapot.vertices[3*current+i]);
      normals.push(teapot.vertexNormals[3*current+i]);
    }
  });

  // Creating offset vectors for explosion
  var offsets = getOffsets(vertices)
  // Random numbers for visual effect in the explosion
  var randomSeeds = getRandomSeeds(vertices);
  // Getting axis of rotation for fragments
  var rotationAxes = getRotationAxes(vertices, offsets);

  // This function returns an object
  return { numTeapots:           1,
           getTranslationMatrix: getTranslationMatrix,
           // Explosion
           exploding:            false,
           explosionStart:       null,
           explode:              explode,
           explosionTime:        0,
           // Tessellation
           tessellations:        0,
           tessellate:           tessellate,
           origVertices:         vertices,
           origNormals:          normals,
           // Information for GPU
           numTriangles:         vertices.length/3,
           vertices:             vertices,
           normals:              normals,
           offsets:              offsets,
           randomSeeds:          randomSeeds,
           rotationAxes:         rotationAxes };
}

// This function calculates the offset vectors
// for each polygon for the explosion animation
//   @param vertices: array of the mesh's vertices
function getOffsets(vertices) {
  var offsets = [];
  for(var i = 0; i < vertices.length/18; i++ ) {
    var polyVerts = [[], [], [], [], [], []];
    for(var j = 0; j < 18; j++)
      polyVerts[ Math.floor(j/3) ].push( vertices[18*i+j] );
    // Polygon case
    if( polyVerts[0][0] === polyVerts[3][0] && polyVerts[2][0] === polyVerts[4][0] ) {
      var polygon = [[],[],[],[],[],[]];
      for(var j = 0; j < 18; j++) polygon[ Math.floor(j/3) ].push( vertices[18*i+j] );
      var offset = polygon.reduce(function(prev, curr) {
        for(k in curr) prev[k] += curr[k] / 6;
        return prev;
      }, [0, 0, 0]);
      for(var j = 0; j < 18; j++) offsets.push( offset[j % 3] );
    }
    else { // Triangle case
      var triangle = [[], [], []];
      for(var j = 0; j < 9; j++) triangle[ Math.floor(j/3) ].push( vertices[18*i+j] );
      var offset = triangle.reduce(function(prev, curr) {
        for(k in curr) prev[k] += curr[k] / 3;
        return prev;
      }, [0, 0, 0]);
      for(var j = 0; j < 9; j++) offsets.push( offset[j % 3] );
      triange = [[], [], []];
      for(var j = 0; j < 9; j++) triangle[ Math.floor(j/3) ].push( vertices[18*i+j+9] );
      var offset = triangle.reduce(function(prev, curr) {
        for(k in curr) prev[k] += curr[k] / 3;
        return prev;
      }, [0, 0, 0]);
      for(var j = 0; j < 9; j++) offsets.push( offset[j % 3] );
      triange = [[], [], []];
    }
  }
  return offsets;
}

// This function returns an array of random floats to
// add randomness to the explosions
//   @param vertices: array of the mesh's vertices
function getRandomSeeds(vertices) {
  var randomSeeds = [];
  for(var i = 0; i < vertices.length/18; i++) {
    var seed = Math.random();
    randomSeeds.push(seed, seed, seed, seed, seed, seed);
  }
  return randomSeeds;
}

// This function returns an array of vectors that are
// used as the axis of rotation for the fragments
function getRotationAxes(vertices, offsets) {
  var axes = [];
  for(var i = 0; i < vertices.length/18; i++) {
    var axis = [ vertices[18*i]-offsets[18*i],
                 vertices[18*i+1]-offsets[18*i+1],
                 vertices[18*i+2]-offsets[18*i+2] ];
    // Polygon case
    for(var j = 0; j < 6; j++) axes.push.apply(axes, axis);
  }
  return axes;
}

// This function returns a Matrix4 which
// translates the teapots over when we
// add more teapots to the scene
//   @param index: Number representing which teapot is being translated
function getTranslationMatrix(index) {
  var x = this.numTeapots % 2 === 0 ? index % 2 === 0 ? (index+1)
                                                      : -index
                                    : index % 2 === 0 ? index
                                                      : -2*(Math.floor(index/2)+1);
  return new Matrix4().setIdentity().translate(x, 0, 0);
}

// This funciton starts the teapot explosion
function explode() {
  if( !this.explosionStart ) this.explosionStart = new Date().getTime();
  this.explosionTime = (new Date().getTime()) - this.explosionStart;
  if(this.explosionTime >= 3000) {
    this.explosionStart = null;
    this.explosionTime = 0;
    this.exploding = false;
  }
}

// This function tessellates the triangles in the mesh
// into 4 coplanar triangles for each iteration
//   @param n: Number of iterations of the tessellation
function tessellate(n) {
  // If n is zero, reset the mesh to normal
  if( n === 0 ) {
    this.vertices = this.origVertices;
    this.normals = this.origNormals;
    this.offsets = getOffsets(this.vertices);
    return;
  }

  var vertices = this.origVertices
  ,   normals = this.origNormals;

  // This function takes 2 arrays of three numbers and returns a new
  // array whose elements are the average of the two inputs
  function addVecsEqually(v1, v2) {
    var output = [];
    for(var i = 0; i < 3; i++) {
      output.push(v1[i]/2 + v2[i]/2);
    }
    return output;
  }

  // This function takes polygon vertices or normals and
  // returns a linear combination of them for the center
  // point of a tessellated polygon
  function linearCombo(points) {
    var output = [0, 0, 0];
    for(var i = 0; i < 3; i++) {
      output[i] += 3 * points[0][i] / 8;
      output[i] += points[1][i] / 8;
      output[i] += 3 * points[2][i] / 8;
      output[i] += points[5][i] / 8;
    }
    return output;
  }

  while( n > 0 ) {
     var newVertices = []
     ,   newNormals = [];

    // For loop iterates over each polygon in the vertex array
    for(var i = 0; i < vertices.length/18; i++) {
      var polyVerts = [[], [], [], [], [], []]
      ,   polyNorms = [[], [], [], [], [], []];

      for(var j = 0; j < 18; j++) {
        polyVerts[ Math.floor(j/3) ].push( vertices[18*i+j] );
        polyNorms[ Math.floor(j/3) ].push( normals[18*i+j] );
      }

      // Polygon case
      if( polyVerts[0][0] === polyVerts[3][0] && polyVerts[2][0] === polyVerts[4][0] ) {
        // First new polygon
        newVertices.push.apply(newVertices, addVecsEqually(polyVerts[0], polyVerts[1]));
        newVertices.push.apply(newVertices, polyVerts[1]);
        newVertices.push.apply(newVertices, addVecsEqually(polyVerts[2], polyVerts[1]));
        newVertices.push.apply(newVertices, addVecsEqually(polyVerts[0], polyVerts[1]));
        newVertices.push.apply(newVertices, addVecsEqually(polyVerts[2], polyVerts[1]));
        newVertices.push.apply(newVertices, linearCombo(polyVerts));
        newNormals.push.apply(newNormals, addVecsEqually(polyNorms[0], polyNorms[1]));
        newNormals.push.apply(newNormals, polyNorms[1]);
        newNormals.push.apply(newNormals, addVecsEqually(polyNorms[2], polyNorms[1]));
        newNormals.push.apply(newNormals, addVecsEqually(polyNorms[0], polyNorms[1]));
        newNormals.push.apply(newNormals, addVecsEqually(polyNorms[2], polyNorms[1]));
        newNormals.push.apply(newNormals, linearCombo(polyNorms));

        // Second new polygon
        newVertices.push.apply(newVertices, polyVerts[0]);
        newVertices.push.apply(newVertices, addVecsEqually(polyVerts[0], polyVerts[1]));
        newVertices.push.apply(newVertices, linearCombo(polyVerts));
        newVertices.push.apply(newVertices, polyVerts[0]);
        newVertices.push.apply(newVertices, linearCombo(polyVerts));
        newVertices.push.apply(newVertices, addVecsEqually(polyVerts[3], polyVerts[5]));
        newNormals.push.apply(newNormals, polyNorms[0]);
        newNormals.push.apply(newNormals, addVecsEqually(polyNorms[0], polyNorms[1]));
        newNormals.push.apply(newNormals, linearCombo(polyNorms));
        newNormals.push.apply(newNormals, polyNorms[0]);
        newNormals.push.apply(newNormals, linearCombo(polyNorms));
        newNormals.push.apply(newNormals, addVecsEqually(polyNorms[3], polyNorms[5]));

        // Third new polygon
        newVertices.push.apply(newVertices, linearCombo(polyVerts));
        newVertices.push.apply(newVertices, addVecsEqually(polyVerts[2], polyVerts[1]));
        newVertices.push.apply(newVertices, polyVerts[2]);
        newVertices.push.apply(newVertices, linearCombo(polyVerts));
        newVertices.push.apply(newVertices, polyVerts[2]);
        newVertices.push.apply(newVertices, addVecsEqually(polyVerts[2], polyVerts[5]));
        newNormals.push.apply(newNormals, linearCombo(polyNorms));
        newNormals.push.apply(newNormals, addVecsEqually(polyNorms[2], polyNorms[1]));
        newNormals.push.apply(newNormals, polyNorms[2]);
        newNormals.push.apply(newNormals, linearCombo(polyNorms));
        newNormals.push.apply(newNormals, polyNorms[2]);
        newNormals.push.apply(newNormals, addVecsEqually(polyNorms[2], polyNorms[5]));

        // Fourth new polygon
        newVertices.push.apply(newVertices, addVecsEqually(polyVerts[3], polyVerts[5]));
        newVertices.push.apply(newVertices, linearCombo(polyVerts));
        newVertices.push.apply(newVertices, addVecsEqually(polyVerts[2], polyVerts[5]));
        newVertices.push.apply(newVertices, addVecsEqually(polyVerts[3], polyVerts[5]));
        newVertices.push.apply(newVertices, addVecsEqually(polyVerts[2], polyVerts[5]));
        newVertices.push.apply(newVertices, polyVerts[5]);
        newNormals.push.apply(newNormals, addVecsEqually(polyNorms[3], polyNorms[5]));
        newNormals.push.apply(newNormals, linearCombo(polyNorms));
        newNormals.push.apply(newNormals, addVecsEqually(polyNorms[2], polyNorms[5]));
        newNormals.push.apply(newNormals, addVecsEqually(polyNorms[3], polyNorms[5]));
        newNormals.push.apply(newNormals, addVecsEqually(polyNorms[2], polyNorms[5]));
        newNormals.push.apply(newNormals, polyNorms[5]);
      }
      else { // Triangle case
        // Tessellating the first triangle
        newVertices.push.apply(newVertices, addVecsEqually(polyVerts[0], polyVerts[1]));
        newVertices.push.apply(newVertices, polyVerts[0]);
        newVertices.push.apply(newVertices, addVecsEqually(polyVerts[0], polyVerts[2]));
        newVertices.push.apply(newVertices, addVecsEqually(polyVerts[0], polyVerts[1]));
        newVertices.push.apply(newVertices, addVecsEqually(polyVerts[0], polyVerts[2]));
        newVertices.push.apply(newVertices, addVecsEqually(polyVerts[1], polyVerts[2]));
        newVertices.push.apply(newVertices, addVecsEqually(polyVerts[1], polyVerts[2]));
        newVertices.push.apply(newVertices, addVecsEqually(polyVerts[0], polyVerts[2]));
        newVertices.push.apply(newVertices, polyVerts[2]);
        newVertices.push.apply(newVertices, addVecsEqually(polyVerts[0], polyVerts[1]));
        newVertices.push.apply(newVertices, addVecsEqually(polyVerts[1], polyVerts[2]));
        newVertices.push.apply(newVertices, polyVerts[1]);
        newNormals.push.apply(newNormals, addVecsEqually(polyNorms[0], polyNorms[1]));
        newNormals.push.apply(newNormals, polyNorms[0]);
        newNormals.push.apply(newNormals, addVecsEqually(polyNorms[0], polyNorms[2]));
        newNormals.push.apply(newNormals, addVecsEqually(polyNorms[0], polyNorms[1]));
        newNormals.push.apply(newNormals, addVecsEqually(polyNorms[0], polyNorms[2]));
        newNormals.push.apply(newNormals, addVecsEqually(polyNorms[1], polyNorms[2]));
        newNormals.push.apply(newNormals, addVecsEqually(polyNorms[1], polyNorms[2]));
        newNormals.push.apply(newNormals, addVecsEqually(polyNorms[0], polyNorms[2]));
        newNormals.push.apply(newNormals, polyNorms[2]);
        newNormals.push.apply(newNormals, addVecsEqually(polyNorms[0], polyNorms[1]));
        newNormals.push.apply(newNormals, addVecsEqually(polyNorms[1], polyNorms[2]));
        newNormals.push.apply(newNormals, polyNorms[1]);

        // Tessellating second triangle
        newVertices.push.apply(newVertices, addVecsEqually(polyVerts[3], polyVerts[4]));
        newVertices.push.apply(newVertices, polyVerts[3]);
        newVertices.push.apply(newVertices, addVecsEqually(polyVerts[3], polyVerts[5]));
        newVertices.push.apply(newVertices, addVecsEqually(polyVerts[3], polyVerts[4]));
        newVertices.push.apply(newVertices, addVecsEqually(polyVerts[3], polyVerts[5]));
        newVertices.push.apply(newVertices, addVecsEqually(polyVerts[4], polyVerts[5]));
        newVertices.push.apply(newVertices, addVecsEqually(polyVerts[4], polyVerts[5]));
        newVertices.push.apply(newVertices, addVecsEqually(polyVerts[3], polyVerts[5]));
        newVertices.push.apply(newVertices, polyVerts[5]);
        newVertices.push.apply(newVertices, addVecsEqually(polyVerts[3], polyVerts[4]));
        newVertices.push.apply(newVertices, addVecsEqually(polyVerts[4], polyVerts[5]));
        newVertices.push.apply(newVertices, polyVerts[4]);
        newNormals.push.apply(newNormals, addVecsEqually(polyNorms[3], polyNorms[4]));
        newNormals.push.apply(newNormals, polyNorms[3]);
        newNormals.push.apply(newNormals, addVecsEqually(polyNorms[3], polyNorms[5]));
        newNormals.push.apply(newNormals, addVecsEqually(polyNorms[3], polyNorms[4]));
        newNormals.push.apply(newNormals, addVecsEqually(polyNorms[3], polyNorms[5]));
        newNormals.push.apply(newNormals, addVecsEqually(polyNorms[4], polyNorms[5]));
        newNormals.push.apply(newNormals, addVecsEqually(polyNorms[4], polyNorms[5]));
        newNormals.push.apply(newNormals, addVecsEqually(polyNorms[3], polyNorms[5]));
        newNormals.push.apply(newNormals, polyNorms[5]);
        newNormals.push.apply(newNormals, addVecsEqually(polyNorms[3], polyNorms[4]));
        newNormals.push.apply(newNormals, addVecsEqually(polyNorms[4], polyNorms[5]));
        newNormals.push.apply(newNormals, polyNorms[4]);
      }
    }
    // Update vertex and normals array
    vertices = newVertices;
    normals = newNormals;
    // Decrease n and tessellate again
    n--;
  }

  // Changing the vertices of the teapot to the tessellated vertices
  this.vertices = vertices;
  this.normals = normals;
  this.offsets = getOffsets(vertices);
  this.randomSeeds = getRandomSeeds(vertices);
  this.rotationAxes = getRotationAxes(vertices, this.offsets);
  this.numTriangles = vertices.length/3;
}
