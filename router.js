//route = {viewElement:null, viewSrc:"", viewId:"", viewModel:null, viewModelType:"", params:[], targetId:"", targetElement:null}
/*
 * router.js is a hash router for knockoutjs
 * after including you can define the routes using it like window.router.routes['home'] = {viewSrc:'home.html', viewModelType:'homeVM'}
 * after that when the window.location.hash changes to 'home' it will render the view in a container element with the id 'page' and the viewModel bound to it
 * 
 * assumptions
 * - the external html file has one root element, you may define many but only the first is used
 * - the first node in the target container is the node to be replaced when a hash changes
 * - route keys are split on a slash and popped till a there's a key match, the popped items become parameters
 * - parameters are only used when there's an init function defined on a viewModel
 */
window.router = {
	routes: {},
	defaultTargetId: "page",
	_hashchange: function(){
		var parts = window.location.hash.substring(1).split("/");
		var route = null;
		var params = [];
		while(parts.length>0){
			var key = parts.join("/");
			if(key in window.router.routes)
			{
				route = window.router.routes[key];
				route.params = params.reverse();
				break;
			}
			params.push(parts.pop());
		}
		if(route != null){
			window.router._changeRoute(route);
		}
	},
	_changeRoute: function (route) {
		//getting the viewElement
		if (!route.viewElement) {
			//get the view from a remote source
			if (route.viewSrc) {
				$.ajax(route.viewSrc,{
					success:function(data){
						var div = document.createElement("div");
						div.innerHTML = data;
						route.viewElement = div.firstChild;
						if (route.viewElement) {
							window.router._changeRoute(route);
						}
					},
					fail: function(xhr){
						throw new Error("Failed to load view from '" + route.viewSrc + "'");
					}
				});
				return;
			}
			//get the view from within the document
			else if(route.viewId){
				route.viewElement = document.getElementById(route.viewId);
				route.viewElement.parentNode.removeChild(route.viewElement);
				route.viewElement.style.display = "block";
			}
		}
		//get the viewModel if undefined and bind it with ko
		if (route.viewModelType && !route.viewModel) {
			var fn = new Function("return new " + route.viewModelType + "();");
			route.viewModel = fn();
			if(route.viewModel.init){
				route.viewModel.init(route.params);
			}
			ko.applyBindings(route.viewModel, route.viewElement);
		}
		//get the target element
		if(!route.targetElement){
			var targetId = route.targetId || window.router.defaultTargetId;
			route.targetElement = document.getElementById(targetId);
		}
		// prepare target element
		if (route.targetElement && route.targetElement.firstChild != null && route.targetElement.firstChild != route.viewElement) {
			route.targetElement.removeChild(route.targetElement.firstChild);
		}
		// add the view to the target element
		if (route.viewElement) {
			route.targetElement.insertBefore(route.viewElement, route.targetElement.firstChild);
		}
	},
	init:function(){
		window.addEventListener("hashchange", window.router._hashchange, false);
	}
};
window.router.init();