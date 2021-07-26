// JavaScript Document
"use strict";
var contentsMgr = ContentsMgr.getInstance();
var soundMgr = KYC_SoundMgr.getInstance();
var callMgr = KYC_CallMgr.getInstance();
var defaultMgr = KYC_DefaultMgr.getInstance();

var pageVar = {
        totalPage: 1,
        currentPage: "index",
        checkMobile: null,
        document: null,
        imgPath: null,
        soundPath: null,
        vendor: "",
        bundleName: "",
        parameters: {
            // status: null,
            // game_reward_mileage: null,
            // mileage: null,
            // game_cnt: null,
            // image_url: null,
        },
        account_token: "",
    },
    commonVar = {
        isDev: true,
        isHold: false,
        isMsg: true,
    },
    soundVar = {},
    effectVar = { capsule: null },
    fpsList = {
        machine: [1, 1, 1],
        bgFront: [1, 1],
    };

// contents set ---------------------------------------------------------------------------
window.onload = function () {
    contentsMgr.onLoadAction();
    // setInteraction();
    contentsMgr.soundPlayer("bgm", "bgm.mp3");
    pageVar.account_token = getParam("account_token") || "offline";
    document.getElementById("gameCount").innerText = `${getParam("game_cnt") || 0}`;
    if ($("#contents").width() > 1280) $("#char0").css({ width: "", height: "", transform: "scale(0.8)", bottom: -40, right: "-100%" });
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
    contentsMgr.soundPlayer("stopBgm");
    switch (this.id) {
        case "btnBack":
        case "btnStop":
        case "btnConfirm":
            commonVar.isHold = true;
            // contentsMgr.pageJump(null, 0, "home");
            callMgr.sendActionNameWithParameter("goBack");
            break;
        case "btnPlay":
            contentsMgr.pageJump(null, 0, `index.html?account_token=${pageVar.account_token}&game_cnt=${pageVar.parameters.game_cnt || 0}`);
            break;
        case "btnCollection":
            let url = `https://devapi.yanadookids.com/v1/rewardpage/collect?account_token=${pageVar.account_token}`;
            contentsMgr.pageJump(null, 0, url);
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
    if (this.id == "btnStart") {
        contentsMgr.soundPlayer("single", "effect_btn.mp3");
        $("#btnBack").remove();
        $("#btnCollection").css({ pointerEvents: "none", opacity: 0.2 });
        // callMgr.sendActionNameWithParameter("gameStart");
        // test code
        setGameResponse({ status: 0, game_cnt: 19, game_reward_mileage: 1024, mileage: 25200 });
    } else if (this.id == "btnPick") {
        $(this)
            .removeClass("selectObj")
            .attr("src", pageVar.imgPath + "btnPickPush.png");
        setTimeout(() => {
            $(this).attr("src", pageVar.imgPath + "btnPick.png");
        }, 200);
        contentsMgr.soundPlayer("duplicate", "machineDown.mp3");
        $("#machine").stop().animate({ top: -50 }, 1500, "easeOutBack", pickUpCapsule);
    }
}

function setGameResponse(data) {
    pageVar.parameters = data;
    if (pageVar.parameters.status != 0) {
        showErrorDiv();
    } else {
        document.getElementById("gameCount").innerText = pageVar.parameters.game_cnt;
        $("#minusOne")
            .css("display", "")
            .addClass("mileageMotion")
            .bind("animationend", () => {
                $("#minusOne").remove();
                machineMove();
                $("#btnPick").css("display", "");
                commonVar.isHold = false;
            });
        $("#btnStart")
            .removeClass("selectObj")
            .attr("src", pageVar.imgPath + "btnStartPush.png");
        setTimeout(() => {
            $("#btnStart").attr("src", pageVar.imgPath + "btnStart.png");
        }, 200);
    }
}

function showErrorDiv() {
    $("#noTicketDiv, #bgDim").css("display", "");
    contentsMgr.cssAction("noTicketDiv", "effect_touch", 0.3, "remove");
}

function machineMove() {
    contentsMgr.soundPlayer("single", "machineMove.mp3");
    $("#machine").animate({ left: 320 }, 1000, "linear", () => {
        $("#machine").animate({ left: 670 }, 1000, "linear", () => {
            contentsMgr.soundPlayer("single", "machineMove.mp3");
            $("#machine").animate({ left: 1020 }, 1000, "linear", () => {
                $("#machine").animate({ left: 670 }, 1000, "linear", machineMove);
            });
        });
    });
}

function pickUpCapsule() {
    let imgUrl = pageVar.parameters.image_url || pageVar.imgPath + "cardFront.png";
    $("#cardFront").attr("src", imgUrl).css({ width: 257, height: 257 });
    contentsMgr.imgPlay("machine", 2);
    contentsMgr.imgPlay("bgFront", 3);
    contentsMgr.soundPlayer("single", "machineSwing.mp3");
    setTimeout(() => {
        contentsMgr.soundPlayer("single", "machineUp.mp3");
    }, 800);
    setTimeout(() => {
        $("#machine")
            .attr("src", pageVar.imgPath + "machine1.png")
            .animate({ top: -360 }, 1000, "linear", () => {
                $("#machine").attr("src", pageVar.imgPath + "machine2.png");
                $("#bgDim").css("display", "");
                // let effectScale = $("#contents").width() > 1024 ? 4 : 1;
                contentsMgr.setAlignScale("capsule", "contents");
                // effectName, targetName, scale, speed, loop, callback, callbackParameters
                contentsMgr.effectAnimation("capsule", null, 1, 1, 1);
                contentsMgr.soundPlayer("single", "effect_capsule.mp3");
                setTimeout(() => {
                    showMileage();
                }, 500);
            });
    }, 1000);
}

function showMileage() {
    $("#collectionDiv")
        .css("display", "")
        .addClass("scaleUp")
        .bind("animationend", () => {
            $("#collectionDiv").unbind();
            $("#effectLight").addClass("effectLight");
            $("#cardFrontDiv").css("transform", "rotateY(0)");
            contentsMgr.soundPlayer("duplicate", "effect_rolling.mp3");
            $("#card").addClass("cardRolling");
            setTimeout(() => {
                $("#card").removeClass("cardRolling");
                $("#card").addClass("cardBounce");
                contentsMgr.soundPlayer("duplicate", "effect_card.mp3");
                setTimeout(() => {
                    showDetail();
                }, 200);
                setTimeout(() => {}, 400);
            }, 1000);
        });
}

function showDetail() {
    document.getElementById("earnMileage").innerText = numWithComma(pageVar.parameters.game_reward_mileage || 1000);
    $("#textGreat").animate({ top: 40 }, 500);
    $("#textNewCard").animate({ top: 640 }, 500, () => {
        $("#earnMileageDiv")
            .css("display", "")
            .addClass("mileageMotion")
            .bind("animationend", () => {
                setTimeout(() => {
                    showBtnDiv();
                }, 100);
            });
    });
}

function numWithComma(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function showBtnDiv() {
    $("#textNewCard").animate({ top: 800 }, 500, () => {
        let collectLeft = $("#contents").width() > 1024 ? "8%" : "-8%";
        $("#collectionDiv").animate({ left: collectLeft }, 500);
        let mileageBoxRight = $("#contents").width() > 1024 ? "13%" : "3%";
        $("#myMileageBox").animate({ right: mileageBoxRight }, 500, calculateMileage);
        if (pageVar.parameters.game_cnt == 0) $("#btnPlay").remove();
        $("#btnDiv").animate({ top: 590 }, 500);
    });
}

function calculateMileage() {
    let temp, acc, endNum;
    if (pageVar.parameters.mileage > 9999) {
        temp = 1000;
        acc = 1000;
    } else if (pageVar.parameters.mileage > 999) {
        temp = 100;
        acc = 100;
    } else if (pageVar.parameters.mileage > 99) {
        temp = 10;
        acc = 10;
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

function touchMove() {}

function touchEnd() {}

function actionSucess(itemObj, targetObj, cloneElement) {}

function actionFail(itemObj, targetObj) {}

function msg(message) {
    if (commonVar.isMsg) console.log(message);
}
