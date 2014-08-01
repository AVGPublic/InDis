Indis
===========

Description
-----------

Interactive display using nodejs + html5

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
    
animateobject.js
===========   

Description
-----------
html5 2D animation object

Usage
-----------
Include the script:

    <script src = "/js/animateobject.js"></script>


Constructor API: 

    new indisObject(mask, image, bornlive); 
        //mask: using to mask the image showing region, also the object will respond only why
        //      clicking in mask. If mask is null, mask is set to be the image boundary retangle. 
        //image: image (texture) for the object.
        //bornlive: if true, object will be drawn immediately, otherwise user must use something 
        //      like easeIn to begin drawing the object.

Animation Method Current Available:

    indisObject.transFromRectToRect(left1, top1, width1, height1, left2, top2, width2, height2, duration);
	indisObject.transFromRectToRectBounce(left1, top1, width1, height1, left2, top2, width2, height2, duration);
	indisObject.easeIn(duration);
	indisObject.easeOut(duration);
	indisObject.easeInHighlightEaseOut(duration);
	indisObject.breath(duration);
    

AppendChild:

    inDisObject.appendChild(childobject, "independentChild");
        //Independent means none of children's drawing property will inherit from its parent,
        //except for the fact that drawing parent will automatically draw child, and if
        //parent is dead, children are dead too.

Children State Machine:

    //to point a child to animate, one must set the child state, e.g.:
    object.easeIn(50);
    object.setAnimateRootPointer(0);
    object.easeIn(60);
    object.setAnimateRootPointer(1);
    object.easeIn(70);
    object.resetAnimateRootPointer();
    //so the parent and its tow child will ease in in turn
        
Animate and drawing:
    
    function animate()
    {
    	requestAnimationFrame (animate);
    	object.animate();
    	if (object.live)
    	{
    	    object.renderFrameInImageRect(context); 
    	    // or in mask:
        	//object.renderFrameInMaskRect(context);
        }
    }
	
	
