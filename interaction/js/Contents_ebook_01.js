"use strict";

var contentsMgr = ContentsMgr.getInstance();
var soundMgr = js_soundMgr.getInstance();
var callMgr = js_callMgr.getInstance();

var pageVar = {
        totalPage: 6,
        currentPage: 2,
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
        totalStep: 2,
        userStep: 0,
        isMsg: true,
        isHold: true,
    },
    soundVar = {},
    fpsList = {
        char0: [3, 3],
        char1: [3, 3],
        char2: [3, 3],
    };

// contents set ---------------------------------------------------------------------------
window.onload = function () {
    contentsMgr.onLoadAction();
    this.setInteraction();
};

// setting -------------------------------------------------------------------------------------
function setInteraction() {
    contentsMgr.imgPlay("char0");
    contentsMgr.soundPlayer("single", "narr0.mp3", 0, () => {
        contentsMgr.imgStop("char0");
        $("#char1SelectObj").css("display", "");
        let tempChar = document.getElementById("char1");
        let tempObj = contentsMgr.createCloneElement("char1Div");
        tempChar.selectObj = document.getElementById("char1SelectObj");
        tempChar.div = document.getElementById("char1Div");
        tempObj.origin = tempChar;
        $(tempObj).css("opacity", 0);
        contentsMgr.addEvent("add", tempObj);
        commonVar.isHold = false;
    });
}

// UI -------------------------------------------------------------------------------------
function touchUI() {
    contentsMgr.soundPlayer("stopAllSound");
    contentsMgr.cssAction(this, "effect_touch", 0.4, "remove");
    switch (this.id) {
        case "btnBack":
            contentsMgr.pageJump("fadeOut", 70, "index.html");
            break;
        case "btnPrev":
            contentsMgr.pageJump("fadeOut", 70, "ebook_00.html");
            break;
        case "btnNext":
            contentsMgr.pageJump("fadeOut", 70, "ebook_02.html");
            break;
        default:
            break;
    }
}

// Contents Action -------------------------------------------------------------------------
function touchStart() {
    if (commonVar.isHold) return;
    commonVar.isHold = true;
    commonVar.userStep++;
    $(this.origin.selectObj).remove();
    let temp = this;
    contentsMgr.soundPlayer("single", "effect_touch.mp3", -500, () => {
        actionList(temp.origin.id + "Action", temp);
    });
}

function touchMove() {}

function touchEnd() {}

function actionList(type, element) {
    let tempChar = element.origin;
    switch (type) {
        case "char1Action":
            $(element).remove();
            tempChar.setAttribute("data-seq", "2");
            tempChar.setAttribute("data-fps", "20");
            tempChar.src = pageVar.imgPath + "char1_1.png";
            contentsMgr.createFileExif("add", tempChar);
            $(tempChar.div).animate(
                {
                    left: 600,
                },
                1000
            );
            contentsMgr.imgPlay(tempChar);
            tempChar.classList.add("charBounce");
            setTimeout(() => {
                contentsMgr.soundPlayer("duplicate", "narr" + commonVar.userStep + ".mp3", 0, () => {
                    contentsMgr.imgStop(tempChar);
                    nextCharActionSetting();
                });
            }, 500);
            break;
        case "char2Action":
            $(element).remove();
            tempChar.setAttribute("data-seq", "2");
            tempChar.setAttribute("data-fps", "20");
            tempChar.src = pageVar.imgPath + "char2_1.png";
            contentsMgr.createFileExif("add", tempChar);
            $(tempChar.div).animate(
                {
                    left: 800,
                },
                1000
            );
            contentsMgr.imgPlay(tempChar);
            tempChar.classList.add("charBounce");
            setTimeout(() => {
                contentsMgr.soundPlayer("duplicate", "narr" + commonVar.userStep + ".mp3", 0, () => {
                    contentsMgr.imgStop(tempChar);
                });
            }, 500);
            break;
        default:
            break;
    }
}

function nextCharActionSetting() {
    $("#char2SelectObj").css("display", "");
    let tempChar = document.getElementById("char2");
    let tempObj = contentsMgr.createCloneElement("char2Div");
    tempChar.selectObj = document.getElementById("char2SelectObj");
    tempChar.div = document.getElementById("char2Div");
    tempObj.origin = tempChar;
    $(tempObj).css("opacity", 0);
    contentsMgr.addEvent("add", tempObj);
    commonVar.isHold = false;
}

function actionSucess(itemObj, targetObj, cloneElement) {}

function actionFail(itemObj, targetObj) {}

function msg(message) {
    if (commonVar.isMsg) console.log(message);
}
