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

ONLINE DEMO COMING SOON

The tessellation algorithm still needs work. Right now it essentially just
refines the resolution of the shading. Not satisfactory.

Referring here on how to tessellate: http://courses.cms.caltech.edu/cs171/assignments/hw5/hw5-notes/notes-hw5.html#NotesSection2
