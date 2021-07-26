// JavaScript Document
"use strict";
var contentsMgr = ContentsMgr.getInstance();
var soundMgr = js_soundMgr.getInstance();
var callMgr = js_callMgr.getInstance();
var defaultMgr = js_defaultMgr.getInstance();

var pageVar = {
        totalPage: 6,
        currentPage: "index",
        checkMobile: null,
        document: null,
        imgPath: null,
        soundPath: null,
        vendor: "jlskke",
        bundleName: "jlskke_stage11_unit1_01",
    },
    commonVar = {
        isDev: false,
        isHold: false,
        isMsg: true,
    },
    soundVar = {
        mainBgmPlay: true,
        looping: true,
        useAutoPage: false,
        autoPageNumber: 0,
        autoPageDuration: 0.0,
    },
    fpsList = {};

// contents set ---------------------------------------------------------------------------
window.onload = function () {
    contentsMgr.onLoadAction();
    contentsMgr.soundPlayer("stopBgm");
    setTimeout(() => {
        contentsMgr.soundPlayer("bgm", "bgm.mp3");
    }, 500);
    this.setInteraction();
};

// setting -------------------------------------------------------------------------------------
function setInteraction() {
    if (defaultMgr.isApplication()) {
        let tempStorage = window.localStorage;
        let parameters = new Object();
        parameters.vendor = pageVar.vendor;
        parameters.bundleName = pageVar.bundleName;
        let studyProgress = null;
        try {
            studyProgress = JSON.parse(tempStorage.getItem("loadedJSON"));
        } catch (e) {
            alert(e);
        }

        try {
            for (var i = 1; i <= pageVar.totalPage; i++) {
                if (parseInt(studyProgress["chapter" + i].complete) > 0) {
                    document.getElementById("page" + i + "Complete").src = pageVar.imgPath + "star_on.png";
                }
            }
        } catch (e) {
            alert(e);
        }
    }
    setTimeout(() => {
        $("#jlsLogo").animate(
            {
                opacity: 0,
            },
            500
        );
        $("#doorLeft").animate(
            {
                left: -640,
            },
            500
        );
        $("#doorRight").animate(
            {
                right: -640,
            },
            500
        );
    }, 1000);
}

// UI -------------------------------------------------------------------------------------
function touchUI() {
    contentsMgr.soundPlayer("stopAllSound");
    contentsMgr.cssAction(this, "effect_touch", 0.4, "remove", () => {
        $(this).css("animation-duration", "");
    });
    switch (this.id) {
        case "btnBack":
            commonVar.isHold = true;
            contentsMgr.pageJump(null, 0, "home");
            break;
        case "btnStart":
            if (commonVar.isHold) return;
            contentsMgr.pageJump("fadeOut", 70, "page1.html");
            break;
        default:
            if (commonVar.isHold) return;
            contentsMgr.pageJump("fadeOut", 70, this.id + ".html");
            break;
    }
}

// Contents Action -------------------------------------------------------------------------
function touchStart() {}

function touchMove() {}

function touchEnd() {}

function actionSucess(itemObj, targetObj, cloneElement) {}

function actionFail(itemObj, targetObj) {}

function msg(message) {
    if (commonVar.isMsg) console.log(message);
}
