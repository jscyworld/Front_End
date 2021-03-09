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
        isMsg: true,
        isHold: true,
    },
    soundVar = {},
    fpsList = {
        char0: [3, 3],
        char1: [3, 3],
    };

// contents set ---------------------------------------------------------------------------
window.onload = function () {
    contentsMgr.onLoadAction();
    this.setInteraction();
};

// setting -------------------------------------------------------------------------------------
function setInteraction() {
    contentsMgr.imgPlay("char0");
    contentsMgr.soundPlayer("duplicate", "narr0.mp3", 0, () => {
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
            contentsMgr.pageJump("fadeOut", 70, "ebook_01.html");
            break;
        case "btnNext":
            contentsMgr.pageJump("fadeOut", 70, "ebook_03.html");
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
            tempChar.setAttribute("data-fps", "100");
            tempChar.src = pageVar.imgPath + "char1_1.png";
            contentsMgr.createFileExif("add", tempChar);
            contentsMgr.imgPlay(tempChar);
            setTimeout(() => {
                contentsMgr.soundPlayer("duplicate", "narr1.mp3", 0, () => {
                    contentsMgr.imgStop(tempChar);
                });
            }, 500);
            break;
        default:
            break;
    }
}

function actionSucess(itemObj, targetObj, cloneElement) {}

function actionFail(itemObj, targetObj) {}

function msg(message) {
    if (commonVar.isMsg) console.log(message);
}
