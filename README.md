### WAT?

This is experimental software.  
I'm attempting to script user interaction with operating systems via the VNC protocol.

Example VNC implementations:
[tightVNC](http://www.tightvnc.com/),
[chicken of VNC](http://sourceforge.net/projects/chicken/)

Why?

This can allow one to do browser tests without selenium,
in scenarios where it performs badly, target systems it doesn't support or to do tasks it doesn't allow.

One could think of vncbot as the interface for an AI bot to interact with the world
(this is a much harder application but at interesting one too, no?).  
Imagine a bot which can do OCR and identify major UX elements such as buttons and input.
It could be taught how to play a game, perform repetitive tasks, etc.  
Ultimately run the [Turing test](http://en.wikipedia.org/wiki/Turing_test).




### to install

    npm install



### to configure

Edit `cfg.json` to point to the VNC server you want to target.



### samples

See `sample.js` for some sample interactions with window programs notepad and paint.

See `grabVideoFrames.js` for attempting to control a browser.

* it fires the browser;
* goes to a page (purple.html) where a mouseclick is done. The difference between clientX|Y and screenX|Y is reported back to us;
* goes to the target page
* loads a websocket to the page via a bookmarklet
* the repl can now:
* shot x y w h -> records a screenshot of the screen on top/left xy and dims width/height
* any javascript is sent to the page, eval'd and returned back to the repl (using custom serialization to remove cycles and support DOM elements and NodeLists)



### todo

check `TODO.md`
