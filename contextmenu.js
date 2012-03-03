var contextmenu = function(d, window, undefined){
	var nativeSupport = /Firefox/.test(navigator.userAgent);
	
	function nextTick(callback){
		setTimeout(callback, 0);
	}
	function guid() {
		return (0 | 10000000 * Math.random()).toString(30) + (0 | 10000000 * Math.random()).toString(30) + (0 | 10000000 * Math.random()).toString(30);
	}
	// Only use sleep if you know what you are doing.
	// WIll max out 100% if using cpu_hog = true!
	function sleep(time, cpu_hog) {
		var t_end = (new Date() -0 )+ time;
		while(new Date()-0 < t_end) {
			if(!cpu_hog){
				try{
					sleep_work();
				}catch(ex){
					console.error(ex);
				}
			}
		}
		return (new Date()-0) - t_end;
	}
	function sleep_work() {
		var resource;
		if(typeof ActiveXObject == 'undefined') {
			resource = new XMLHttpRequest();
		} else{
			resource = new ActiveXObject("Microsoft.XMLHTTP");
		}
		try {
			resource.open('GET', '/', false);
			resource.send(null);
			response = resource.responseText;
		}catch(e){
			
		}
	}
	function offset(obj) {
		if(obj.getClientRects) {
			var rect = obj.getClientRects()[0];
			return rect;
		}
		var curleft  = 0;
		var curtop = 0;
		do {
			curleft += obj.offsetLeft;
			curtop += obj.offsetTop;
		} while (obj = obj.offsetParent);
		return {
			left: curleft,
			top: curtop
		};
	}
	var mousedown_timeout;
	function _mousedown(e){
		console.warn("_mousedown");
		_.style.opacity = "0.0";
		mousedown_timeout = setTimeout(function () {
			while(menustack.length) {
				popmenu(false);
			}
			_.style.display = "none";
			_.style.opacity = "1.0";
			
		}, timeout);
	}
	window._mousedown = _mousedown;
	function hideMenu(menu, fade){
		if(fade) {
			throw("no need to fade");
			var c = menu.className;
			menu.className += " fadeout"
			nextTick(function (){
				menu.style.opacity = "0.0";
			});
			
			setTimeout(function () {
				menu.style.display = "none";
				menu.className = c;
				menu.style.opacity = "1.0";
			}, timeout);
		}else {
			menu.style.display = "none";
		}
		
		var launcher = menu.launcher;
		if(launcher) {
			launcher.removeAttribute("open");
		}
	}
	
	function prepareMenu(menu) {
		var p = menu.parentNode;
		menu.addEventListener("mouseover", onmouseover, false);
		menu.addEventListener("mousedown", onmousedown);
		if(p.nodeName === "MENU") {
			var clone = d.createElement("menuitem");
			menu.className += " submenu";
			clone.className =  menu.className;
			clone.setAttribute("label", menu.getAttribute("label"));
			if(!menu.id) {
				var node_id = "_anon_menu_" + guid();
				clone.setAttribute("contextmenu", node_id);
				menu.id = node_id;
			} else {
				clone.setAttribute("contextmenu", menu.id);
			}
			clone.addEventListener("mouseover", onsubcontextmenu);
			clone.addEventListener("mouseout", onsubcontextmenuout);
			//clone.addEventListener("mouseout", onsubcontextmenu); //to another node
			//menu.addEventListener("mouseout", onsubmouseout, false);
			p.replaceChild(clone, menu);
			_.appendChild(menu);
		}else {
			p.removeChild(menu);
			_.appendChild(menu);
		}
	}
	function mother(name, node) {
		if(node.nodeName === name) {
			return node;
		}
		return mother(name, node.parentNode || {nodeName: name});
	}
	function onmousedown(e){
		e.stopPropagation();
		e.preventDefault();
		return false;
	}
	function onmouseover(e) {
		var menu = mother("MENU", e.target);
		if(preview){
			if(preview === menu) {
				menustack.push(menu);
				preview = undefined;
				return;
			}
			console.error("SHOULD NOT BE A PREVIEW");
		}
		var msl = menustack.length;
		var top = menustack[msl-1];
		//Pop while not menu
		var a = menustack.indexOf(menu);
		for(i = msl-1; i > a; i--) {
			popmenu();
		}
		
		return;
		if(top === menu) {
			//Hmm.. It's opening now?
			return;
		}
		//Pop while menu is not an ancestor of top;
		var a = menustack.indexOf(menu);
		if(a === -1){
			throw("??? Should not be visible if it isn't an ancestor! It is fading away?");
		}
		var i;
		for(i = msl-1; i > a; i--) {
			popmenu();
		}
		
	}
	function popmenu(){
		var top = menustack.pop();
		hideMenu(top);
		return top;
	}
	function onsubmouseout(e){
		var menu = e.srcElement;
		return false;
		if(menu.nodeName !== "MENU"){
			return false;
		}
		return false;
		popmenu();
	}
	function onsubcontextmenuout(e){
		var menu = mother("MENU", e.toElement);
		if(menu === preview) {
			return false;
		}
		hideMenu(preview);
		preview = undefined;
	}
	function onsubcontextmenu(e){
		var menuitem = e.srcElement;
		var menu = document.getElementById(menuitem.getAttribute("contextmenu"));
		menu.launcher = menuitem;
		if(preview && preview !== menu){
			hideMenu(preview);
		}
		preview = menu;
		var pos = offset(menuitem);
		menu.style.top = (pos.top - 5) + "px";
		menu.style.left = (pos.left + pos.width - 1) + "px";
		menu.style.display = "inline-block";
		_.style.display = "block";
		menuitem.default_className = menuitem.className;
		if(!menuitem.opensubmenu) {
			menuitem.setAttribute("open", true);
		}
		e.preventDefault();
		e.stopPropagation();
		return false;
	}
	function initContextMenu(menu, x, y) {
		t = new Date();
		menustack.push(menu);
		menu.style.top = (y - 5) + "px";
		menu.style.left = x + "px";
		menu.style.display = "inline-block";
		_.style.display = "block";
	}
	
	function oncontextsheet(e){
		window.e = e;
		window.offset = offset;
		var pos = offset(e.target);
		var menu = document.getElementById(e.srcElement.getAttribute("contextmenu"));
		t = new Date();
		initContextMenu(menu, pos.left, pos.top + pos.height + 8);
		e.preventDefault();
		return false;
	}
	function oncontextmenu(e){
		var menu = document.getElementById(e.srcElement.getAttribute("contextmenu"));
		initContextMenu(menu, e.clientX, e.clientY);
		e.preventDefault();
		return false;
	}
	
if(!nativeSupport){
	var menustack = [];
	var preview; //Extension to the menustack.
	var _ = d.createElement("div");
	var os_code = "osx10_7";
	if(/Mac/.test(navigator.userAgent)) {
		os_code = "osx10_7";
	}else if(/Win/.test(navigator.userAgent)) {
		os_code = "win7";
	}
	
	d.body.className += " " + os_code;
	_.className = "_contextmenu_screen_";
	var menus_dom = d.getElementsByTagName("menu");
	var timeout = 150;
	var t = 0;
	
	
	var i, l;
	var menus = [];
	for(i = 0, l = menus_dom.length; i < l; i++) {
		menus[i] = menus_dom[i];
	}
	for(i = 0, l = menus.length; i < l; i++) {
		prepareMenu(menus[i]);
	}
	d.body.appendChild(_);
	
	
	_.addEventListener("mousedown", function(e){
		_mousedown(e);
	});
	var mouseup_wait_for_me = 0;
	_.addEventListener("mouseup", function(e){
		if(mouseup_wait_for_me) {
			return;
		}
		var menuitem = e.target;
		if(menuitem.nodeName === "MENUITEM" && menuitem.hasAttribute("contextmenu")) {
			return false;
		}
		if(new Date() - t < 300) {
			return;
		}
		_mousedown(e);
	});
	_.addEventListener("mousewheel", function(e){
		e.preventDefault();
		e.stopPropagation();
		return false;
	}, true);
	function contextMenuFor(node) {
		if(!node || !node.hasAttribute) {
			return;
		}
		if(node.hasAttribute("contextmenu")){
			return node.getAttribute("contextmenu");
		}
		return contextMenuFor(node.parentNode);
	}
	_.addEventListener("contextmenu", function (e){
		_.style.display = "none";
		var node = document.elementFromPoint(e.clientX, e.clientY);
		var contextmenu = contextMenuFor(node);
		if(contextmenu) {
			_.style.display = "block";
			clearTimeout(mousedown_timeout);
			e.preventDefault();
			var oldstack = menustack;
			var menu = document.getElementById(contextmenu);
			
			mouseup_wait_for_me++;
			setTimeout(function(){
				while(menustack.length) {
					var m = menustack.pop();
					hideMenu(m);
				}
				_.style.display = "none";
				_.style.opacity = "1.0";
				_.style.display = "block";
				nextTick(function(){
					mouseup_wait_for_me--;
					initContextMenu(menu, e.clientX, e.clientY);
				});
			}, timeout);
			return false;
		}else{
			_.style.opacity = "1.0";
			_.style.display = "block";
			clearTimeout(mousedown_timeout);
			nextTick(_mousedown);
			sleep(timeout, true);
		}
	});
	
	_.addEventListener("mouseover", function(e){
		if(e.target !== _) {
			return;
		}
		//Hide preview menu.
		if(preview){
			hideMenu(preview);
			preview = undefined;
		}
	});
	
	
	var linkers = d.getElementsByClassName("contextmenu");
	for(i = 0, l = linkers.length; i < l; i++) {
		var element = linkers[i];
		if(element.nodeName === "INPUT") {
			element.addEventListener("click", oncontextsheet);
			//Right clicking buttons. Bad idea?
			element.addEventListener("contextmenu", oncontextsheet);
		} else {
			element.addEventListener("contextmenu", oncontextmenu);
		}
	}
}
	var _contextmenu = function(x){
		var i, l;
		var menu = document.createElement("menu");
		for(i = 0, l = x.length; i < l; i++) {
			var xi = x[i];
			if(xi.children) {
				var submenu = _contextmenu(xi.children);
				submenu.setAttribute("label", xi.label);
				menu.appendChild(submenu);
			} else {
				var menuitem = document.createElement("menuitem");
				menuitem.setAttribute("label", xi.label);
				xi.onclick && (menuitem.onclick = xi.onclick);
				xi.icon && (menuitem.icon = xi.icon);
				
				menu.appendChild(menuitem);
			}
		}
		return menu;
	};
	var contextmenu = function(x){
		var menu = _contextmenu(x);
		d.body.appendChild(menu);
		if(nativeSupport){
			return menu;
		}
		var submenus = menu.getElementsByTagName("menu");
		var menus = [];
		menus.push(menu);
		var i, l;
		for(i = 0, l = submenus.length; i < l; i++) {
			menus.push(submenus[i]);
		}
		for(i = 0, l = menus.length; i < l; i++) {
			prepareMenu(menus[i]);
		}
		mousedown_timeout
		return menu;
	};
	
	contextmenu.show = function(menu, x, y){
		if(nativeSupport){
			throw("Not supported");
		}
		if(typeof id === "string") {
			menu = document.getElementById(menu);
		}
		initContextMenu(menu, x, y);
		return this;
	}
	return contextmenu;
}(document, window);