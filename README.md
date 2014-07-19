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
they are compling with vc++ 2010, so may only works in windows
    
static videos are not included in this repository, must be put manually 
into public/video/

external dependence:

jquery, bootstrap, threejs, royalslider(sorry we don't pay), these are 
already included in the reponsitory  

Running
-----------
Run

    node app.js

Use browser and type url:  http://localhost:3000
