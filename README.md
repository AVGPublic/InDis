VideoProcServer
===========

Description
-----------

Nodejs video procssing server, using c++ addons for algorithm and html5 for rendering

Install
-----------

Run
    
    npm install
    
c++ addons with their dependent dlls are put in node_modules/videoproc
they are compling with vc++ 2010, so only works in windows
    
static videos are not included in this repository, must be put manually 
into public/video/

external dependence: jquery, threejs, bootstrap, royal slider (sorry we don't pay)

Run
-----------
Use some shell run:

    node app.js

Use some Browser with url localhost:3000
    
    
