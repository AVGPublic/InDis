//-------------dynamic system function lib-----------------//
var dynamicSysFuncLib = (function (dynamicSysFuncLib) 
{
   dynamicSysFuncLib.attractorStringParam = 
	{anchor: {x: 0, y: 20}, k: 0.007, nv: 0.04, dt: 1, pulse: {dv: 0.02, range: 400, soft: 0.01, da: 0.01, x:0, y: 0}, g: 0.05, imageTopLeft: {x: 0, y: 0}, id: undefined};
   dynamicSysFuncLib.attractorStringDynamic = function(v1, v2, v3, param) 
   {
		var v1_, v2_, v3_;
		if (param.id == "x")
		{
			v3_ = v3;
			v2_ = v2;
			v1_ = v1;
			
		}
		else if (param.id == "y")
		{
			a = v3 + -param.k*(v1 - param.anchor.y) - param.nv*v2;
			v3_ = v3*param.pulse.da + param.g;
			v2_ = v2 + param.dt*a;
			v1_ = v1 + param.dt*v2_;	
		}
		return {v1: v1_, v2: v2_, v3: v3_};
   }
   dynamicSysFuncLib.mouseRepulseEvent = function(v1, v2, v3, param, controlparam)
   {
		var v1_, v2_, v3_;
		var dis = (controlparam.clientX - param.imageTopLeft.x - param.pulse.x)*(controlparam.clientX - param.imageTopLeft.x - param.pulse.x);
			dis = dis/(param.pulse.range*param.pulse.range);
		var deltav; 
		
		deltav = param.pulse.dv/(dis + param.pulse.soft);

		if (param.id == "x")
		{
			v1_ = v1;
			v2_ = v2;
			v3_ = v3;
		}
		else if (param.id == "y")
		{
			v1_ = v1; 
			v2_ = v2;
			v3_ = deltav;
		}
		
		return {v1: v1_, v2: v2_, v3: v3_};
   }
   //
   return dynamicSysFuncLib
}(dynamicSysFuncLib || {}));
//---------------------------------------------------------//


