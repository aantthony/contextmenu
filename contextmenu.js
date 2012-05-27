/*
 * Contextmenu v0.1
 * https://github.com/aantthony/contextmenu
 *
 * Released under the MIT license
 * Copyright 2012
 *
 * Date: Sun Mar 4 2012
 */
(function (d, window) {
	"use strict";
	var nativeSupport = ((d.body.contextMenu === null) && window.HTMLMenuItemElement !== undefined),
		lastX,				// Last position where root context menu was launched
		lastY,				//  ''
		mousedown_timeout,	// The timer which in timeout ms, will set the overlay with display: false
		overlay,			// A div that covers the screen while contextmenus are visible
		menustack,			// Stack of menu nodes open. menustack[0] is root. Does not include preview
		preview,			// A menu node which is visible (due to hovering on a expandable menu(item))
		timeout,			// The time (ms) taken to fade out.
		t,					// The time of mousedown. Used to determine if it is a hold and relase menu.
		preview_show_timer,	// Menu previews don't show instantly, but a few hundred ms later.
		holding = false,	// Is the user doing a hold an release menu selection?
		doneEvents = [],
		old_contextmenu = window.contextmenu;  // See: contextmenu.noConflict()

	function nextTick(callback) {
		setTimeout(callback, 0);
	}

	// Calculate the position of a dom node
	function offset(obj) {
		var curleft = 0,
			curtop = 0;
		if (obj.getClientRects) {
			return obj.getClientRects()[0];
		}
		do {
			curleft += obj.offsetLeft;
			curtop += obj.offsetTop;
			obj = obj.offsetParent;
		} while (obj);
		return {
			left: curleft,
			top: curtop
		};
	}

	function html(n){
		if(n.get) {
			return n.get(0);
		}
		return n;
	}

	function hideMenu(menu, fade) {
		if (fade) {
			throw ("no need to fade");
		}
		menu.style.display = "none";
		var launcher = menu.launcher;
		if (launcher) {
			launcher.removeAttribute("open");
		}
	}

	// Remove the topmost context menu from the stack
	function popmenu() {
		var top = menustack.pop();
		hideMenu(top);
		return top;
	}

	// Context menu operation complete. Triggered by multiple things.
	function mouseend() {
		overlay.style.opacity = "0.0";
		mousedown_timeout = setTimeout(function () {
			while (menustack.length) {
				popmenu(false);
			}
			overlay.style.display = "none";
			overlay.style.opacity = "1.0";
			triggerDoneEvents();
		}, timeout);
	}

	function showMenu(menu) {
		menu.style.display = "inline-block";
	}

	// Don't allow right clicking a context menu.
	function menuoncontextmenu(e) {
		// TODO: Right clicking an item should trigger a click event.
		e.stopPropagation();
		e.preventDefault();
	}

	// Search up the dom tree for the first ancestor with a given name.
	function ancestor(name, node) {
		if (node.nodeName === name) {
			return node;
		}
		return ancestor(name, node.parentNode || {nodeName: name});
	}

	// menu.onmouseover
	function onmouseover(e) {
		//This event is also triggered after mouseover on submenu menuitems
		var menu = ancestor("MENU", e.target),
			msl,
			a,
			i;
		if (preview) {
			if (preview === menu) {
				// It is no longer a preview anymore. Push it onto the stack
				menustack.push(menu);
				preview = undefined;
				return;
			}
			// This shouldn't be triggered because while previews will be hidden instantly.
			console.error("SHOULD NOT BE A PREVIEW");
		}
		msl = menustack.length;
		//Pop contextmenus until the focused menu is at the top.
		a = menustack.indexOf(menu);
		for (i = msl - 1; i > a; i--) {
			popmenu();
		}
	}

	// menu.onmousedown
	function onmousedown(e) {
		if (e.target.nodeName === "MENU") {
			if (e.offsetX === 0) {
				//Left 1px border shouldn't be included.
				//Close the menu: (bubble event)
				return;
			}
		}
		e.stopPropagation();
		e.preventDefault();
		return false;
	}
	function onsubcontextmenuout(e) {
		// Cancel any other previews
		preview_show_timer = clearTimeout(preview_show_timer);
		var menu = ancestor("MENU", e.toElement);
		
		// The user has deselected an expandable menu item.
		// If the mouse has moved to the new menu, then we don't hide it:
		if (menu === preview) {
			return false;
		}
		// Othewise, we do.
		if (preview) {
			hideMenu(preview);
			preview = undefined;
		}
	}

	// menu.onmouseover: Open an expandable menu.
	function onsubcontextmenu(e) {
		//Create a preview
		preview_show_timer = clearTimeout(preview_show_timer);
		preview_show_timer = setTimeout(function () {
			var menuitem = e.srcElement,
				menu = menuitem.contextMenu,
				pos;

			// For later removing the [open] attribute (for styling)
			menu.launcher = menuitem;
			menuitem.setAttribute("open", true);

			if (preview && preview !== menu) {
				hideMenu(preview);
			}
			preview = menu;
			pos = offset(menuitem);
			menu.style.top = (pos.top - 5) + "px";
			menu.style.left = (pos.left + pos.width - 1) + "px";
			showMenu(menu);
		}, 200);
		// Don't stop propagation, the event bubbles to the <menu /> mouseover handler,
		// which will hide any dead contextmenus
	}

	// Adds javascript code, so it works without native html5 contextmenu support
	function prepareMenu(menu) {
		var p = menu.parentNode,
			clone;
		menu.addEventListener("mouseover", onmouseover, false);
		menu.addEventListener("mousedown", onmousedown);
		menu.addEventListener("contextmenu", menuoncontextmenu);
		if (p.nodeName === "MENU") {
			// If it is a menu within a menu, instead make it a menu which points to another menu.
			// It would be better to keep it as menu > menu ...,
			// but styling became too difficult so menu > menu s are replaced with menuitem.submenu
			// And the menu > menu is moved to overlay > menu, and is set as the contextMenu property
			clone = d.createElement("menuitem");
			menu.classList.add("submenu");
			clone.className =  menu.className;
			clone.setAttribute("label", menu.getAttribute("label"));
			clone.contextMenu = menu;
			clone.addEventListener("mouseover", onsubcontextmenu);
			clone.addEventListener("mouseout", onsubcontextmenuout);
			p.replaceChild(clone, menu);
			overlay.appendChild(menu);
		} else {
			p.removeChild(menu);
			overlay.appendChild(menu);
		}
	}
	function initContextMenu(menu, x, y) {
		t = new Date();
		menustack.push(menu);
		menu.style.top = (y - 5) + "px";
		menu.style.left = x + "px";
		showMenu(menu);
		overlay.style.display = "block";
		holding = false;
	}

	// Context menu sheets are activated through buttons instead of right clicks.
	function oncontextsheet(e, menu, button) {
		var pos;
		if (button === undefined) {
			button = e.target;
		}
		pos = offset(button);
		if (menu === undefined) {
			menu = contextMenufor(button);
		}
		initContextMenu(menu, pos.left, pos.top + pos.height + 8);
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
		holding = true;
		return false;
	}
	function oncontextsheetbtnup(e){
		oncontextsheet(e);
		holding = false;
	}
	// Finds the menu element associated with an element. (Searchs up the dom tree)
	function contextMenufor(node) {
		if (!node || !node.hasAttribute) {
			return;
		}
		if (node.contextMenu) {
			return node.contextMenu;
		}
		if (node.hasAttribute("contextmenu")) {
			var node = d.getElementById(node.getAttribute("contextmenu"));
			node.contextMenu = node;
			return node;
		}
		return contextMenufor(node.parentNode);
	}

	function simulateClickEvent(elm, e) {
		var evt;
		if (document.createEvent) {
			evt = document.createEvent("MouseEvents");
		}
		if (elm && elm.dispatchEvent && evt && evt.initMouseEvent) {
			//Disgusing API:
			evt.initMouseEvent(
				"click",
				true,		// Click events bubble
				true,		// And they can be cancelled
				document.defaultView,
				1,			//Single click
				e.screenX,
				e.screenY,
				e.clientX,
				e.clientY,
				false,		// Don't apply any key modifiers 
				false,
				false,
				false,
				0,			// 0 - left, 1 - middle, 2 - right 
				null		//Single target
			);
			elm.dispatchEvent(evt);
		}
	}

	// ([contextmenu]).oncontextmenu
	function oncontextmenu(e) {
		var menu = contextMenufor(e.srcElement),
			x = e.clientX,
			y = e.clientY;
		initContextMenu(menu, e.clientX, e.clientY);
		holding = true;
		lastX = x;
		lastY = y;
		e.preventDefault();
		e.stopPropagation();
		return false;
	}
	function triggerDoneEvents() {
		doneEvents.forEach(function (f) {
			f();
		});
		doneEvents = [];
	}
	function inititalize() {
		menustack = [];
		overlay = d.createElement("div");
		
		// Style:
		var os_code = "osx10_7",
			mouseup_wait_for_me = 0;
		if (/Mac/.test(navigator.userAgent)) {
			os_code = "osx10_7";
		} else if (/Win/.test(navigator.userAgent)) {
			os_code = "win7";
		}
		d.body.classList.add(os_code);
		overlay.className = "_contextmenu_screen_";

		timeout = 150;
		t = 0;
		d.body.appendChild(overlay);
		overlay.addEventListener("mousedown", function (e) {
			mouseend(e);
		});
		overlay.addEventListener("mouseup", function (e) {
			if (mouseup_wait_for_me) {
				return;
			}
			var menuitem = e.target;
			if (menuitem.nodeName === "MENUITEM") {
				if (menuitem.contextMenu) {
					return false;
				}
				if (holding) {
					// When doing a hold down and release style selection, a click event isn't
					// automatticaly triggered by the browser
					simulateClickEvent(menuitem, e);
				}
			}
			if (new Date() - t < 300) {
				holding = false;
				return;
			}
			if (menuitem.nodeName === "MENUITEM") {
				//Click animation.
				setTimeout(function () {
					menuitem.style.background = "white";
					setTimeout(function () {
						menuitem.style.background = "";
						setTimeout(function () {
							mouseend(e);
						}, 30);
					}, 80);
				}, 10);
			}
		});

		// Prevent scrolling while context menus are active
		overlay.addEventListener("mousewheel", function (e) {
			e.preventDefault();
			e.stopPropagation();
			return false;
		}, true);

		// Attempt to begin another context menu while already in a context menu.
		overlay.addEventListener("contextmenu", function (e) {
			// Rememeber that the overlay covers up all other elements which
			// may have a contextmenu associate with them.
			overlay.style.display = "none";
			var node = d.elementFromPoint(e.clientX, e.clientY),
				menu = contextMenufor(node),
				x,
				y,
				dx,
				dy;
			if (menu) {
				overlay.style.display = "block";
				clearTimeout(mousedown_timeout);
				e.preventDefault();
				if (menustack[0] === menu) {
					//Same menu:
					x = e.clientX;
					y = e.clientY;
					dx = x - lastX;
					dy = y - lastY;
					lastX = x;
					lastY = y;
					// If the mouse hasn't moved much, then ignore it.
					// This was probably an attempt to hide the context menu,
					// rather than initate another of exactly the same type.
					if (dx * dx + dy * dy < 50) {
						overlay.style.opacity = "1.0";
						overlay.style.display = "block";
						clearTimeout(mousedown_timeout);
						nextTick(mouseend);
						return;
					}
				}

				// The mouseup event will attempt to hide all context menus.
				// Temporarily disable it:
				mouseup_wait_for_me++;
				setTimeout(function () {
					while (menustack.length) {
						var m = menustack.pop();
						hideMenu(m);
					}
					overlay.style.display = "none";
					overlay.style.opacity = "1.0";
					overlay.style.display = "block";
					nextTick(function () {
						mouseup_wait_for_me--;
						initContextMenu(menu, e.clientX, e.clientY);
					});
				}, timeout);
				return false;
			}
			overlay.style.opacity = "1.0";
			overlay.style.display = "block";
			clearTimeout(mousedown_timeout);
			nextTick(mouseend);
		});
		overlay.addEventListener("mouseover", function (e) {
			if (e.target !== overlay) {
				return;
			}
			//Hide preview menu.
			preview_show_timer = clearTimeout(preview_show_timer);
			if (preview) {
				hideMenu(preview);
				preview = undefined;
			}
		});
	}
	function attachEventsToAllMenus() {
		var menus_dom = d.getElementsByTagName("menu"),
			i,
			l,
			menus = [];
		// Build an array, since 'NodeListPrototype's update themselves while iterating.
		for (i = 0, l = menus_dom.length; i < l; i++) {
			menus[i] = menus_dom[i];
		}
		for (i = 0, l = menus.length; i < l; i++) {
			prepareMenu(menus[i]);
		}
	}
	function hookUpContextMenus() {
		var linkers = d.querySelectorAll("[contextmenu]"),
			element,
			i,
			l;
		for (i = 0, l = linkers.length; i < l; i++) {
			element = linkers[i];
			element.contextMenu = d.getElementById(element.getAttribute("contextmenu"))
			if (element.nodeName === "INPUT") {
				element.addEventListener("mouseup", oncontextsheetbtnup);
				element.addEventListener("contextmenu", oncontextsheet);
			} else {
				element.addEventListener("contextmenu", oncontextmenu);
			}
		}
	}
	if (!nativeSupport) {
		inititalize();
		attachEventsToAllMenus();
		hookUpContextMenus();
	}
	function buildMenu(x) {
		var menu = d.createElement("menu"),
			i,
			l,
			xi,
			submenu,
			menuitem;
		menu.setAttribute("type", "context");
		for (i = 0, l = x.length; i < l; i++) {
			xi = x[i];
			if (xi.children) {
				submenu = buildMenu(xi.children);
				submenu.setAttribute("label", xi.label);
				menu.appendChild(submenu);
			} else {
				if (xi.hr) {
					menuitem = d.createElement("hr");
				} else {
					menuitem = d.createElement("menuitem");
					menuitem.setAttribute("label", xi.label);
					if (xi.onclick) {
						menuitem.onclick = xi.onclick;
					}
					if (xi.icon) {
						menuitem.icon = xi.icon;
					}
				}
				
				menu.appendChild(menuitem);
			}
		}
		return menu;
	}

	// Main API:
	function contextmenu(x) {
		var menu = buildMenu(x),
			submenus,
			menus,
			i,
			l;
		d.body.appendChild(menu);
		if (nativeSupport) {
			return menu;
		}
		submenus = menu.getElementsByTagName("menu");
		menus = [menu];
		for (i = 0, l = submenus.length; i < l; i++) {
			menus.push(submenus[i]);
		}
		for (i = 0, l = menus.length; i < l; i++) {
			prepareMenu(menus[i]);
		}
		return menu;
	}
	contextmenu.show = function (menu, x, y) {
		if (nativeSupport) {
			throw ("Not supported!");
		}
		if (typeof menu === "string") {
			menu = d.getElementById(menu);
		} else {
			menu = html(menu);
		}
		if (typeof x === "number") {
			initContextMenu(menu, x, y);
		} else {
			oncontextsheet(null, menu, html(x));
			holding = false;
		}
		return this;
	};
	contextmenu.then = function (f) {
		doneEvents.push(f);
	};
	contextmenu.attach = function (element, menu) {
		element = html(element);
		menu = html(menu);
		if(nativeSupport) {
			menu.id = menu.id || (0 | 10000 * Math.random()).toString(30);
			element.setAttribute("contextmenu", menu.id);
			return;
		}
		element.contextMenu = menu;
		if (element.nodeName === "INPUT") {
			element.addEventListener("mouseup", oncontextsheetbtnup);
			// element.addEventListener("mousedown", oncontextsheet); css :hover doesn't work
			element.addEventListener("contextmenu", oncontextsheet);
		} else {
			element.addEventListener("contextmenu", oncontextmenu);
		}
	};
	contextmenu.noConflict = function () {
		window.contextmenu = old_contextmenu;
		return contextmenu;
	};
	window.contextmenu = contextmenu;
}(document, window));