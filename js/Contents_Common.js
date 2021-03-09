// JavaScript Document

var ContentsMgr = (function () {
    "use strict";
    var instance;
    function init() {
        // onLoad시 기본 변수 및 화면 셋팅 명령 수행
        function onLoadAction() {
            var container = document.getElementById("container"),
                stage = document.getElementById("stage"),
                pathInfo = getPath("document");
            pageVar.checkMobile = checkMobile();
            pageVar.document = pathInfo.file;
            pageVar.imgPath = "img/" + pathInfo.fileName + "/";
            pageVar.soundPath = "sound/" + pathInfo.fileName + "/";
            pageVar.videoPath = "video/" + pathInfo.fileName + "/";
            screenZoom();
            window.onresize = function () {
                setTimeout(() => {
                    screenZoom();
                }, 5);
                pageVar.stageMargin = container.clientWidth != stage.clientWidth ? (container.clientWidth - stage.clientWidth) / 2 : 0; // iphoneX 인 경우
            };
            pageVar.stageMargin = container.clientWidth != stage.clientWidth ? (container.clientWidth - stage.clientWidth) / 2 : 0; // iphoneX 인 경우
            addEvent("setting");
            createFileExif("setting");
            $("#container").animate({ opacity: 1 }, 70);
            if (!commonVar.isDev) loadJson();
        }

        function loadJson() {
            let tempStorage = window.localStorage;
            if (tempStorage.getItem(pageVar.bundleName + "_array_chapter") == undefined) {
                tempStorage.setItem(pageVar.bundleName + "_array_chapter", "");
            }

            // requestContentsDB(vendor, bundleName)
            let parameters = new Object();
            parameters.vendor = pageVar.vendor;
            parameters.bundleName = pageVar.bundleName;
            parameters.bundle_name = pageVar.bundleName;

            let currentData = null;
            try {
                callMgr.sendActionNameWithParameter(js_actionList.js_requestContentsDB, parameters);
                currentData = JSON.parse(tempStorage.getItem("loadedJSON"));
            } catch (e) {
                alert(e);
            }

            if (currentData == undefined || currentData == null) {
                let tempJson = new Object();
                let arrayVar = new Object();
                tempJson.all_complete = "0";
                for (var i = 1; i <= pageVar.totalPage; i++) {
                    tempJson["chapter" + i] = new Object();
                    tempJson["chapter" + i].complete = "0";
                    arrayVar[i] = parseInt(tempJson["chapter" + i].complete, 10);
                }

                let stringArrayJson = JSON.stringify(arrayVar);
                tempStorage.setItem(pageVar.bundleName + "_array_chapter", stringArrayJson);

                let stringLocalJson = JSON.stringify(tempJson);
                tempStorage.setItem("loadedJSON", stringLocalJson);
                parameters.json = tempJson;
                try {
                    callMgr.sendActionNameWithParameter(js_actionList.js_setContentsDB, parameters);
                } catch (e) {
                    alert(e);
                }
            } else {
                let tempVar = new Object();
                for (var i = 1; i <= pageVar.totalPage; i++) {
                    if (currentData["chapter" + i] == undefined) {
                        currentData["chapter" + i] = new Object();
                        currentData["chapter" + i].complete = "0";
                    }
                    tempVar[i] = parseInt(currentData["chapter" + i].complete, 10);
                }

                let stringArrayJson = JSON.stringify(tempVar);
                tempStorage.setItem(pageVar.bundleName + "_array_chapter", stringArrayJson);
                let stringLocalJson = JSON.stringify(currentData);
                tempStorage.setItem("loadedJSON", stringLocalJson);
            }
        }

        function checkJson() {
            let tempStorage = window.localStorage;
            let array_chapter = JSON.parse(tempStorage.getItem(pageVar.bundleName + "_array_chapter"));

            let parameters = new Object();
            parameters.vendor = pageVar.vendor;
            parameters.bundleName = pageVar.bundleName;
            parameters.bundle_name = pageVar.bundleName;

            let currentData = JSON.parse(tempStorage.getItem("loadedJSON"));
            array_chapter[pageVar.currentPage] += 1;
            currentData["chapter" + pageVar.currentPage].complete = array_chapter[pageVar.currentPage].toString();

            let tempArray = new Array();
            for (let i = 1; i <= pageVar.totalPage; i++) {
                if (currentData["chapter" + i].complete == undefined) {
                    tempArray[i] = 0;
                } else {
                    tempArray[i] = parseInt(currentData["chapter" + i].complete, 10);
                }
            }

            tempArray.splice(0, 1);
            tempArray.sort((a, b) => {
                return a - b;
            });
            currentData.all_complete = tempArray[0].toString();

            let stringArrayJson = JSON.stringify(array_chapter);
            tempStorage.setItem(pageVar.bundleName + "_array_chapter", stringArrayJson);

            let stringLocalJson = JSON.stringify(currentData);
            tempStorage.setItem("loadedJSON", stringLocalJson);
            parameters.json = currentData;
            callMgr.sendActionNameWithParameter(js_actionList.js_setContentsDB, parameters);
        }

        function checkMobile() {
            var ua = navigator.userAgent,
                device;
            var checker = {
                iOS: ua.match(/(iPhone|iPod|iPad|Macintosh|MacIntel)/),
                android: ua.match(/Android/),
            };
            device = checker.iOS != null ? checker.iOS[0] : (device = checker.android[0]);
            console.log(device);
            if (ua.indexOf("Mobile") != -1 || ua.indexOf("Android") != -1) {
                return {
                    mobile: true,
                    device: device,
                };
            } else {
                return {
                    mobile: false,
                    device: device,
                };
            }
        }

        // set screen zoom : return container.style.zoom;
        function screenZoom() {
            var el = document.getElementById("container"),
                screenWidth = window.innerWidth,
                screenHeight = window.innerHeight,
                screenRatio = screenHeight / screenWidth,
                checkMobile = pageVar.checkMobile;
            if (screenWidth > screenHeight) {
                // pc사용자를 위한 체크
                if (screenRatio < 0.75) {
                    if (screenRatio < 0.5) {
                        // iPad 11인치의 경우 iPad로 구분되지 않음..... iPhobe으로 채크
                        if (checkMobile.mobile == true && checkMobile.device == "iPhone") {
                            document.getElementById("stage").style.width = "1464px";
                        }
                    }
                    el.style.zoom = window.innerHeight / 768;
                } else {
                    el.style.zoom = window.innerWidth / 1024;
                }
            } else {
                el.style.zoom = window.innerWidth / 1024;
            }
            return el.style.zoom;
        }
        // addMouseEventListner  /  type "setting"||"add"
        function addEvent(type, element) {
            if (type == "setting") {
                var checkMobile = pageVar.checkMobile,
                    moveEvent = checkMobile.mobile ? "touchmove" : "mousemove",
                    endEvent = checkMobile.mobile ? "touchend" : "mouseup",
                    arrBtn = document.querySelectorAll("*[data-btntype]");
                document.addEventListener(moveEvent, touchMove, { passive: false });
                document.addEventListener(endEvent, touchEnd, { passive: false });
                for (var el of arrBtn) add(el);
            } else {
                add(element);
            }

            function add(element) {
                if (typeof element != "object") element = document.getElementById(element);
                var checkMobile = pageVar.checkMobile,
                    startEvent = checkMobile.mobile ? "touchstart" : "mousedown";
                var btnType = element.getAttribute("data-btntype");
                if (btnType == null) element.setAttribute("dataset-btntype", "contents"); // 이후 추가되는 것은 콘텐츠로 인식
                if (btnType == "ui") {
                    element.addEventListener("click", touchUI, { passive: false });
                } else {
                    element.addEventListener(moveEvent, touchMove, { passive: false });
                    element.addEventListener(startEvent, touchStart, { passive: false });
                }
            }
        }

        // create imageElement.exif /  type "setting"||"add"
        function createFileExif(type, element) {
            if (type == "setting") {
                var arrImages = document.querySelectorAll("[data-seq]");
                for (var element of arrImages) add(element);
            } else {
                add(element);
            }
            function add(element) {
                if (typeof element != "object") element = document.getElementById(element);
                var info = getPath(element);
                element.exif = {
                    sequenceName: info.sequenceName,
                    fileExt: info.fileFormat,
                    totalFrame: Number(element.dataset.seq),
                    fps: element.dataset.fps ? Number(element.dataset.fps) : 100,
                    count: 0,
                    repeat: 0,
                    isPlay: false,
                    timer: "timer_" + element.id,
                };
            }
        }

        // file path return { file / fileName / sequenceName / fileFormat }
        function getPath(element) {
            if (typeof element != "object" && element != "document") element = document.getElementById(element);
            var fullPath = element == "document" ? window.location.pathname : element.src;
            var file = fullPath.substring(fullPath.lastIndexOf("/") + 1); // 파일 ( xxx.html )
            return {
                file: file,
                fileName: file.substring(0, file.lastIndexOf(".")),
                sequenceName: file.substring(0, file.lastIndexOf("_")),
                fileFormat: file.substring(file.lastIndexOf(".")),
            };
        }

        function getMousePosition() {
            var container = document.getElementById("container"),
                zoomScale = container.style.zoom;
            // touch type 판단
            if (pageVar.checkMobile.mobile) {
                var touch = event.changedTouches[0],
                    clientXpos = touch.clientX / zoomScale,
                    clientYpos = touch.clientY / zoomScale;
            } else {
                var clientXpos = event.clientX / zoomScale,
                    clientYpos = event.clientY / zoomScale;
            }
            return {
                x: clientXpos - pageVar.stageMargin,
                y: clientYpos,
            };
        }
        function getCenterPosition(element) {
            var container = document.getElementById("container"),
                xPos = container.offsetWidth / 2 - element.parentElement.offsetLeft - element.offsetWidth / 2 - pageVar.stageMargin,
                yPos = container.offsetHeight / 2 - element.parentElement.offsetTop - element.offsetHeight / 2;
            return { x: xPos, y: yPos };
        }

        function getRandomArray(arr) {
            if (typeof arr == "number") {
                var tempArr = new Array();
                for (var i = 0; i < arr; i++) tempArr.push(i);
                arr = tempArr;
            }
            arr.sort(() => Math.random() - 0.5);
            return arr;
        }

        function getIntersection(element1, element2, rate) {
            var r1 = element1.getBoundingClientRect(),
                r2 = element2.getBoundingClientRect(),
                area = parseInt(r1.width) * parseInt(r1.height),
                interSection,
                rect = {};
            if (r1.left > r2.left + r2.width) return { value: null, percent: 0 };
            if (r1.left + r1.width < r2.left) return { value: null, percent: 0 };
            if (r1.top > r2.top + r2.height) return { value: null, percent: 0 };
            if (r1.top + r1.height < r2.top) return { value: null, percent: 0 };

            rect.x = Math.max(r1.left, r2.left);
            rect.y = Math.max(r1.top, r2.top);
            rect.w = Math.min(r1.left + r1.width, r2.left + r2.width) - rect.x;
            rect.h = Math.min(r1.top + r1.height, r2.top + r2.height) - rect.y;
            interSection = parseInt(((rect.w * rect.h) / area) * 100);
            return interSection > rate ? { value: true, percent: interSection } : { value: false, percent: interSection };
        }

        function setAlignDistribute(element, direction, random) {
            if (typeof element != "object") element = document.getElementById(element);
            var arrItem = new Array(),
                totalSize = 0,
                marginPosition = 0,
                margin = 0,
                clientDirection = direction == "width" ? "offsetWidth" : "offsetHeight",
                clientDirectionO = direction == "width" ? "offsetHeight" : "offsetWidth",
                positionDirection = direction == "width" ? "left" : "top",
                positionDirectionO = direction == "width" ? "top" : "left";

            for (var childElement of element.children) {
                if (childElement.style.display != "none") {
                    arrItem.push(childElement);
                    totalSize += childElement[clientDirection];
                }
            }
            margin = (element[clientDirection] - totalSize) / (arrItem.length + 1);
            if (random == "random") arrItem = getRandomArray(arrItem); //  // random 배치

            for (var childElement of arrItem) {
                // position 속성 체크 및 생성
                var positionProperty = childElement.style.getPropertyValue("position");
                if (positionProperty.indexOf("position") == -1) childElement.style.setProperty("position", "absolute");
                // element 정렬
                // direction에 관한 정렬
                childElement.style[positionDirection] = marginPosition + margin + "px";
                // direction 반대 방향에 관한 center 정렬
                childElement.style[positionDirectionO] = (element[clientDirectionO] - childElement[clientDirectionO]) / 2 + "px";
                marginPosition += margin + childElement[clientDirection];
            }
        }

        function setAlignPosition(currentElement, targetElement, direction, returnValue) {
            if (currentElement && typeof currentElement != "object") currentElement = document.getElementById(currentElement);
            if (targetElement && typeof targetElement != "object") targetElement = document.getElementById(targetElement);
            if (!direction) direction = "xy";
            if (currentElement.style.display == "none") currentElement.style.display = "block";

            var positionProperty = currentElement.style.getPropertyValue("position");
            if (positionProperty.indexOf("position") == -1) {
                currentElement.style.setProperty("position", "absolute"); // style에 position 속성이 없을 경우 position속성을 생성합니다.
            }
            if (!targetElement) {
                var pt = getMousePosition();
                pt = globalToLocal(currentElement, pt);
                currentElement.style.left = pt.x - currentElement.offsetWidth / 2 + pageVar.stageMargin + "px";
                currentElement.style.top = pt.y - currentElement.offsetHeight / 2 + "px";
            } else {
                var pt = localToGlobal(targetElement);
                pt = globalToLocal(currentElement, pt);
                if (!returnValue) {
                    if (direction == "x" || direction == "xy") currentElement.style.left = (targetElement.offsetWidth - currentElement.offsetWidth) / 2 + pt.x + "px";
                    if (direction == "y" || direction == "xy") currentElement.style.top = (targetElement.offsetHeight - currentElement.offsetHeight) / 2 + pt.y + "px";
                } else {
                    return {
                        x: (targetElement.offsetWidth - currentElement.offsetWidth) / 2 + pt.x,
                        y: (targetElement.offsetHeight - currentElement.offsetHeight) / 2 + pt.y,
                    };
                }
            }
        }

        // local > global Coordinates
        function localToGlobal(element) {
            var arr = [element],
                pt = { x: 0, y: 0 };
            while (arr[arr.length - 1].parentNode !== document) {
                arr.push(arr[arr.length - 1].parentNode);
            }
            for (var el of arr) {
                pt.x += el.offsetLeft;
                pt.y += el.offsetTop;
            }
            return pt;
        }
        // global > local Coordinates
        function globalToLocal(element, pt) {
            var arr = [element];
            while (arr[arr.length - 1].parentNode !== document) {
                arr.push(arr[arr.length - 1].parentNode);
            }

            arr.splice(0, 1);
            for (var el of arr) {
                pt.x -= el.offsetLeft;
                pt.y -= el.offsetTop;
            }
            return pt;
        }

        function setAlignScale(currentElement, targetElement, direction) {
            if (typeof currentElement != "object") currentElement = document.getElementById(currentElement);
            if (typeof targetElement != "object") targetElement = document.getElementById(targetElement);
            if (!direction) direction = "xy";
            var positionProperty = currentElement.style.getPropertyValue("position");
            if (positionProperty.indexOf("position") == -1) currentElement.style.setProperty("position", "absolute"); // style에 position 속성이 없을 경우 position속성을 생성합니다.
            var targetStyle = window.getComputedStyle(targetElement);

            if (currentElement.nodeName.toLowerCase() == "canvas") {
                currentElement.width = parseInt(targetStyle.width);
                currentElement.height = parseInt(targetStyle.height);
            } else {
                currentElement.style.width = targetStyle.width;
                currentElement.style.height = targetStyle.height;
            }
            setAlignPosition(currentElement, targetElement, "xy");
        }
        // popup 기능      type : "show" ||"hide"
        function popup(type, element, callBack, dimColor, dimOpacity) {
            if (typeof element != "object") element = document.getElementById(element);
            if (type == "show") {
                dimColor = dimColor ? dimColor : "#000";
                dimOpacity = dimOpacity ? dimOpacity : "0.7";
                $(element).css("display", "block");
                setAlignPosition(element, "contents", "xy");
                var centerY = parseInt(element.style.top);
                $(element).css("top", "800px");
                $("#blackMatte").css({
                    "background-color": dimColor,
                    opacity: dimOpacity,
                });
                $("#blackMatte").fadeIn();
                $(element).animate({ top: centerY }, 500, "easeOutBack", () => {
                    if (callBack) actionList(callBack);
                });
                cssAction(element, "popupScale", 0.2, "remove");
            } else {
                $("#blackMatte").fadeOut();
                $(element).animate({ top: 800 }, 500, "easeOutExpo", () => {
                    if (callBack) actionList(callBack, this);
                });
                cssAction(element, "popupScaleDown", 0.2, "remove", () => {
                    element.style.display = "none";
                });
            }
        }

        // classList에 class를 추가합니다.
        function cssAction(element, actiontype, duration, remove, callBack) {
            if (typeof element != "object") element = document.getElementById(element);
            var remove = remove;
            var callBack = callBack;
            $(element).css("animation-duration", duration + "s");
            $(element).removeClass(actiontype);
            $(element).addClass(actiontype);
            element.addEventListener("animationend", handleAnimationEnd);

            function handleAnimationEnd() {
                if (typeof callBack === "function") callBack(element);
                if (remove == "remove") $(element).removeClass(actiontype).css("animation-duration", "");
                element.removeEventListener("animationend", handleAnimationEnd);
            }
        }

        function arrAction(arr, num, delayTime, currentCommand, nextCommand) {
            if (num == null) num = 0;
            if (num < arr.length) {
                setTimeout(function () {
                    var element = arr[num];
                    actionList(currentCommand, element);
                    setTimeout(function () {
                        arrAction(arr, ++num, delayTime, currentCommand, nextCommand);
                    }, delayTime);
                }, delayTime);
            } else {
                if (nextCommand) {
                    actionList(nextCommand);
                } else {
                    return;
                }
            }
        }

        function createCloneElement(srcElement, targetElement, swapImage) {
            if (typeof srcElement != "object") srcElement = document.getElementById(srcElement);
            var cloneElement = srcElement.cloneNode(true);
            if (targetElement) {
                cloneElement.id = "clone" + targetElement.id;
                targetElement.parentNode.appendChild(cloneElement); // target parent에 할당
            } else {
                if (commonVar.idNumber == undefined) commonVar.idNumber = 0;
                commonVar.idNumber++;
                cloneElement.id = "clone" + srcElement.id + "_" + commonVar.idNumber;
                srcElement.parentNode.appendChild(cloneElement); // src parent에 할당
            }
            if (swapImage != null) cloneElement.src = swapImage.src;
            if (targetElement) setAlignPosition(cloneElement, targetElement, "xy");
            return cloneElement;
        }

        // 장면전환 후 페이지를 이동합니다. type : "fadeOut" 추후 효과 추가 예정
        function pageJump(type, duration, url) {
            var element = $("#container");
            if (type == "fadeOut") {
                $("#container").animate({ opacity: 0 }, duration);
            }
            setTimeout(() => {
                if (url == "home") {
                    callMgr.sendActionNameWithParameter(js_actionList.returnApplication, null);
                } else {
                    location.href = url;
                }
            }, duration);
        }

        // image sequence를 재생합니다. / fpsList에 해당 element ID와 동일한 설정이 있을 경우 frame단위로 fps가 조정됩니다.
        function imgPlay(element, totalRepeat, stopFrame) {
            if (typeof element != "object") element = document.getElementById(element);
            if (totalRepeat == undefined) totalRepeat = 0; // 0일 경우 무한 반복
            if (element.exif.isPlay != undefined && element.exif.isPlay == true) return;

            element.exif.isPlay = true;
            startImgPlay();
            function startImgPlay() {
                if (element.exif.isPlay == false) return;
                element.exif.count++;
                if (element.exif.count > element.exif.totalFrame) {
                    element.exif.count = 1;
                    element.exif.repeat++;
                    if (element.exif.repeat == totalRepeat) {
                        if (stopFrame) {
                            imgStop(element, stopFrame);
                        } else {
                            imgStop(element, 1);
                        }
                        return;
                    }
                }
                var arrFps = fpsList[element.exif.sequenceName]; // fps array 할당
                var currentFps = arrFps ? element.exif.fps * arrFps[element.exif.count - 1] : element.exif.fps;

                element.src = pageVar.imgPath + element.exif.sequenceName + "_" + element.exif.count + element.exif.fileExt;
                element.exif.timer = setTimeout(startImgPlay, currentFps);
                //msg (el.src +" : "+currentFps)   //  시퀀스 재생 확인 필요 시 출력
            }
        }
        // 재생중인 swquence를 stop 합니다.
        function imgStop(element, stopFrame) {
            if (typeof element != "object") element = document.getElementById(element);
            if (!stopFrame) stopFrame = 1;
            clearTimeout(element.exif.timer);
            element.exif.isPlay = false;
            element.exif.count = 1;
            element.exif.repeat = 0;
            element.src = pageVar.imgPath + element.exif.sequenceName + "_" + stopFrame + element.exif.fileExt;
        }
        // 해당 엘리먼트의 src파일을 변경합니다 /  playType이 "play"로 지정된 경우 src변경 후 시퀀스를 재생합니다
        function imgSwap(element, srcImg, playType, totalRepeat) {
            if (typeof element != "object") element = document.getElementById(element);
            if (!totalRepeat) totalRepeat = 0;
            imgStop(element);
            element.src = pageVar.imgPath + srcImg;
            // 바뀐 정보로 Exif 갱신 // 갱신 정보가 없을 경우 기존 데이타로 play // id는 바뀌지 않음.
            createFileExif("add", element);
            var changeElement = document.getElementById(element.exif.sequenceName);
            if (changeElement != null) {
                element.exif.fps = changeElement.dataset.fps ? Number(changeElement.dataset.fps) : 100;
                element.exif.totalFrame = Number(changeElement.dataset.seq);
            }
            if (playType == "play") imgPlay(element, totalRepeat);
        }

        // Drag & Drop : element property가 설정되지 않은 경우 mouseUp position에 Drop합니다.
        function dragHandler(type, element) {
            if (!dragHandlerVar.isDrag) return;
            if (typeof element != "object") element = document.getElementById(element);
            if (type == "drag") {
                $(element).css("z-index", "100");
                setAlignPosition(element);
            } else {
                if (element.property == undefined) {
                    msg("property가 생성되지 않아 drag를 false로 전환합니다");
                    $(element).css("z-index", "");
                    dragHandlerVar.isDrag = false;
                    dragHandlerVar.dragElement = null;
                    return;
                }
                var hitTestObj, isInterSection, cloneElement, isResult;
                // target not defined!
                if (element.property.targetArr.length == 0) {
                    // console.log ("error : Target is not defined!");
                    actionFail(element, null);
                    return;
                    // single target----------------------------------------------------------------
                } else if (element.property.targetArr.length == 1) {
                    hitTestObj = element.property.targetArr[0];
                    isInterSection = getIntersection(element, hitTestObj, 30);
                    isResult = isInterSection.value ? true : false;
                    // multi target ----------------------------------------------------------------
                } else {
                    var arrPercent = new Array(); // 2개 이상 중복히트된 경우 많은 퍼센테이지값을 판별하기 위한 배열
                    arrPercent[0] = new Array(); // percent
                    arrPercent[1] = new Array(); // targetObj
                    for (var i = 0; i < element.property.targetArr.length; i++) {
                        hitTestObj = element.property.targetArr[i];
                        if (hitTestObj != element) {
                            isInterSection = getIntersection(element, hitTestObj, 30);
                            arrPercent[0].push(isInterSection.percent);
                            arrPercent[1].push(hitTestObj);
                        }
                    }
                    var maxNum = arrPercent[0].indexOf(Math.max.apply(null, arrPercent[0])); // 배열 요소 중 가장 높은 수치 추출
                    hitTestObj = arrPercent[1][maxNum];
                    // origin
                    isResult = arrPercent[0][maxNum] > 30 ? true : false;
                }
                if (isResult) {
                    $(element).css({ zIndex: "", left: element.property.x, top: element.property.y });
                    actionSucess(element, hitTestObj, cloneElement);
                } else {
                    $(element).css("z-index", "");
                    actionFail(element, hitTestObj);
                }
                dragHandlerVar.isDrag = false;
                dragHandlerVar.dragElement = null;
            }
        }

        // painting   /    type : drawStart || drawing || drawEnd || reset
        function drawHandler(type) {
            if (type == "init") {
                // canvas group
                var canvasGroup = document.createElement("canvasGroup" + drawHandlerVar.currentCanvasNum);
                $(canvasGroup).css({
                    position: "absolute",
                    width: drawHandlerVar.canvasWidth + "px",
                    height: drawHandlerVar.canvasHeight + "px",
                    marginLeft: drawHandlerVar.margin.x + "px",
                    marginTop: drawHandlerVar.margin.y + "px",
                    top: drawHandlerVar.top + "px",
                });
                document.getElementById("canvasPage").append(canvasGroup);
                drawHandlerVar.currentCanvasGroup = canvasGroup;
                drawHandlerVar.arrPage.push(canvasGroup);

                // canvas
                var canvas = document.createElement("canvas");
                $(canvas).attr("id", "canvas_" + drawHandlerVar.currentCanvasNum);
                canvas.width = drawHandlerVar.canvasWidth;
                canvas.height = drawHandlerVar.canvasHeight;
                canvasGroup.append(canvas);
                drawHandlerVar.currentCanvas = canvas;

                // cover Image가 없을 경우 Scratch로 전환됩니다.
                if (drawHandlerVar.coverImage == null) drawHandlerVar.operation = "destination-out"; // Scratch

                // originImage setting
                if (drawHandlerVar.originImage[drawHandlerVar.currentCanvasNum] != null) {
                    canvasGroup.style.background = " url(" + pageVar.imgPath + drawHandlerVar.originImage[drawHandlerVar.currentCanvasNum] + ")";
                }
                // coverImage setting
                if (drawHandlerVar.coverImage[drawHandlerVar.currentCanvasNum] != null) {
                    var coverElement = document.createElement("div");
                    canvasGroup.append(coverElement);
                    $(coverElement).css({
                        position: "relative",
                        width: drawHandlerVar.canvasWidth + "px",
                        height: drawHandlerVar.canvasHeight + "px",
                        left: "0px",
                        top: -1 * drawHandlerVar.canvasHeight + "px",
                    });
                    coverElement.style.background = " url(" + pageVar.imgPath + drawHandlerVar.coverImage[drawHandlerVar.currentCanvasNum] + ")";
                }
                // context setting
                var ctx = canvas.getContext("2d");
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                ctx.lineWidth = drawHandlerVar.lineWidth;
                ctx.beginPath();
                ctx.fillStyle = drawHandlerVar.canvasBgcolor[[drawHandlerVar.currentCanvasNum]];
                ctx.rect(0, 0, drawHandlerVar.canvasWidth, drawHandlerVar.canvasHeight);
                ctx.fill();
            } else if (type == "drawStart") {
                var canvasGroup = drawHandlerVar.currentCanvasGroup;
                var ctx = document.getElementById("canvas_" + drawHandlerVar.currentCanvasNum).getContext("2d");
                var pt = getMousePosition();
                drawHandlerVar.isDrag = true;
                drawHandlerVar.dragElement = canvas;
                ctx.beginPath();
                ctx.moveTo(pt.x - canvasGroup.offsetLeft, pt.y - canvasGroup.offsetTop);
            } else if (type == "drawing") {
                var canvasGroup = drawHandlerVar.currentCanvasGroup;
                var ctx = document.getElementById("canvas_" + drawHandlerVar.currentCanvasNum).getContext("2d");
                var pt = getMousePosition();
                ctx.strokeStyle = drawHandlerVar.lineColor;
                ctx.lineTo(pt.x - canvasGroup.offsetLeft, pt.y - canvasGroup.offsetTop);
                ctx.globalCompositeOperation = drawHandlerVar.operation;
                ctx.stroke();
            } else if (type == "drawEnd") {
                var canvasGroup = drawHandlerVar.currentCanvasGroup;
                var ctx = document.getElementById("canvas_" + drawHandlerVar.currentCanvasNum).getContext("2d");
                drawHandlerVar.isDrag = false;
                drawHandlerVar.dragElement = null;
                ctx.closePath();
            } else if (type == "reset") {
                var canvas = document.getElementById("canvas_" + drawHandlerVar.currentCanvasNum);
                var ctx = canvas.getContext("2d");
                ctx.globalCompositeOperation = "source-over";
                // ctx.clearRect(0, 0, drawHandlerVar.canvasWidth, drawHandlerVar.canvasHeight);
                ctx.beginPath();
                ctx.fillStyle = drawHandlerVar.canvasBgcolor[[drawHandlerVar.currentCanvasNum]];
                ctx.rect(0, 0, drawHandlerVar.canvasWidth, drawHandlerVar.canvasHeight);
                ctx.fill();
                // 지우개(배경 칼라로 설정되어 있는 경우)로 firstColor로 전환
                if (drawHandlerVar.canvasBgcolor[drawHandlerVar.currentCanvasNum] == drawHandlerVar.lineColor) {
                    var selectElement = document.getElementById("colorset_" + drawHandlerVar.firstColot);
                    drawHandlerVar.lineColor = drawHandlerVar.colorSet[drawHandlerVar.firstColot];
                    selectHandler(selectElement);
                }
            }
        }

        // cardHandler : type = "setting" || "check"
        function cardHandler(type, element, userStep) {
            if (type == "setting") {
                // 주요 변수 셋팅
                var stage = document.getElementById("stage"),
                    contents = document.getElementById("contents"),
                    card = document.getElementById("card"),
                    arrCardList = new Array(),
                    currentTotalCard = cardHandlerVar.totalCard[commonVar.userStep], // 현 레벨의 토달 카드
                    currentCols = currentTotalCard < cardHandlerVar.maxCols ? currentTotalCard : cardHandlerVar.maxCols, // cols Number   // 가로 칸 수
                    currentRows = (currentTotalCard * 2) / currentCols, // total rows
                    frontCard0 = cardHandlerVar.frontCard0,
                    frontCard1 = cardHandlerVar.frontCard1,
                    backCard = cardHandlerVar.backCard,
                    resultCard = cardHandlerVar.resultCard,
                    imageFileFormat = cardHandlerVar.imageFileFormat,
                    margin = cardHandlerVar.margin;
                commonVar.totalScore = cardHandlerVar.totalCard[userStep];

                // 카드의 총 길이를 계산하여 동적으로 생성되는 cardGroup element의 width 및 카드의 축소 사이즈 산출
                var cardTotalWidth = currentCols * parseInt(card.style.width) + (currentCols + 1) * margin, // margin을 포함한 총 카드 길이
                    cardTotalHeight = currentRows * parseInt(card.style.height) + (currentRows + 1) * margin, // margin을 포함한 총 카드 길이
                    scaleRate = 1;
                scaleRate = Math.min((stage.offsetWidth * 0.8) / cardTotalWidth, (stage.offsetHeight * 0.9) / cardTotalHeight);
                scaleRate = scaleRate > 1 ? 1 : scaleRate;
                var divWidth = cardTotalWidth * scaleRate;
                var divHeight = cardTotalHeight * scaleRate;
                margin = margin * scaleRate;

                // cardGroupElement 생성 스타일 적용
                var cardGroupElement = document.createElement("div");
                $(cardGroupElement)
                    .attr("id", "cardGroup")
                    .css({
                        position: "absolute",
                        width: divWidth,
                        height: divHeight,
                        marginTop: "20px",
                    })
                    .addClass("flex-container");
                contents.append(cardGroupElement);
                contents.insertBefore(cardGroupElement, document.getElementById("card"));
                setAlignPosition(cardGroup, "container", "xy");

                // card 생성 및 주요 셋팅
                for (var i = 0; i < 2; i++) {
                    for (var j = 0; j < currentTotalCard; j++) {
                        var cloneElement = createCloneElement("card", null),
                            cloneFrontCard = cloneElement.querySelector(".flip-card-front img"),
                            cloneBackCard = cloneElement.querySelector(".flip-card-back img"),
                            srcImage,
                            srcImageBack,
                            _j = cardHandlerVar.cardTotalIndex[j];
                        // front card : 같은 또는 서로 다른 카드 출력
                        if (cardHandlerVar.frontCard1 == null) {
                            srcImage = pageVar.imgPath + frontCard0 + "_" + (_j + 1) + imageFileFormat; // front card : 같은 이미지 출력
                        } else {
                            srcImage = pageVar.imgPath + cardHandlerVar["frontCard" + i] + "_" + (_j + 1) + imageFileFormat; // front card : 다른 이미지 출력
                        }
                        // back card : 고유의 back immage 사용 시
                        if (backCard != null) {
                            $(cloneBackCard)
                                .attr("src", pageVar.imgPath + backCard + "_" + (_j + 1) + imageFileFormat)
                                .css({
                                    width: cardHandlerVar.width[commonVar.userStep % 2] * 1.1 + "px",
                                    height: cardHandlerVar.height[commonVar.userStep % 2] * 1.1 + "px",
                                });
                        }
                        // 결과 카드 사용 시
                        if (resultCard != null) {
                            cloneElement.srcResult = pageVar.imgPath + resultCard + "_" + (_j + 1) + imageFileFormat; //
                        }
                        // 카드 주요 셋팅
                        cloneFrontCard.src = srcImage; // src 이미지 변경
                        cloneElement.isPress = false; // 선택한 카드를 다시 touch하는 것 방지
                        cloneElement.index = _j; // 정답 판별을 위한 index부여
                        $(cloneElement)
                            .addClass("flip-card-active")
                            .css({
                                opacity: 0,
                                zIndex: "",
                                marginLeft: margin / 2 + "px",
                                marginRight: margin / 2 + "px",
                                width: parseInt(card.style.width) * scaleRate * 0.9 + "px",
                                height: parseInt(card.style.height) * scaleRate * 0.9 + "px",
                            });
                        cloneElement.front = cloneFrontCard;
                        arrCardList.push(cloneElement);
                        addEvent("add", cloneElement); // touchEvent 추가
                    }
                }

                // set card Position ----------------------------
                arrCardList.sort(() => Math.random() - 0.5); // array random
                cardHandlerVar.arrCardList = arrCardList;
                for (var element of arrCardList) cardGroupElement.append(element);
                for (var element of arrCardList) {
                    element.x = element.offsetLeft - margin / 2;
                    element.y = element.offsetTop;
                }

                //originCard
                setAlignPosition(card, "contents", "x");
                $(card).css({ position: "absolute", top: "800px" });
                actionList("cardShow");
            } else if (type == "check") {
                if (element.isPress == false) {
                    if (commonVar.isHold == true) return;
                    element.isPress = true;
                    cardHandlerVar.arrResult.push(element);
                    commonVar.isHold = true;
                    if (cardHandlerVar.arrResult.length == 1) {
                        // origin
                        element.addEventListener("transitionend", transitionend);
                        function transitionend() {
                            element.removeEventListener("transitionend", transitionend);
                            commonVar.isHold = false;
                        }
                    }
                    $(element).addClass("flip-card-active");

                    // result check
                    if (cardHandlerVar.arrResult.length == 2) {
                        commonVar.isHold = true;
                        var isResult = cardHandlerVar.arrResult[0].index == cardHandlerVar.arrResult[1].index ? true : false;

                        // origin
                        cardHandlerVar.arrResult[1].addEventListener("transitionend", transitionEnd);
                        function transitionEnd() {
                            cardHandlerVar.arrResult[1].removeEventListener("transitionend", transitionEnd);
                            if (isResult) {
                                actionSucess(cardHandlerVar.arrResult[0], cardHandlerVar.arrResult[1]);
                            } else {
                                actionFail(cardHandlerVar.arrResult[0], cardHandlerVar.arrResult[1]);
                            }
                            cardHandlerVar.arrResult = [];
                        }
                    }
                }
            } else if (type == "init") {
                // 재 시작을 위한 주요 초기화
                var card = document.getElementById("card");
                $("#cardGroup").remove();
                cardHandlerVar.cardTotalIndex.splice(0, cardHandlerVar.totalCard[userStep - 1]);
                $(card).css("position", "");
                contentsMgr.cardHandler("setting", null, commonVar.userStep);
            }
        }

        // sound type : single || duplicate || bgm || bgmStop || stopAllSound || stopSound
        // callBack : file || function (command )   callBack에 함수가 아닌 mp3를 직접 입력 가능!
        function soundPlayer(type, file, delay, callBack, command) {
            if (delay == undefined) delay = 0;
            if (file != undefined) var path = pageVar.soundPath + file;
            if (type == "single" || type == "duplicate") {
                // var path = pageVar.soundPath + file;
                if (type == "single") {
                    if (soundVar.singleSound == undefined) soundVar.singleSound = new Array();
                    if (soundVar.singleSound.length > 0) {
                        for (var single of soundVar.singleSound) {
                            soundMgr.stopSound(single);
                            soundVar.singleSound.splice(0, 1);
                        }
                    }
                    soundVar.singleSound.push(path);
                }
                if (soundVar.file == undefined) {
                    var player = new Audio(path);
                    player.addEventListener("loadedmetadata", function () {
                        soundVar[file] = player.duration * 1000 + delay;
                        player.removeEventListener("loadedmetadata", soundPlayer);
                        soundMgr.playSound(path);
                        if (callBack != undefined) call();
                    });
                } else {
                    soundMgr.playSound(path);
                    if (callBack != undefined) call();
                }
                function call() {
                    if (typeof callBack == "function") {
                        setTimeout(function () {
                            callBack(command);
                        }, soundVar[file]);
                    } else {
                        setTimeout(function () {
                            soundPlayer("single", callBack);
                        }, soundVar[file]);
                    }
                }
            } else if (type == "bgm") {
                soundMgr.playBackGroundSound(path);
            } else if (type == "stopBgm") {
                soundMgr.stopBackGroundSound();
            } else if (type == "stopAllSound") {
                soundMgr.stopAllSound();
            } else if (type == "stopSound") {
                soundMgr.stopSound(path);
            }
        }

        // type: "init" || "drag" || "match"
        function lineMatchHandler(type) {
            switch (type) {
                case "init":
                    lineMatchHandlerVar.canvas = document.getElementById("tempCanvas");
                    contentsMgr.setAlignScale("tempCanvas", "contents", "xy");
                    $(lineMatchHandlerVar.canvas).css({ top: "", left: "" });
                    lineMatchHandlerVar.ctx = lineMatchHandlerVar.canvas.getContext("2d");
                    lineMatchHandlerVar.cw = lineMatchHandlerVar.canvas.getBoundingClientRect().width;
                    lineMatchHandlerVar.ch = lineMatchHandlerVar.canvas.getBoundingClientRect().height;
                    document.addEventListener("touchend", touchEnd, false);
                    document.addEventListener("mouseup", touchEnd, false);
                    break;
                case "drag":
                    lineMatchHandlerVar.ept = contentsMgr.getMousePosition();
                    // 백업 복구하고 현재 선 그림
                    lineMatchHandlerVar.ctx.putImageData(lineMatchHandlerVar.backup, 0, 0);
                    lineMatchHandlerVar.ctx.beginPath();
                    if (lineMatchHandlerVar.currentItem.parentElement.id == "upperDiv") {
                        lineMatchHandlerVar.ctx.moveTo(
                            lineMatchHandlerVar.currentItem.offsetLeft + lineMatchHandlerVar.currentItem.clientWidth / 2 - 38,
                            lineMatchHandlerVar.currentItem.parentElement.offsetTop + lineMatchHandlerVar.currentItem.clientHeight
                        );
                    } else {
                        lineMatchHandlerVar.ctx.moveTo(
                            lineMatchHandlerVar.currentItem.offsetLeft + lineMatchHandlerVar.currentItem.clientWidth / 2 - 38,
                            lineMatchHandlerVar.currentItem.parentElement.offsetTop
                        );
                    }
                    lineMatchHandlerVar.ctx.lineTo(lineMatchHandlerVar.ept.x, lineMatchHandlerVar.ept.y);
                    lineMatchHandlerVar.ctx.lineWidth = 20;
                    lineMatchHandlerVar.ctx.lineCap = "round";
                    lineMatchHandlerVar.ctx.strokeStyle = lineMatchHandlerVar.lineColor[0];
                    lineMatchHandlerVar.ctx.stroke();
                    break;
                case "match":
                    let x = pageVar.checkMobile.mobile ? event.changedTouches[0].clientX : event.clientX;
                    let y = pageVar.checkMobile.mobile ? event.changedTouches[0].clientY : event.clientY;
                    var hitElement = document.elementFromPoint(x, y).parentElement;
                    if (hitElement == null) {
                        lineMatchHandlerVar.ctx.closePath();
                        lineMatchHandlerVar.ctx.clearRect(0, 0, lineMatchHandlerVar.cw, lineMatchHandlerVar.ch);
                        lineMatchHandlerVar.ctx.putImageData(lineMatchHandlerVar.backup, 0, 0);
                        lineMatchHandlerVar.isDraw = false;
                        commonVar.isHold = false;
                    } else if (lineMatchHandlerVar.currentItem.num != hitElement.num || lineMatchHandlerVar.currentItem == hitElement || hitElement.isResult) {
                        lineMatchHandlerVar.ctx.closePath();
                        lineMatchHandlerVar.ctx.clearRect(0, 0, lineMatchHandlerVar.cw, lineMatchHandlerVar.ch);
                        lineMatchHandlerVar.ctx.putImageData(lineMatchHandlerVar.backup, 0, 0);
                        lineMatchHandlerVar.isDraw = false;
                        actionFail(lineMatchHandlerVar.currentItem, hitElement);
                    } else {
                        lineMatchHandlerVar.ept = getMousePosition();
                        // 백업 복구하고 현재 선 그림
                        lineMatchHandlerVar.ctx.putImageData(lineMatchHandlerVar.backup, 0, 0);
                        lineMatchHandlerVar.ctx.beginPath();
                        if (hitElement.parentElement.id == "lowerDiv") {
                            lineMatchHandlerVar.ctx.moveTo(
                                lineMatchHandlerVar.currentItem.offsetLeft + lineMatchHandlerVar.currentItem.clientWidth / 2 - 38,
                                lineMatchHandlerVar.currentItem.parentElement.offsetTop + lineMatchHandlerVar.currentItem.clientHeight
                            );
                            lineMatchHandlerVar.ctx.lineTo(hitElement.offsetLeft + hitElement.clientWidth / 2 - 38, hitElement.parentElement.offsetTop);
                        } else {
                            lineMatchHandlerVar.ctx.moveTo(
                                lineMatchHandlerVar.currentItem.offsetLeft + lineMatchHandlerVar.currentItem.clientWidth / 2 - 38,
                                lineMatchHandlerVar.currentItem.parentElement.offsetTop
                            );
                            lineMatchHandlerVar.ctx.lineTo(hitElement.offsetLeft + hitElement.clientWidth / 2 - 38, hitElement.parentElement.offsetTop + hitElement.clientHeight);
                        }

                        lineMatchHandlerVar.ctx.lineWidth = 20;
                        lineMatchHandlerVar.ctx.lineCap = "round";
                        lineMatchHandlerVar.ctx.strokeStyle = lineMatchHandlerVar.lineColor[0];
                        lineMatchHandlerVar.ctx.stroke();
                        lineMatchHandlerVar.isDraw = false;
                        actionSucess(lineMatchHandlerVar.currentItem, hitElement);
                    }
                    break;
                default:
                    break;
            }
        }

        // Return //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        return {
            onLoadAction: function () {
                return onLoadAction();
            },
            addEvent: function (type, element) {
                return addEvent(type, element);
            },
            getPath: function (element) {
                return getPath(element);
            },
            getMousePosition: function () {
                return getMousePosition();
            },
            getCenterPosition: function (element) {
                return getCenterPosition(element);
            },
            getRandomArray: function (arr) {
                return getRandomArray(arr);
            },
            getIntersection: function (element1, element2, rate) {
                return getIntersection(element1, element2, rate);
            },
            setAlignDistribute: function (elementId, direction, random) {
                return setAlignDistribute(elementId, direction, random);
            },
            setAlignPosition: function (currentElement, targetElement, direction, returnValue) {
                return setAlignPosition(currentElement, targetElement, direction, returnValue);
            },
            setAlignScale: function (currentElement, targetElement, direction) {
                return setAlignScale(currentElement, targetElement, direction);
            },
            createCloneElement: function (srcElement, targetElement, swapImage) {
                return createCloneElement(srcElement, targetElement, swapImage);
            },
            popup: function (type, element, callBack, dimColor, dimOpacity) {
                return popup(type, element, callBack, dimColor, dimOpacity);
            },
            cssAction: function (element, actiontype, duration, remove, callback) {
                return cssAction(element, actiontype, duration, remove, callback);
            },
            imgPlay: function (element, totalRepeat, stopFrame) {
                return imgPlay(element, totalRepeat, stopFrame);
            },
            imgStop: function (element, stopFrame) {
                return imgStop(element, stopFrame);
            },
            imgSwap: function (element, srcImg, playType, totalRepeat) {
                return imgSwap(element, srcImg, playType, totalRepeat);
            },
            dragHandler: function (type, element) {
                return dragHandler(type, element);
            },
            drawHandler: function (type, element) {
                return drawHandler(type, element);
            },
            pageJump: function (type, duration, URL) {
                return pageJump(type, duration, URL);
            },
            cardHandler: function (type, element, userStep) {
                return cardHandler(type, element, userStep);
            },
            soundPlayer: function (type, file, delay, callBack, command) {
                return soundPlayer(type, file, delay, callBack, command);
            },
            lineMatchHandler: function (type) {
                return lineMatchHandler(type);
            },
            localToGlobal: function (element) {
                return localToGlobal(element);
            },
            createFileExif: function (type, element) {
                return createFileExif(type, element);
            },
            checkJson: function () {
                return checkJson();
            },
            arrAction: function (arr, num, delayTime, currentCommand, nextCommand) {
                return arrAction(arr, num, delayTime, currentCommand, nextCommand);
            },
        };
    }
    return {
        getInstance: function () {
            if (!instance) {
                instance = init();
            }
            return instance;
        },
    };
})();
