![alt tag](https://github.com/DCtheTall/Exploding_Teapots/blob/master/img/whole_teapot.png)
![alt tag](https://github.com/DCtheTall/Exploding_Teapots/blob/master/img/exploded_teapot.png)
# WebGL Exploding Teapots
WebGL project which renders up to 10 teapot models that explode.
The program also tessellates the low poly model to a smoother one.

The user interface has two sliders which allow users to toggle
number of teapots and how many times the tessellation algorithm is called.

To run, clone the repository then in this directory run an HTTP server
from your command line. Open up localhost on the correct port and the 
project should run.

This application uses the following libraries:
- jQuery v2.1.4
- cuon-matrix.js : Matrix library
- web-gl-loader.js : OBJ parser

#### Side note:
This project was built for a job interview challenge which
explicitly disallowed ES modules, Webpack, Node, and JavaScript
preprocessing dialects.

Refactoring this project to use TypeScript/Babel to be in
line with more modern JS dev practices is on my todos.
