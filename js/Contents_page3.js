"use strict";

var contentsMgr = ContentsMgr.getInstance();
var soundMgr = js_soundMgr.getInstance();
var callMgr = js_callMgr.getInstance();

var pageVar = {
        totalPage: 6,
        currentPage: 3,
        checkMobile: null,
        document: null,
        imgPath: null,
        soundPath: null,
        currentDuration: null,
        soundLength: 0,
        vendor: "jlskke",
        bundleName: "jlskke_stage11_unit1_01",
    },
    commonVar = {
        isDev: false,
        isHold: true,
        isMsg: true,
        userStep: 0,
        totalStep: 4,
    },
    soundVar = {},
    fpsList = {
        endingOdd: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        introLearn: [2, 2, 2, 2, 2, 2, 2, 2],
    };

window.onload = function () {
    contentsMgr.onLoadAction();
    setTimeout(() => {
        actionList("introBridge");
    }, 1000);
};

// contents set -------------------------------------------------------------------------------------
function setInteraction() {
    for (var i = 0; i < document.getElementById("itemDiv").childElementCount; i++) {
        let tempObj = document.getElementById("itemDiv").children[i];
        tempObj.isCurrentStep = false;
        contentsMgr.addEvent("add", tempObj);
    }
    document.getElementById("char1").classList.add("highlightEffect");
    setTimeout(() => {
        commonVar.isHold = false;
        document.getElementById("char1").isCurrentStep = true;
    }, 500);
}

// btn : ui
function touchUI() {
    contentsMgr.soundPlayer("stopAllSound");
    contentsMgr.cssAction(this, "effect_touch", 0.4, "remove");
    switch (this.id) {
        case "btnBack":
            contentsMgr.pageJump("fadeOut", 70, "index.html");
            break;
        case "btnReplay":
            contentsMgr.pageJump("fadeOut", 70, "page3.html");
            break;
        case "btnNext":
            contentsMgr.pageJump("fadeOut", 70, "page4.html");
            break;
        default:
            break;
    }
}

// btn : Contents
function touchStart() {
    if (commonVar.isHold) return;
    if (!this.isCurrentStep) return;
    commonVar.isHold = true;
    let tempObj = this;
    $(tempObj).remove();
    contentsMgr.soundPlayer("single", "effect_touch.mp3", 0, () => {
        actionList("soundPlay");
    });
    $("#text" + (commonVar.userStep + 1)).css("opacity", 1);
    contentsMgr.cssAction("text" + (commonVar.userStep + 1), "effect-bounceIn", 0.75, "remove");
}

// actionList
function actionList(type, element) {
    switch (type) {
        case "introBridge":
            $("#blackMatte").css("display", "block");
            contentsMgr.popup("show", "introPopup", null, "#000000", 0.7);
            $("#introPopup").css("display", "");
            contentsMgr.imgPlay("introLearn");
            contentsMgr.soundPlayer("single", "intro.mp3", 1500, () => {
                actionList("hideIntro");
            });
            break;
        case "hideIntro":
            contentsMgr.popup("hide", "introPopup");
            contentsMgr.soundPlayer("single", "popupHide.mp3", 1000, () => {
                setInteraction();
                commonVar.isHold = false;
            });
            break;
        case "soundPlay":
            contentsMgr.soundPlayer("single", "word" + commonVar.userStep + ".mp3", 1500, () => {
                commonVar.userStep++;
                if (commonVar.userStep == commonVar.totalStep) {
                    setTimeout(() => {
                        actionList("endGame");
                    }, 1000);
                } else {
                    $("#char" + (commonVar.userStep + 1)).addClass("highlightEffect");
                    setTimeout(() => {
                        document.getElementById("char" + (commonVar.userStep + 1)).isCurrentStep = true;
                        commonVar.isHold = false;
                    }, 1000);
                }
            });
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

function actionSucess(itemObj, targetObj, cloneElement) {}

function actionFail(itemObj, targetObj) {}

function touchMove() {}

function touchEnd() {}

function msg(message) {
    if (commonVar.isMsg) console.log(message);
}
