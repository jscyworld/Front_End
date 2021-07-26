// JavaScript Document
"use strict";
var contentsMgr = ContentsMgr.getInstance();
var soundMgr = js_soundMgr.getInstance();
var callMgr = js_callMgr.getInstance();
var defaultMgr = js_defaultMgr.getInstance();

var pageVar = {
        totalPage: 1,
        currentPage: "index",
        checkMobile: null,
        document: null,
        imgPath: null,
        soundPath: null,
        vendor: "",
        bundleName: "",
        parameters: {},
    },
    commonVar = {
        isDev: true,
        isHold: false,
        isMsg: true,
    },
    soundVar = {},
    effectVar = { treasure: null },
    fpsList = {
        boxStar: [2, 2],
    };

// contents set ---------------------------------------------------------------------------
window.onload = function () {
    contentsMgr.onLoadAction();
    pageVar.parameters.mileage = getParam("mileage") || 12000;
    pageVar.parameters.reward_mileage = getParam("reward_mileage") || 1000;
    document.getElementById("levelUpMileage").innerText = numWithComma(pageVar.parameters.reward_mileage);
    contentsMgr.setAlignScale("treasure", "contents");
    $("#treasure").css({ display: "none", top: 62 });
    setTimeout(() => {
        $("#boxStar").css("display", "");
        contentsMgr.imgPlay("boxStar");
        $("#box").addClass("boxBounce");
        contentsMgr.addEvent("add", "box");
    }, 100);
};

function getParam(sname) {
    var params = location.search.substr(location.search.indexOf("?") + 1);
    var sval = "",
        temp = "";
    params = params.split("&");
    for (var i = 0; i < params.length; i++) {
        temp = params[i].split("=");
        if ([temp[0]] == sname) {
            sval = temp[1];
        }
    }
    return sval;
}

// setting -------------------------------------------------------------------------------------
function setInteraction() {}

// UI -------------------------------------------------------------------------------------
function touchUI() {
    contentsMgr.soundPlayer("stopAllSound");
    contentsMgr.cssAction(this, "effect_touch", 0.4, "remove", () => {
        $(this).css("animation-duration", "");
    });
    switch (this.id) {
        case "btnBack":
        case "btnNext":
            commonVar.isHold = true;
            // contentsMgr.pageJump(null, 0, "home");
            callMgr.sendActionNameWithParameter("goBack");
            break;
        default:
            if (commonVar.isHold) return;
            contentsMgr.pageJump("fadeOut", 70, this.id + ".html");
            break;
    }
}

// Contents Action -------------------------------------------------------------------------
function touchStart() {
    if (commonVar.isHold) return;
    commonVar.isHold = true;
    $("#boxStar, #box").remove();
    contentsMgr.soundPlayer("duplicate", "effect_capsule.mp3");
    $("#treasure").css("display", "");
    contentsMgr.effectAnimation("treasure", null, 1, 1, 1);
    setTimeout(() => {
        contentsMgr.soundPlayer("duplicate", "effect_char.mp3");
        $("#charDiv").css("display", "").addClass("scaleUp").bind("animationend", actionAfterCharShow);
    }, 700);
}

function actionAfterCharShow() {
    $("#char").unbind().addClass("charBounce");
    $("#newChar").animate({ opacity: 1 }, 500);
    $("#txtLevelUp").animate({ opacity: 1 }, 500, () => {
        let temp = 0;
        let timer = setInterval(() => {
            if (temp == 3) {
                clearInterval(timer);
                setTimeout(() => {
                    $("#levelUpMileageDiv").css("display", "").addClass("mileageMotion");
                    setTimeout(() => {
                        showFinalDiv();
                    }, 1500);
                }, 1000);
            } else {
                $("#star" + temp)
                    .css("display", "")
                    .addClass("star");
                temp++;
            }
        }, 300);
    });
}

function showFinalDiv() {
    $("#newChar").animate({ opacity: 0 }, 500, () => {
        $("#btnNext").css("display", "").addClass("scaleUp");
    });
    $("#charDiv").animate({ left: 250 }, 500);
    $("#myMileageBox").animate({ left: 756 }, 500, calculateMileage);
}

function calculateMileage() {
    let temp, acc, endNum;
    if (pageVar.parameters.mileage > 99999) {
        temp = 10000;
        acc = 5000;
    } else if (pageVar.parameters.mileage > 9999) {
        temp = 1000;
        acc = 500;
    } else if (pageVar.parameters.mileage > 999) {
        temp = 100;
        acc = 50;
    } else if (pageVar.parameters.mileage > 99) {
        temp = 10;
        acc = 5;
    } else {
        temp = 0;
        acc = 1;
    }
    endNum = pageVar.parameters.mileage;
    contentsMgr.soundPlayer("duplicate", "effect_count.mp3");
    let timer = setInterval(() => {
        if (temp > endNum) {
            clearInterval(timer);
            document.getElementById("myMileageTxt").innerText = numWithComma(pageVar.parameters.mileage);
        } else {
            document.getElementById("myMileageTxt").innerText = temp;
            temp = temp + acc;
        }
    }, 10);
}

function numWithComma(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function touchMove() {}

function touchEnd() {}

function actionSucess(itemObj, targetObj, cloneElement) {}

function actionFail(itemObj, targetObj) {}

function msg(message) {
    if (commonVar.isMsg) console.log(message);
}
