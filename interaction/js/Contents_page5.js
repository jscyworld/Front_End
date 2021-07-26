"use strict";

var contentsMgr = ContentsMgr.getInstance();
var soundMgr = js_soundMgr.getInstance();
var callMgr = js_callMgr.getInstance();

var pageVar = {
        totalPage: 6,
        currentPage: 5,
        checkMobile: null,
        document: null,
        imgPath: null,
        soundPath: null,
        vendor: "jlskke",
        bundleName: "jlskke_stage11_unit1_01",
    },
    commonVar = {
        isDev: false,
        totalStep: 1,
        userStep: 0,
        count: 0,
        isHold: true,
        isMsg: true,
    },
    soundVar = {},
    fpsList = {
        endingOdd: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        introPractice: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    };

// contents set ---------------------------------------------------------------------------
window.onload = function () {
    contentsMgr.onLoadAction();
    setTimeout(() => {
        actionList("introBridge");
    }, 1000);
    // setInteraction();
};

// setting -------------------------------------------------------------------------------------
function setInteraction() {
    let selectObj = null;
    if (commonVar.userStep == 0) {
        $("#step1").attr("src", pageVar.imgPath + "progress2.png");
        $("#step2").attr("src", pageVar.imgPath + "progress1.png");
    } else {
        $("#step1").attr("src", pageVar.imgPath + "progress1.png");
        $("#step2").attr("src", pageVar.imgPath + "progress2.png");
    }
    for (var i = 0; i < document.getElementById("upperDiv").childElementCount; i++) {
        if (commonVar.userStep == 0) {
            selectObj = document.getElementById("card" + i + "PicSelectObj");
            selectObj.origin = document.getElementById("card" + i + "Pic");
            selectObj.origin.pair = document.getElementById("card" + i + "Txt");
        } else {
            selectObj = document.getElementById("card" + i + "TxtSelectObj");
            selectObj.origin = document.getElementById("card" + i + "Txt");
            selectObj.origin.pair = document.getElementById("card" + i + "Pic");
        }
        $(selectObj).addClass("highlightEffect");
        selectObj.result = false;
        selectObj.origin.index = i;
        contentsMgr.addEvent("add", selectObj);
    }
    contentsMgr.soundPlayer("single", "panelShow.mp3", 0, () => {
        commonVar.isHold = false;
    });
}

function actionList(type, element) {
    switch (type) {
        case "introBridge":
            $("#blackMatte").css("display", "block");
            contentsMgr.popup("show", "introPopup", null, "#000000", 0.7);
            $("#introPopup").css("display", "");
            contentsMgr.imgPlay("introPractice");
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
            contentsMgr.imgPlay("endingOdd");
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
            contentsMgr.pageJump("fadeOut", 70, "page5.html");
            break;
        case "btnNext":
            contentsMgr.pageJump("fadeOut", 70, "page6.html");
            break;
        default:
            break;
    }
}

// Contents Action -------------------------------------------------------------------------
function touchStart() {
    if (commonVar.isHold) return;
    if (this.result) return;
    commonVar.isHold = true;
    commonVar.count++;
    this.result = true;
    $(this).removeClass("highlightEffect").css("opacity", 0);
    let tempCard = this.origin;
    $(tempCard).addClass("flip-card-active");
    contentsMgr.soundPlayer("duplicate", "effect_sucess.mp3", -500, () => {
        pairAction(tempCard);
    });
}

function pairAction(tempCard) {
    $(tempCard.pair).addClass("flip-card-active");
    setTimeout(() => {
        contentsMgr.soundPlayer("single", "word" + tempCard.index + ".mp3");
    }, 300);
    if (commonVar.count == 4) {
        commonVar.count = 0;
        if (commonVar.userStep == commonVar.totalStep) {
            setTimeout(() => {
                actionList("endGame");
            }, 3000);
        } else {
            setTimeout(() => {
                for (var i = 0; i < document.getElementById("upperDiv").childElementCount; i++) {
                    document.getElementById("card" + i + "Pic").classList.remove("flip-card-active");
                    document.getElementById("card" + i + "Txt").classList.remove("flip-card-active");
                }
                nextStageSetting();
            }, 2000);
        }
    } else {
        setTimeout(() => {
            commonVar.isHold = false;
        }, 1000);
    }
}

function nextStageSetting() {
    setTimeout(() => {
        commonVar.userStep++;
        setInteraction();
    }, 1000);
}

function touchMove() {}

function touchEnd() {}

function actionSucess(itemObj, targetObj, cloneElement) {}

function actionFail(itemObj, targetObj) {}

function msg(message) {
    if (commonVar.isMsg) console.log(message);
}
