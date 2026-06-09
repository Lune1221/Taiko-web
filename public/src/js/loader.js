class Loader {
constructor(...args) {
this.init(...args);
}
init(callback) {
this.callback = callback;
this.loadedAssets = 0;
this.assetsDiv = document.getElementById("assets");
this.screen = document.getElementById("screen");
this.startTime = Date.now();
this.errorMessages = [];
this.songSearchGradient = "linear-gradient(to top, rgba(245, 246, 252, 0.08), #ff5963), ";
var promises = [];
promises.push(this.ajax("src/views/loader.html").then(function(page) {
this.screen.innerHTML = page;
}.bind(this)));
promises.push(this.ajax("api/config").then(function(conf) {
gameConfig = JSON.parse(conf);
}));
Promise.all(promises).then(this.run.bind(this));
}
run() {
this.promises = [];
this.loaderDiv = document.querySelector("#loader");
this.loaderPercentage = document.querySelector("#loader .percentage");
this.loaderProgress = document.querySelector("#loader .progress");
this.queryString = (gameConfig.version && gameConfig.version.commit_short) ? "?" + gameConfig.version.commit_short : "";
if (gameConfig.custom_js) {
this.addPromise(this.loadScript(gameConfig.custom_js), gameConfig.custom_js);
}
var oggSupport = new Audio().canPlayType("audio/ogg;codecs=vorbis");
if (!oggSupport) assets.js.push("lib/oggmented-wasm.js");
assets.js.forEach(function(name) {
this.addPromise(this.loadScript("src/js/" + name), "src/js/" + name);
}.bind(this));
this.addPromise(new Promise(function(resolve, reject) {
var cssCount = document.styleSheets.length + assets.css.length;
assets.css.forEach(function(name) {
var s = document.createElement("link");
s.rel = "stylesheet";
s.href = "src/css/" + name + this.queryString;
document.head.appendChild(s);
}.bind(this));
var checkStyles = function() {
if (document.styleSheets.length >= cssCount) { resolve(); clearInterval(interval); }
};
var interval = setInterval(checkStyles, 100);
checkStyles();
}.bind(this)));
for (var name in assets.fonts) {
var url = gameConfig.assets_baseurl + "fonts/" + assets.fonts[name];
this.addPromise(new FontFace(name, "url('" + url + "')").load().then(function(f) { document.fonts.add(f); }), url);
}
assets.img.forEach(function(name) {
var id = this.getFilename(name);
var img = document.createElement("img");
img.crossOrigin = "anonymous";
var url = gameConfig.assets_baseurl + "img/" + name;
this.addPromise(pageEvents.load(img), url);
img.id = name;
img.src = url;
this.assetsDiv.appendChild(img);
assets.image[id] = img;
}.bind(this));
for (var selector in assets.cssBackground) {
var name = assets.cssBackground[selector];
var url = gameConfig.assets_baseurl + "img/" + name;
this.addPromise(this.ajax(url, function(r) { r.responseType = "blob"; }).then(function(blob) {
var id = this.getFilename(name);
var img = document.createElement("img");
var blobUrl = URL.createObjectURL(blob);
var p = pageEvents.load(img).then(function() {
var grad = (selector === "#song-search") ? this.songSearchGradient : "";
this.appendStyle(selector + " { background-image: " + grad + "url('" + blobUrl + "'); }");
}.bind(this));
img.id = name;
img.src = blobUrl;
this.assetsDiv.appendChild(img);
assets.image[id] = img;
return p;
}.bind(this)), url);
}
assets.views.forEach(function(name) {
var id = this.getFilename(name);
this.addPromise(this.ajax("src/views/" + name + this.queryString).then(function(p) { assets.pages[id] = p; }), name);
}.bind(this));
this.addPromise(this.ajax("api/categories").then(function(c) {
assets.categories = JSON.parse(c);
assets.categories.push({title: "default", songSkin: {background: "#ececec"}});
}), "api/categories");
this.addPromise(this.ajax(gameConfig.assets_baseurl + "img/vectors.json" + this.queryString).then(function(r) { vectors = JSON.parse(r); }), "vectors");
Promise.all(this.promises).then(function() {
if (this.error) return;
this.addPromise(this.ajax("api/songs").then(function(s) {
assets.songs = assets.songsDefault = JSON.parse(s);
}), "api/songs");
this.setupAudio();
}.bind(this));
}
setupAudio() {
snd.buffer = new SoundBuffer();
this.addPromise(this.canvasTest.blurPerformance().then(function(r) { perf.blur = r; }), "blur");
this.finalInit();
}
finalInit() {
Promise.all(this.promises).then(function() {
this.clean();
this.callback();
pageEvents.send("ready", "normal");
}.bind(this));
}
addPromise(promise, url) {
this.promises.push(promise);
promise.then(this.assetLoaded.bind(this), function(e) { return this.errorMsg(e, url); }.bind(this));
}
errorMsg(error, url) {
if (!this.error) {
this.error = true;
this.loaderDiv.classList.add("loaderError");
var diag = this.screen.getElementsByClassName("diag-txt")[0];
var ta = document.createElement("textarea");
ta.readOnly = true;
diag.appendChild(ta);
this.errorTxt = { element: ta, method: "value" };
}
var msg = (typeof error === "string" ? error : (error.stack || error.toString())) + (url ? " (" + url + ")" : "");
this.errorMessages.push(msg);
var p = Math.floor(this.loadedAssets * 100 / (this.promises.length || 1));
this.errorTxt.element[this.errorTxt.method] = "Error List:\n" + this.errorMessages.join("\n") + "\nProgress: " + p + "%";
return Promise.reject();
}
assetLoaded() {
this.loadedAssets++;
var p = Math.floor(this.loadedAssets * 100 / (this.promises.length || 1));
if (this.loaderProgress) {
this.loaderProgress.style.width = p + "%";
this.loaderPercentage.firstChild.data = p + "%";
}
}
appendStyle(rule) {
var style = document.createElement("style");
style.appendChild(document.createTextNode(rule));
document.head.appendChild(style);
}
ajax(url, custom) {
var req = new XMLHttpRequest();
req.open("GET", url);
var p = pageEvents.load(req);
if (custom) custom(req);
return p.then(function() { return req.status === 200 ? req.response : Promise.reject(url + " (" + req.status + ")"); });
}
loadScript(url) {
var s = document.createElement("script");
s.src = url + this.queryString;
return pageEvents.load(s);
}
getFilename(n) { return n.split(".").shift(); }
clean() { /* クリーンアップ処理 */ }
}
