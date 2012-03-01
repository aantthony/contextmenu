;!function(d, window, undefined){
	function guid() {
		return (0 | 10000000 * Math.random()).toString(30) + (0 | 10000000 * Math.random()).toString(30) + (0 | 10000000 * Math.random()).toString(30);
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
	var menustack = [];
	var preview; //Extension to the menustack.
	d.body.className+=" osx10_7";
	var menus_dom = d.getElementsByTagName("menu");
	var timeout = 150;
	function onmousedown(e){
		console.log("CLICK");
		isActive(false);
		while(menustack.length){
			popmenu(true);
		}
		console.log("STOP ALL EVENTS");
		e.stopPropagation();
		e.preventDefault();
		return false;
	}
	function onclick(e){
		console.log("click");
	}
	document.getElementById("logbtn").addEventListener("mousedown", function(){
		console.log("mousedown message");
	});
	document.getElementById("logbtn").addEventListener("click", function(){
		console.log("CLICK MESSAGE");
	});
	var active = false;
	function isActive(j){
		console.log("ACTIVE: ", j);
		if(j === false){
			d.body.removeEventListener("mousedown", onmousedown, false);
			d.body.removeEventListener("click", onmousedown, true);
			
			active = false;
			return;
		}
		if(active){
			return;
		}
		active = true;
		d.body.addEventListener("mousedown", onmousedown);
		d.body.addEventListener("click", onclick);
	}
	isActive("TEST")
	d.body.addEventListener("contextmenu", function (e){
		return;
		console.log("END");
		menustack = [];
		e.preventDefault();
		return false;
	}, false);
	
	d.body.addEventListener("mouseover", function(e){
		if(e.target !== d.body) {
			return;
		}
		//Hide preview menu.
		if(preview){
			hideMenu(preview);
			preview = undefined;
		}
	});
	function hideMenu(menu, fade){
		if(fade) {
			console.log("will fade out: ", menu);
			menu.style.opacity = "0.0";
			setTimeout(function () {
				menu.style.display = "none";
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
	
	var i, l;
	var menus = [];
	for(i = 0, l = menus_dom.length; i < l; i++) {
		menus[i] = menus_dom[i];
	}
	for(i = 0, l = menus.length; i < l; i++) {
		var menu = menus[i];
		var p = menu.parentNode;
		menu.addEventListener("mouseover", onmouseover, false);
		menu.addEventListener("mousedown", onmenumousedown);
		if(p.nodeName === "MENU") {
			var clone = d.createElement("menuitem");
			menu.className += " submenu";
			clone.className =  menu.className;
			clone.setAttribute("label", menu.getAttribute("label"));
			var node_id = "_anon_menu_" + guid();
			clone.setAttribute("contextmenu", node_id);
			menu.id = node_id;
			clone.addEventListener("mouseover", onsubcontextmenu);
			clone.addEventListener("mouseout", onsubcontextmenuout);
			//clone.addEventListener("mouseout", onsubcontextmenu); //to another node
			//menu.addEventListener("mouseout", onsubmouseout, false);
			p.replaceChild(clone, menu);
			d.body.appendChild(menu);
		}else {
			p.removeChild(menu);
			d.body.appendChild(menu);
		}
	}
	//d.body.appendChild(_);
	
	function mother(name, node) {
		if(node.nodeName === name) {
			return node;
		}
		return mother(name, node.parentNode || {nodeName: name});
	}
	function onmouseover(e) {
		var menu = mother("MENU", e.target);
		console.log("ENTER");
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
			console.log("pop", menustack[menustack.length-1]);
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
			console.log("Popped",menustack[menustack.length-1],"because", menu, "is not an ancestor of", top);
			popmenu();
		}
		
	}
	function popmenu(fade){
		var top = menustack.pop();
		hideMenu(top, fade);
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
		console.log("out from", e);
		window.e=e;
		var menu = mother("MENU", e.toElement);
		if(menu === preview) {
			return false;
		}
		hideMenu(preview);
		preview = undefined;
	}
	function onmenumousedown(e) {
		e.stopPropagation();
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
		menu.style.left = (pos.left + pos.width) + "px";
		menu.style.display = "inline-block";
		
		menuitem.default_className = menuitem.className;
		if(!menuitem.opensubmenu) {
			menuitem.setAttribute("open", true);
		}
		e.preventDefault();
		e.stopPropagation();
		return false;
	}
	function oncontextmenu(e){
		console.log(e);
		console.log(e.srcElement.getAttribute("contextmenu"));
		var menu = document.getElementById(e.srcElement.getAttribute("contextmenu"));
		console.log("Active");
		isActive(true);
		menustack.push(menu);
		menu.style.top = (e.pageY - 5) + "px";
		menu.style.left = e.pageX + "px";
		menu.style.display = "inline-block";
		e.preventDefault();
		e.stopPropagation();
		return false;
	}
	function onselectchange(e) {
		console.log("ABC");
	}
	var linkers = d.getElementsByClassName("contextmenu");
	for(i = 0, l = linkers.length; i < l; i++) {
		var element = linkers[i];
		element.addEventListener("contextmenu", oncontextmenu);
	}
}(document, window);