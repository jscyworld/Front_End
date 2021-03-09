// JavaScript Document
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
        totalCount: 6,
        count: 0,
        isMsg: true,
        isHold: true,
    },
    soundVar = {},
    fpsList = {
        coverMotion: [3, 3, 3],
        introBook: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    };

// contents set ---------------------------------------------------------------------------
window.onload = function () {
    contentsMgr.onLoadAction();
    setTimeout(() => {
        actionList("introBridge");
    }, 1000);
};

// setting -------------------------------------------------------------------------------------
function setInteraction() {
    contentsMgr.soundPlayer("single", "title.mp3");
    contentsMgr.imgPlay("coverMotion");
    $("#btnStart").addClass("btnStartBounce");
}

// UI -------------------------------------------------------------------------------------
function touchUI() {
    if (commonVar.isHold) return;
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
function touchStart() {}

function touchMove() {}

function touchEnd() {}

function actionList(type, element) {
    switch (type) {
        case "introBridge":
            $("#blackMatte").css("display", "block");
            contentsMgr.popup("show", "introPopup", null, "#000000", 0.7);
            $("#introPopup").css("display", "");
            contentsMgr.imgPlay("introBook");
            contentsMgr.soundPlayer("duplicate", "intro.mp3", 1500, () => {
                actionList("hideIntro");
            });
            break;
        case "hideIntro":
            contentsMgr.popup("hide", "introPopup");
            contentsMgr.soundPlayer("duplicate", "popupHide.mp3", 1000, () => {
                setInteraction();
                commonVar.isHold = false;
            });
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
