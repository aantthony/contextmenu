Contextmenu is a javascript library (with no dependencies) that allows the creation of native-looking right-click menus within a web page.

Don't use this in an attempt to replace the default context menu (e.g., to prevent Download Linked File As..., Save Image As..) because that is very annoying. The intended use is really for javascript-heavy web apps.

## Screenshots

Mac OS X Lion Style

Windows Vista Style

Windows 7 Style

Ubuntu Style

Fallback Style

## Usage

Requirements:

* contextmenu.js
* contextmenu.css

Either specify the markup using HTML context-menu notation [HTML Spec](http://www.whatwg.org/specs/web-apps/current-work/multipage/interactive-elements.html), or use the simple Javascript API provided by the *contextmenu* object which builds DOM nodes, and adds some javascript to ensure browser compatibility.

### API Example

	var menu = contextmenu([
		{
			label: "First Item",
			onclick: function (e){
				document.body.style.background = "green";
			}
		},
		{
			label: "Sub menu",
			children: [
				{
					label: "Another Item"
				}
			]
		}
	]);

	// Hook up an event to launch it
	contextmenu.attach(domNode, menu);
	
	//Or Show menu directly
	contextmenu.show(menu, 300, 200);
	
		

## Sites using Contextmenu

* [Graph.tk](http://graph.tk/)