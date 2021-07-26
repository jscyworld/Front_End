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
            window.onresize = () => {
                setTimeout(() => {
                    screenZoom();
                }, 5);
                pageVar.stageMargin = container.clientWidth != stage.clientWidth ? (container.clientWidth - stage.clientWidth) / 2 : 0; // iphoneX 인 경우
            };
            pageVar.stageMargin = container.clientWidth != stage.clientWidth ? (container.clientWidth - stage.clientWidth) / 2 : 0; // iphoneX 인 경우
            addEvent("setting");
            createFileExif("setting");
            if (typeof effectVar != "undefined") effectLoad(effectVar);
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
                callMgr.sendActionNameWithParameter(KYC_ActionList.KYC_RequestContentsDB, parameters);
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
                    callMgr.sendActionNameWithParameter(KYC_ActionList.KYC_SetContentsDB, parameters);
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
            callMgr.sendActionNameWithParameter(KYC_ActionList.KYC_SetContentsDB, parameters);
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
            $("#container").removeClass("top-layer");
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
                    if (direction == "x" || direction == "xy")
                        currentElement.style.left = (targetElement.offsetWidth - currentElement.offsetWidth) / 2 + pt.x + "px";
                    if (direction == "y" || direction == "xy")
                        currentElement.style.top = (targetElement.offsetHeight - currentElement.offsetHeight) / 2 + pt.y + "px";
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
                    callMgr.sendActionNameWithParameter(KYC_ActionList.KYC_ReturnApplication, null);
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
                        if (stopFrame != null) {
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
        // motion group 내의 action element on/off하여 캐릭터 액션을 change합니다.
        function imgClip(element, target) {
            if (typeof element != "object") element = document.getElementById(element);
            for (var childElement of element.children) {
                if (childElement.id == element.id + "_" + target) {
                    childElement.style.display = "block";
                    imgPlay(childElement);
                } else {
                    childElement.style.display = "none";
                }
            }
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
                    element.style.left = element.property.x;
                    element.style.top = element.property.y; // 클론 오브젝트 위치 지정
                    element.style.zIndex = "";
                    actionSucess(element, hitTestObj, cloneElement);
                } else {
                    element.style.zIndex = "";
                    actionFail(element, hitTestObj);
                }
                dragHandlerVar.isDrag = false;
                dragHandlerVar.dragElement = null;
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

        // lottie
        function loadScript(url, callback) {
            var script = document.createElement("script");
            script.src = "effect/" + url + ".js";
            document.getElementsByTagName("head")[0].appendChild(script);
            script.onload = function () {
                callback(url);
            };
        }

        function effectLoad(effectObject) {
            for (var key in effectObject) {
                loadScript(key, lottieLoad);
                function lottieLoad(key) {
                    var lottieElement = document.getElementById(key);
                    effectObject[key] = bodymovin.loadAnimation({
                        container: lottieElement,
                        renderer: "svg",
                        loop: true,
                        autoplay: true,
                        // path: "effect/"+ key + ".json";
                        animationData: eval("src_" + key),
                    });
                }
            }
        }

        function effectAnimation(effectElement, targetElement, scale, speed, loop, callback, parameters) {
            if (typeof effectElement != "object") effectElement = document.getElementById(effectElement);
            if (targetElement != null && typeof targetElement != "object") {
                targetElement = document.getElementById(targetElement);
            }
            loop = loop || 0;
            speed = speed || 1;
            scale = scale || 1;
            var lottie = effectVar[effectElement.id];
            // effectElement.style.display = "block"; // 초기화
            // effectElement.style.transform = "scale(" + scale + ")"; // 초기화
            $(effectElement).css({ display: "block", transform: `scale(${scale})` });
            if (targetElement == null) {
                // var pt = getMousePosition();
                // effectElement.style.left = pt.x - (effectElement.offsetWidth/2) + "px";
                // effectElement.style.top = pt.y - (effectElement.offsetHeight/2) + "px";
            } else {
                setAlignPosition(effectElement, targetElement, "xy");
            }
            lottie.setSpeed(speed);
            lottie.goToAndPlay(1, false);
            if (loop != 0) {
                var loopCount = 0;
                lottie.addEventListener("loopComplete", () => {
                    loopCount++;
                    if (loopCount == loop) {
                        lottie.stop();
                        $(effectElement).css("display", "none");
                        if (callback) callback(parameters);
                    }
                });
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
            imgClip: function (element, target) {
                return imgClip(element, target);
            },
            dragHandler: function (type, element) {
                return dragHandler(type, element);
            },
            pageJump: function (type, duration, URL) {
                return pageJump(type, duration, URL);
            },
            soundPlayer: function (type, file, delay, callBack, command) {
                return soundPlayer(type, file, delay, callBack, command);
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
            effectAnimation: function (effectElement, targetElement, scale, speed, loop, callback, parameters) {
                return effectAnimation(effectElement, targetElement, scale, speed, loop, callback, parameters);
            },
            effectLoad: function (effectObject) {
                return effectLoad(effectObject);
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
