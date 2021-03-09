"use strict";

var contentsMgr = ContentsMgr.getInstance();
var soundMgr = js_soundMgr.getInstance();
var callMgr = js_callMgr.getInstance();

var pageVar = {
        totalPage: 6,
        currentPage: 6,
        checkMobile: null,
        document: null,
        imgPath: null,
        soundPath: null,
        vendor: "jlskke",
        bundleName: "jlskke_stage11_unit1_02",
    },
    commonVar = {
        isDev: false,
        hitCount: 0,
        userStep: 0,
        totalStep: 4,
        isMsg: true,
        isGameStart: false,
        isPlay: false,
        isHold: true,
    },
    drawHandlerVar = {
        // *** 아래 페인팅 변수를 수정해 주세요 Var ***********************
        pageNumber: 0,
        canvasBgcolor: ["rgba(255,255,255,0)"],
        colorSet: ["rgb(238,86,166)", "rgb(102,196,53)", "rgb(154,96,211)", "rgb(33,157,229)", "rgb(236,76,80)", "rgb(246,122,33)", "rgb(247,180,46)"],
        originImage: [],
        coverImage: [],
        margin: { x: 0, y: 0 },
        top: 150,
        lineWidth: 60,
        transition: "fadeIn",
        firstColor: 1,
        currentColor: 0,
        operation: "source-over", //무지개 칼라(지우개)를 default로 설정할 경우 'destination-out';
        // end ****************************************************
        arrPage: new Array(),
        currentCanvasNum: 0,
        prevCanvasNum: 0,
        isHold: true,
        isDrag: false,
        dragElement: null,
        prevPen: null,
    },
    soundVar = {},
    fpsList = {
        endingFinale: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        introCheck: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    };

// contents set ---------------------------------------------------------------------------
window.onload = function () {
    contentsMgr.onLoadAction();
    drawHandlerVar.canvasWidth = 830;
    drawHandlerVar.canvasHeight = 320;
    contentsMgr.drawHandler("init");
    setTimeout(() => {
        actionList("introBridge");
    }, 1000);
    // setInteraction();
};

// setting -------------------------------------------------------------------------------------
function setInteraction() {
    contentsMgr.addEvent("add", "drawArea");
    for (var i = 0; i < 7; i++) {
        let pen = document.getElementById("pen" + i);
        pen.num = i;
        contentsMgr.addEvent("add", pen);
    }
    drawHandlerVar.prevPen = document.getElementById("pen0");
    contentsMgr.addEvent("add", "completeBtn");
    contentsMgr.soundPlayer("duplicate", "word" + commonVar.userStep + ".mp3", 0, () => {
        commonVar.isHold = false;
    });
}

function actionList(type, element) {
    var topCard = document.getElementById("card");
    switch (type) {
        case "introBridge":
            $("#blackMatte").css("display", "block");
            contentsMgr.popup("show", "introPopup", null, "#000000", 0.7);
            $("#introPopup").css("display", "");
            contentsMgr.imgPlay("introPlay");
            contentsMgr.soundPlayer("single", "intro.mp3", 1500, () => {
                actionList("hideIntro");
            });
            break;
        case "hideIntro":
            contentsMgr.popup("hide", "introPopup");
            contentsMgr.soundPlayer("single", "popupHide.mp3", 1000, setInteraction);
            break;
        case "endGame":
            if (!commonVar.isDev) contentsMgr.checkJson();
            contentsMgr.soundPlayer("single", "ending.mp3");
            $("#blackMatte").css("display", "block");
            contentsMgr.popup("show", "endingPopup", null, "#000000", 0.7);
            $("#endingPopup").css("display", "");
            contentsMgr.imgPlay("endingFinale");
            break;
        default:
            break;
    }
}

// UI -------------------------------------------------------------------------------------
function touchUI() {
    contentsMgr.soundPlayer("stopAllSound");
    contentsMgr.cssAction(this, "effect_touch", 0.4, "remove");
    switch (this.id) {
        case "btnBack":
            contentsMgr.pageJump("fadeOut", 70, "index.html");
            break;
        case "btnReplay":
            contentsMgr.pageJump("fadeOut", 70, "page6.html");
            break;
        case "btnHome":
            contentsMgr.pageJump(null, 0, "home");
            break;
        default:
            break;
    }
}

// Contents Action -------------------------------------------------------------------------
function touchStart() {
    if (commonVar.isHold) return;
    if (this.id == "drawArea") {
        drawHandlerVar.lineColor = drawHandlerVar.colorSet[drawHandlerVar.currentColor];
        contentsMgr.drawHandler("drawStart");
        let ctx = document.getElementById("canvas_" + drawHandlerVar.currentCanvasNum).getContext("2d");
        drawHandlerVar.backup = ctx.getImageData(0, 0, drawHandlerVar.canvasWidth, drawHandlerVar.canvasHeight);
        let pt = contentsMgr.getMousePosition();
        $("#observer").css({ left: pt.x - $("#observer").width() / 2, top: pt.y - $("#observer").height() / 2 });
        setHitObj(document.getElementById("observer"));
    } else if (this.id.includes("pen")) {
        contentsMgr.soundPlayer("single", "effect_touch.mp3");
        $(drawHandlerVar.prevPen).attr("src", pageVar.imgPath + "pen" + drawHandlerVar.prevPen.num + ".png");
        $(this).attr("src", pageVar.imgPath + "penSelect" + this.num + ".png");
        drawHandlerVar.prevPen = this;
        drawHandlerVar.currentColor = this.num;
    } else {
        commonVar.isHold = true;
        contentsMgr.cssAction(this, "effect_touch", 0.3, "remove");
        let ctx = document.getElementById("canvas_" + drawHandlerVar.currentCanvasNum).getContext("2d");
        ctx.beginPath();
        ctx.fillStyle = drawHandlerVar.colorSet[drawHandlerVar.currentColor];
        ctx.rect(0, 0, drawHandlerVar.canvasWidth, drawHandlerVar.canvasHeight);
        ctx.fill();
        contentsMgr.soundPlayer("single", "effect_touch.mp3", 0, actionSucess);
    }
}

function setHitObj(observer) {
    for (var i = 0; i < commonVar.totalStep; i++) {
        let hitObj = document.getElementById("hitObj" + i);
        hitObj.timer = setInterval(() => {
            hitTest(observer, hitObj);
        }, 10);
    }
}

function hitTest(observer, hitObj) {
    if (contentsMgr.getIntersection(observer, hitObj, 5).value) {
        clearInterval(hitObj.timer);
        commonVar.hitCount++;
        if (commonVar.hitCount == commonVar.totalStep) {
            commonVar.hitCount = 0;
            $("#completeBtn").css({ opacity: 1, pointerEvents: "" });
        }
    }
}

function touchMove(event) {
    event.preventDefault();
    if (drawHandlerVar.isDrag) {
        contentsMgr.drawHandler("drawing");
        let pt = contentsMgr.getMousePosition();
        $("#observer").css({ left: pt.x - $("#observer").width() / 2, top: pt.y - $("#observer").height() / 2 });
    }
}

function touchEnd() {
    if (drawHandlerVar.isDrag) {
        contentsMgr.drawHandler("drawEnd");
    }
}

function actionSucess(itemObj, targetObj, cloneElement) {
    contentsMgr.soundPlayer("duplicate", "word" + commonVar.userStep + ".mp3", 1000, () => {
        commonVar.userStep++;
        if (commonVar.userStep == commonVar.totalStep) {
            setTimeout(() => {
                actionList("endGame");
            }, 1500);
        } else {
            $("#step" + (commonVar.userStep - 1)).attr("src", pageVar.imgPath + "progress1.png");
            $("#step" + commonVar.userStep).attr("src", pageVar.imgPath + "progress2.png");
            let ctx = document.getElementById("canvas_" + drawHandlerVar.currentCanvasNum).getContext("2d");
            ctx.clearRect(0, 0, drawHandlerVar.canvasWidth, drawHandlerVar.canvasHeight);
            $("#completeBtn").css({ opacity: 0.4, pointerEvents: "none" });
            $("#panel").attr("src", pageVar.imgPath + "panel" + commonVar.userStep + ".png");
            contentsMgr.soundPlayer("duplicate", "word" + commonVar.userStep + ".mp3", 0, () => {
                commonVar.isHold = false;
            });
        }
    });
}

function actionFail(itemObj, targetObj) {}

function msg(message) {
    if (commonVar.isMsg) console.log(message);
}
