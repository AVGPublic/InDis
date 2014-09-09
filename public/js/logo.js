/*jslint browser:true, devel:true, white:true, vars:true, eqeq:true */
/*global THREE:false, requestAnimationFrame:false*/

/*
 * Based on http://threejs.org/examples/canvas_geometry_cube.html
 */
function caculateposition(progress, startpos, endpos, rand_num1)
{
    var curpos = new THREE.Vector3();
    x1 = startpos.x; y1 = startpos.y;
    x2 = endpos.x - startpos.x; y2 = endpos.y - startpos.y;
 
    m = 350;
    
    _a = x2*x2;
    _b = -4*m*x2;
    _c = 4*y2*m;
    
    b = (-_b - Math.sqrt(_b*_b - 4*_a*_c))/(2*_a);
    a = b*b/(-4*m);
    if ( Math.abs(-b/(2.0*a)) > Math.abs(x2))
    {
        b = (-_b + Math.sqrt(_b*_b - 4*_a*_c))/(2*_a);
        a = b*b/(-4*m);
    }
    c = 0;
    
    if (progress < 0.8)
    {
        p = progress/0.8;
        x = p*(x2 - x1);
        curpos.x = x + x1;
        curpos.y = a*x*x + b*x + c + y1;
        curpos.z = startpos.z + p*(endpos.z - startpos.z);
    }
    else
    {
        p = (progress - 0.8)/0.2;
        if (p > 0.5)
        {
            p = 1 - p;
        }
        curpos.x = endpos.x + 0;
        curpos.y = endpos.y + rand_num1*p;
        curpos.z = endpos.z;
    }
    return curpos;
}

document.addEventListener ('DOMContentLoaded', function () {
    //
	var fgCanvas;
	var bufferCanvas1;
	var bufferCanvas2;
	//
    var particle;
    var particles = [];
    var start_particle = false;
	var particle_started = false;
	var tween0 = [];
	var tween1 = [];
	var tween2 = [];
    //
    var rand_bound = new Array(20, 30, 100, 30, 50, 20, 30); 
    var start_position = [];
	var middle_position = [];
    var end_position = [];
    var start_time = [];
    var object_timer = [];
    var object_lifetime = [];
    var texts = [];
    var start_open = false;
    var velocity = 0;
    var planes = [];
    var camera, scene, renderer;
    var group1;
    var subgroup1, subgroup2;
	var cube, plane;

	var targetRotation = 0;
	var targetRotationOnMouseDown = 0;

	var mouseX = 0;
	var mouseXOnMouseDown = 0;

	var windowHalfX = window.innerWidth / 2;
	var windowHalfY = window.innerHeight / 2;
    
    var auto_timer = 0;
	//
	var video_rgb, video_alpha;
	//
    init();
    animate();
    
    function init() {
		//video_rgb = document.getElementById('video_rgb'); 
		//video_alpha = document.getElementById('video_alpha'); 
		//
		//
        renderer = new THREE.CanvasRenderer( { antialias: true, devicePixelRatio: 1 } );
        renderer.setSize (window.innerWidth, window.innerHeight);
        document.getElementById('canvasdiv').appendChild (renderer.domElement);
           
        camera = new THREE.PerspectiveCamera (
            45, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.y = 100;
        camera.position.z = 500;
        
        scene = new THREE.Scene();
        //
        var te = THREE.ImageUtils.loadTexture ('textures/sprite.png');
        var material = new THREE.SpriteMaterial( {
            map:te,
            transparent: true,
        });
		for (var i = 0; i < 100; i++)
		{
			particles[i] = new THREE.Sprite( material);
			scene.add(particles[i]);
				
			particles[i].position.set( 0, 100, 0 )
			particles[i].scale.x = particles[i].scale.y = 0.16;
			
			particles[i].material.opacity = 0.0;
			
			var ranx = Math.random()*200 - 100;
			if (ranx > 0)
			{
				var rany = ranx + Math.random()*600;
			}
			else
			{
				var rany = -ranx + Math.random()*600;
			}
			tween1[i] = new TWEEN.Tween( particles[i].position )
			.delay( i*15 )
			.to( { x: ranx, y: rany, z: Math.random() * 100 - 50 }, 1500);

			tween2[i] = new TWEEN.Tween( particles[i].scale )
				.delay( i*15 )
				.to( { x: 0, y: 0, z: 0}, 1500 );				
		}
		//
        var s = 'V-MEDIA';
        var text_texture = [];
        var c0 = document.createElement('canvas');
        var ctx0 = c0.getContext('2d');
        ctx0.font = '72px Arial';
        var char_position = -0.5*ctx0.measureText(s).width;
        var c1;
        
        for (var i = 0; i < s.length; i++)
        {
            var c = document.createElement('canvas');
            var ctx = c.getContext('2d');
            ctx.font = '72px Arial';
            c.width = ctx.measureText(s[i]).width;
            c.height = 64;
            if (i == 0)
            {
                char_position += 0.5*c.width;
            }
            else
            {
                char_position += 0.5*(c.width + c1.width);
            }
        
            ctx.font = '72px Arial';

            ctx.fillStyle = "#154888";
			ctx.fillText(s[i], 0, c.height);
            
            text_texture[i] = new THREE.Texture(c);
            text_texture[i].needsUpdate = true;
    
            texts[i] = new THREE.Mesh(new THREE.PlaneGeometry(c.width, 0.7*c.height),
                                  new THREE.MeshBasicMaterial({map: text_texture[i]}));
            
            start_position[i] = new THREE.Vector3(0, 50, 0);
            end_position[i] = new THREE.Vector3(char_position, -30, 0);
            
            texts[i].position.x = start_position[i].x;
            texts[i].position.y = start_position[i].y;
            texts[i].position.z = start_position[i].z;
            
            start_time[i] = i*6;
            object_timer[i] = 0;
            object_lifetime[i] = 35;
            texts[i].material.opacity = 0.0;
                    
            texts[i].doubleSided = true;
            scene.add(texts[i]);
            //
            c1 = c;
        }
   
        //
        group1 = new THREE.Object3D();
        subgroup1 = new THREE.Object3D();
        subgroup2 = new THREE.Object3D();

        var texture = THREE.ImageUtils.loadTexture ('textures/HermitCrab.png');//Works on mobile Android NOT in Browser or XDK
        
        // Cube
        var geometry_planes = [];
        var material_allplane = new THREE.MeshBasicMaterial ( {  map: texture, side: THREE.DoubleSide, blending: THREE.NormalBlending} );
		var material_blue = new THREE.MeshBasicMaterial ( { color: 0x154888, transparent:true, opacity: 0.8});
        var size = 100;
        var halfsize = size*0.5;
        for (var i = 0; i < 5; i++)
        {
            geometry_planes[i] = new THREE.PlaneGeometry (size, size);
			if ( i !=  0)
			{
				planes[i] = new THREE.Mesh (geometry_planes[i], material_allplane);
			}
			else
			{
				planes[i] = new THREE.Mesh (geometry_planes[i], material_blue);
			}
        }
        var axis1 = new THREE.Vector3(1, 0, 0);
        var axis2 = new THREE.Vector3(0, 1, 0);
        var axis3 = new THREE.Vector3(0, 0, 1);
        planes[0].rotateOnAxis(axis1, Math.PI/2.0); planes[0].position.y = -halfsize;
        planes[1].rotateOnAxis(axis2, Math.PI/2.0); planes[1].position.x = -halfsize;
        planes[2].rotateOnAxis(axis2, Math.PI/2.0); planes[2].position.x = halfsize;
        planes[3].rotateOnAxis(axis3, Math.PI/2.0);
        planes[3].rotateOnAxis(axis3, -Math.PI/2.0);planes[3].position.z = -halfsize;
        planes[4].rotateOnAxis(axis3, Math.PI/2.0);
        planes[4].rotateOnAxis(axis3, -Math.PI/2.0);planes[4].position.z = halfsize;
     
        for (var i = 0; i < 5; i++)
        {
            subgroup1.add(planes[i]);
        }
        subgroup2.position.y = halfsize - 1;
        subgroup2.position.z = halfsize - 1;
        
        var geometry_cube = new THREE.CubeGeometry( size-2, size-2, 4 );
        cube_cover = new THREE.Mesh( geometry_cube, material_blue);
        cube_cover.rotateOnAxis(axis1, Math.PI/2.0); cube_cover.position.z = -halfsize;
        subgroup2.add(cube_cover);
        group1.add(subgroup1);
        group1.add(subgroup2);
        //
        group1.position.y = size - 15;
        scene.add(group1);
        // Plane
        var geometry_plane = new THREE.PlaneGeometry (size, size);
        geometry_plane.applyMatrix (new THREE.Matrix4 ().makeRotationX (-Math.PI / 2));

        var material_plane = new THREE.MeshBasicMaterial ( { color: 0x555555, transparent: true, opacity: 0.1} );

        plane = new THREE.Mesh (geometry_plane, material_plane);
		plane.position.y = 5;
        scene.add (plane);
        //
        /*fgCanvas = document.createElement('canvas');
        document.getElementById('canvasdiv').appendChild (fgCanvas);
        fgCanvas = document.getElementById('fgCanvas');
		fgCanvas.width = 640;
        fgCanvas.height = 360;*/
		
		bufferCanvas1 = document.createElement('canvas');
		bufferCanvas2 = document.createElement('canvas');
        //
        document.getElementById('canvasdiv').addEventListener ('mousedown', onDocumentMouseDown, false);
        document.getElementById('canvasdiv').addEventListener ('touchstart', onDocumentTouchStart, false);
        document.getElementById('canvasdiv').addEventListener ('touchmove', onDocumentTouchMove, false);
		
        // Generic setup
        
        window.addEventListener ('resize', onWindowResize, false);
    }
    //
    function onWindowResize () {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix ();
        renderer.setSize (window.innerWidth, window.innerHeight);
    }
    
    function stopAutoRotate () {
        if (auto_timer)
            window.clearTimeout (auto_timer);
        auto_timer = window.setTimeout (startAutoRotate, 1000);
    }
            
    function startAutoRotate () {
        auto_timer = 0;
    }
    var count = -1;
    function objectAnimation()
    {
        if (start_open == true)
        {
            count ++;
            if (count > 10)
            {
                start_particle = true;
            }
        }
        for (var i = 0 ; i < 7; i++)
        {
            if (count >= start_time[i] && count <= start_time[i] + object_lifetime[i])
            {
                progress = (count - start_time[i])/object_lifetime[i];
                var curpos = caculateposition(progress, start_position[i], end_position[i], rand_bound[i]);
                texts[i].position.x = curpos.x;
                texts[i].position.y = curpos.y;
                texts[i].position.z = curpos.z;
				texts[i].material.opacity = 1.0;
            }
        }
        if (start_open == true && count < 80)
        {
            var axis1 = new THREE.Vector3(1, 0, 0);
            dx = 1.0/80.0;
            dangle = dx;
            subgroup2.rotateOnAxis(axis1, dangle*Math.PI*1.47); 
        }
        if (start_particle == true && particle_started == false)
        {
			for (var i = 0; i < 100; i++)
			{
				particles[i].material.opacity = 0.5;
				
				tween0[i] = new TWEEN.Tween( particles[i] )
				.delay( i*15 )
				.to( {}, 1500 )
				.start();
      
				tween1[i].start();
				tween2[i].start();
			}
			/*video_rgb.play();
			video_alpha.play();
			var width = 352;
			var height = 352;
			
			var buffer1 = bufferCanvas1.getContext('2d');
			var buffer2 = bufferCanvas2.getContext('2d');

			bufferCanvas1.width = width;
			bufferCanvas1.height = height;
			buffer1.drawImage(video_rgb, 0, 0);
			
			bufferCanvas2.width = width;
			bufferCanvas2.height = height;
			buffer2.clearRect(0,0, width, height);
			buffer2.drawImage(video_alpha, 0, 0);

			var ctx = fgCanvas.getContext('2d');
			
			var	image1 = buffer1.getImageData(0, 0, width,  height),
			imageData = image1.data;
			var image2 = buffer2.getImageData(0, 0, width,  height),
			alphaData = image2.data;
				
			for (var i = 3, len = imageData.length; i < len; i = i + 4) {
					imageData[i] = alphaData[i-3];
			}
	
			ctx.putImageData(image1, 0, 0, 0, 0, width, height);
					ctx.strokeRect(0, 0, 300, 300);	*/
            start_particle = false;
			particle_started = true;
        }
        if (count > 1000)
        {
             start_open = false;
        }
    }
    function animate () {
        requestAnimationFrame (animate);
		TWEEN.update();
        velocity = (targetRotation - plane.rotation.y) * 0.01;
        if (velocity > 0.2)
        {
            start_open = true;
        }
        plane.rotation.y = group1.rotation.y += velocity;
        objectAnimation();
        if (auto_timer === 0) {
            targetRotation += 0.025;
        }
        renderer.render (scene, camera);
    }

    function onDocumentMouseDown (e) {
        e.preventDefault();
        document.getElementById('canvasdiv').addEventListener ('mousemove', onDocumentMouseMove, false);
        document.getElementById('canvasdiv').addEventListener ('mouseup', onDocumentMouseUp, false);
        document.getElementById('canvasdiv').addEventListener ('mouseout', onDocumentMouseOut, false);
        mouseXOnMouseDown = e.clientX - windowHalfX;
        targetRotationOnMouseDown = targetRotation;
        stopAutoRotate ();
    }

    function onDocumentMouseMove (e) {
        mouseX = e.clientX - windowHalfX;
        targetRotation = targetRotationOnMouseDown + 
            (mouseX - mouseXOnMouseDown) * 0.02;
        stopAutoRotate ();
    }

    function onDocumentMouseUp (e) {
        document.getElementById('canvasdiv').removeEventListener ('mousemove', onDocumentMouseMove, false);
        document.getElementById('canvasdiv').removeEventListener ('mouseup', onDocumentMouseUp, false);
        document.getElementById('canvasdiv').removeEventListener ( 'mouseout', onDocumentMouseOut, false);
        stopAutoRotate ();
    }

    function onDocumentMouseOut (e) {
        document.getElementById('canvasdiv').removeEventListener ('mousemove', onDocumentMouseMove, false);
        document.getElementById('canvasdiv').removeEventListener ('mouseup', onDocumentMouseUp, false);
        document.getElementById('canvasdiv').removeEventListener ('mouseout', onDocumentMouseOut, false);
        stopAutoRotate ();
    }

    function onDocumentTouchStart (e) {
        if (e.touches.length === 1) {
            e.preventDefault ();
            mouseXOnMouseDown = e.touches[ 0 ].pageX - windowHalfX;
            targetRotationOnMouseDown = targetRotation;
            stopAutoRotate ();
        }
    }

    function onDocumentTouchMove (e) {
        if (e.touches.length === 1) {
            e.preventDefault ();
            mouseX = e.touches[0].pageX - windowHalfX;
            targetRotation = targetRotationOnMouseDown + 
                (mouseX - mouseXOnMouseDown) * 0.05;
            stopAutoRotate ();
        }
    }
});