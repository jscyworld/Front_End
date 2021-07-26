var KYC_DefaultMgr = (function () {
    "use strict";

    var instance;

    function init() {
        //Private
        var div_elementId;
        var zoomScale;
        var isMobile = new MobileDetect(window.navigator.userAgent);
        var appData = new Object();
        var zoomEvent = new Event("zoomScaleChange");

        window.addEventListener("load", onload);

        function onload() {
            if (isApplication() == true) {
                callMgr.sendActionNameWithParameter(KYC_ActionList.KYC_SendAppData, null);
            } else {
                isAvailableDomain();
            }
        }
        window.getAppData = function (json) {
            appData = JSON.parse(json);
            if (isAvailableApplicationKey() == false) {
                window.location.href = "about:blank";
            }
        };

        function isAvailableApplicationKey() {
            if (appData.privatekey == "f3ZjUn4X3meucHHrF5yb6wfgBzNYCAkK") return true;

            return false;
        }

        function isAvailableDomain() {
            console.log("domain");
            var httpRequest;
            if (window.XMLHttpRequest) {
                // moz, safari, IE7+ ...
                httpRequest = new XMLHttpRequest();
            } else if (window.ActiveXObject) {
                // IE 6 under
                httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
            }
            httpRequest.open("POST", "https://api.bluepin.co.kr/kakaokids/certification/access/web/");
            //httpRequest.setRequestHeader('Access-Control-Allow-Origin','*');

            httpRequest.onreadystatechange = function (aEvt) {
                if (httpRequest.readyState === 4) {
                    if (httpRequest.status === 200) {
                        //   console.log(httpRequest.responseText);
                        var json = JSON.parse(httpRequest.responseText);
                        if (json.result != 0) window.location.href = "about:blank";
                    }
                }
            };
            httpRequest.send();
        }

        function isMobileWeb() {
            if (isMobile.mobile()) return true;
            else return false;
        }

        function setAlignCenterWithElementId(elementId) {
            var myElement = document.getElementById(elementId);
            if (myElement == null) return;

            var style = window.getComputedStyle(myElement, null);
            var marginLeft = parseInt(style.marginLeft);
            var marginRight = parseInt(style.marginRight);
            var marginTop = parseInt(style.marginTop);
            var marginBottom = parseInt(style.marginBottom);

            marginLeft = Math.abs(marginLeft);
            marginRight = Math.abs(marginRight);
            if (marginRight != marginLeft) {
                var sumMargin = marginLeft + marginRight;
                myElement.style.marginLeft = -(sumMargin / 2) + "px";
                myElement.style.marginRight = -(sumMargin / 2) + "px";
            }
        }

        function makeLandscapeSize(width, height) {
            width = parseInt(width);
            height = parseInt(height);
            return {
                width: Math.max(width, height),
                height: Math.min(width, height),
            };
        }

        function resizeZoomScaleWithElementId(elementId) {
            if (document.body == null) return;
            div_elementId = elementId;

            var width;
            var height;
            var siteWidth = 1024;
            var siteHeight = 768;

            var scale;
            if (isMobile.mobile()) {
                if (window.innerWidth > window.innerHeight) scale = window.innerHeight / 768;
                else scale = window.innerWidth / 1024;
            } else {
                scale = window.innerHeight / 768;
            }

            var myElement = document.getElementById(div_elementId);
            myElement.style.marginLeft = "auto";
            myElement.style.marginRight = "auto";

            //scroll 방지 mobile safari ios10 이상
            document.body.style.overflow = "hidden";
            document.body.style.position = "fixed";

            zoomScale = scale;
            //firefox
            if (document.body.style.zoom == undefined) {
                //myElement.style.marginTop = 'auto';
                //myElement.style.marginBottom = 'auto';
                //document.body.style['-moz-transform'] = 'scale(' + scale + ')';
            } else {
                document.body.style.zoom = scale;
            }

            setTimeout(function () {
                setAlignCenterWithElementId(div_elementId);
                window.dispatchEvent(zoomEvent);
                if (window.onZoomScaleChange) window.onZoomScaleChange();
            }, 10);

            //mobile browser can not fix rotate
            //wkwebview ignore
            function resize(e) {
                if (e.type == "orientationchange") {
                } else if (e.type == "resize") {
                }
                setTimeout(function () {
                    resizeZoomScaleWithElementId(div_elementId);
                }, 5);
            }

            //mobile rotate set aspect ratio
            //window.onorientationchange = reorient;
            //mobile browser onorientationchange event so fast
            window.onresize = resize;
        }

        function isApplication() {
            var agent = navigator.userAgent.toLowerCase();
            var loadFromApplication = false;
            if (agent.indexOf("kakaokids") != -1) {
                loadFromApplication = true;
            }
            return loadFromApplication;
        }

        function isWide() {
            if (document.body == null) return undefined;

            var myElement = document.getElementById(div_elementId);
            var style = window.getComputedStyle(myElement, null);

            var marginLeft = parseInt(style.marginLeft);
            var marginRight = parseInt(style.marginRight);

            if (parseInt(marginLeft) < 0 && parseInt(marginRight) < 0) {
                //console.log("non wide");
                return Math.abs(marginLeft) + "px";
            } else {
                //console.log("wide");
                return undefined;
            }

            return undefined;
        }

        function convertTouchPosition(event, object) {
            var touch = event;
            if (event.targetTouches != undefined) {
                touch = event.targetTouches[0];
            }

            var width = object == null ? 0 : parseInt(object.clientWidth);
            var height = object == null ? 0 : parseInt(object.clientHeight);

            //      var myElement = document.getElementById(div_elementId);
            var myElement = document.getElementById("stage");
            var style = window.getComputedStyle(myElement, null);
            var marginLeft = parseInt(style.marginLeft);
            var marginRight = parseInt(style.marginRight);
            var marginTop = parseInt(style.marginTop);
            var zoomScaled = 1;
            if (document.body.style.zoom == undefined) {
                var res = document.body.style.MozTransform.replace("scale(", "");
                res = res.replace(")", "");
                zoomScaled = parseFloat(res);
                zoomScaled = 1;
                return {
                    x: touch.clientX / zoomScaled - marginLeft - width / 2,
                    y: touch.clientY / zoomScaled - height / 2,
                };
            } else {
                zoomScaled = document.body.style.zoom;
            }

            //pageX visible Page position
            //clientX document position include hidden rect
            return {
                x: touch.clientX / zoomScaled - marginLeft - width / 2,
                y: touch.clientY / zoomScaled - height / 2,
            };
        }

        function isInterSection(element1, element2) {
            var rect1 = element1.getBoundingClientRect();
            var rect2 = element2.getBoundingClientRect();

            return !(rect1.top > rect2.bottom || rect1.right < rect2.left || rect1.bottom < rect2.top || rect1.left > rect2.right);
        }

        function isInside(element1, element2) {
            var rect1 = element1.getBoundingClientRect();
            var rect2 = element2.getBoundingClientRect();

            return (
                rect2.top <= rect1.top &&
                rect1.top <= rect2.bottom &&
                rect2.top <= rect1.bottom &&
                rect1.bottom <= rect2.bottom &&
                rect2.left <= rect1.left &&
                rect1.left <= rect2.right &&
                rect2.left <= rect1.right &&
                rect1.right <= rect2.right
            );
        }

        function convertWordArrayToUint8Array(wordArray) {
            var len = wordArray.words.length,
                u8_array = new Uint8Array(len << 2),
                offset = 0,
                word,
                i;
            for (i = 0; i < len; i++) {
                word = wordArray.words[i];
                u8_array[offset++] = word >> 24;
                u8_array[offset++] = (word >> 16) & 0xff;
                u8_array[offset++] = (word >> 8) & 0xff;
                u8_array[offset++] = word & 0xff;
            }
            return u8_array;
        }

        function getLocalHostPathWithFileName(filename) {
            var pathname = window.location.pathname;
            var dir = pathname.substring(0, pathname.lastIndexOf("/"));
            var upDirectory = dir.substr(dir.lastIndexOf("/") + 1);
            var url = "http://localhost/" + upDirectory + "/" + filename;
            return url;
        }

        return {
            isApplication: function () {
                return isApplication();
            },
            isWide: function () {
                return isWide();
            },
            isMobileWeb: function () {
                return isMobileWeb();
            },
            setAlignCenterWithElementId: function (elementId) {
                setAlignCenterWithElementId(elementId);
            },
            resizeZoomScaleWithElementId: function (elementId) {
                if (document.body == null) return;
                resizeZoomScaleWithElementId(elementId);
            },
            makeLandscapeSize: function (width, height) {
                return makeLandscapeSize(width, height);
            },
            convertTouchPosition: function (event, object) {
                return convertTouchPosition(event, object);
            },
            isInterSection: function (element1, element2) {
                return isInterSection(element1, element2);
            },
            isInside: function (element1, element2) {
                return isInside(element1, element2);
            },
            convertWordArrayToUint8Array: function (wordArray) {
                return convertWordArrayToUint8Array(wordArray);
            },
            getLocalHostPathWithFileName: function (filename) {
                return getLocalHostPathWithFileName(filename);
            },
        };
    }

    return {
        getInstance: function () {
            if (instance == null) {
                instance = init();
            }
            return instance;
        },
    };
})();
