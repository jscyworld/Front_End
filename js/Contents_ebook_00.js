"use strict";

var contentsMgr = ContentsMgr.getInstance();
var soundMgr = js_soundMgr.getInstance();

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
        totalCount: 6,
        count: 0,
        isMsg: true,
        isHold: true,
    },
    soundVar = {},
    fpsList = {
        coverMotion: [3, 3, 3],
    };

// contents set ---------------------------------------------------------------------------
window.onload = function () {
    contentsMgr.onLoadAction();
    this.setInteraction();
};

// setting -------------------------------------------------------------------------------------
function setInteraction() {
    contentsMgr.soundPlayer("duplicate", "title.mp3");
    contentsMgr.imgPlay("coverMotion");
}

// UI -------------------------------------------------------------------------------------
function touchUI() {
    contentsMgr.soundPlayer("stopAllSound");
    contentsMgr.cssAction(this, "effect_touch", 0.4, "remove");
    switch (this.id) {
        case "btnBack":
            contentsMgr.pageJump("fadeOut", 70, "index.html");
            break;
        case "btnStart":
            contentsMgr.pageJump("fadeOut", 70, "ebook_01.html");
            break;
        default:
            break;
    }
}

// Contents Action -------------------------------------------------------------------------
function touchStart() {
    if (commonVar.isHold) return;
}

function touchMove() {}

function touchEnd() {}

function actionList(type, element) {}

function actionSucess(itemObj, targetObj, cloneElement) {}

function actionFail(itemObj, targetObj) {}

function msg(message) {
    if (commonVar.isMsg) console.log(message);
}
