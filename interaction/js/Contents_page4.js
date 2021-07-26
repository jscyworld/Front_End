"use strict";

var contentsMgr = ContentsMgr.getInstance();
var soundMgr = js_soundMgr.getInstance();
var callMgr = js_callMgr.getInstance();

var pageVar = {
        totalPage: 6,
        currentPage: 4,
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
    dragHandlerVar = {
        isDrag: false,
        dragElement: null,
    },
    soundVar = {},
    fpsList = {
        endingEven: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        introCheck: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    };

window.onload = function () {
    contentsMgr.onLoadAction();
    setTimeout(() => {
        actionList("introBridge");
    }, 1000);
    // this.setInteraction();
};

// contents set -------------------------------------------------------------------------------------
function setInteraction() {
    contentsMgr.setAlignDistribute("itemDiv", "width", "random");
    for (var i = 0; i < document.getElementById("itemDiv").childElementCount; i++) {
        let tempObj = document.getElementById("itemDiv").children[i];
        $(tempObj).css("top", "14px");
        let targetObj = document.getElementById("target" + i);
        tempObj.property = {
            index: i,
            x: tempObj.style.left,
            y: tempObj.style.top,
            swapImg: null,
            sound: "word" + i + ".mp3",
            targetArr: [],
        };
        tempObj.property.targetArr.push(targetObj);
    }
    contentsMgr.soundPlayer("single", "panelShow.mp3");
    $("#itemPanel").animate(
        {
            top: 600,
        },
        500,
        () => {
            commonVar.isHold = false;
        }
    );
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
            contentsMgr.pageJump("fadeOut", 70, "page4.html");
            break;
        case "btnNext":
            contentsMgr.pageJump("fadeOut", 70, "page5.html");
            break;
        default:
            break;
    }
}

// btn : Contents
function touchStart() {
    if (commonVar.isHold) return;
    if ($(this).data("btntype") == "drag") {
        dragHandlerVar.isDrag = true;
        dragHandlerVar.dragElement = this;
        commonVar.isHold = true;
        contentsMgr.soundPlayer("duplicate", "effect_touch_sticker.mp3", -100, () => {
            contentsMgr.soundPlayer("single", dragHandlerVar.dragElement.property.sound);
        });
        contentsMgr.dragHandler("drag", dragHandlerVar.dragElement);
    }
}

function touchMove(event) {
    event.preventDefault();
    if (dragHandlerVar.isDrag) contentsMgr.dragHandler("drag", dragHandlerVar.dragElement);
}

function touchEnd() {
    if (dragHandlerVar.isDrag) contentsMgr.dragHandler("drop", dragHandlerVar.dragElement);
}

// actionList
function actionList(type, element) {
    switch (type) {
        case "introBridge":
            $("#blackMatte").css("display", "block");
            contentsMgr.popup("show", "introPopup", null, "#000000", 0.7);
            $("#introPopup").css("display", "");
            contentsMgr.imgPlay("introCheck");
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
            commonVar.userStep++;
            contentsMgr.soundPlayer("single", element.property.sound);
            if (commonVar.userStep == commonVar.totalStep) {
                $("#itemPanel").animate(
                    {
                        top: 800,
                    },
                    300
                );
                setTimeout(() => {
                    actionList("endGame");
                }, 2500);
            } else {
                setTimeout(() => {
                    commonVar.isHold = false;
                }, 1000);
            }
            break;
        case "endGame":
            if (!commonVar.isDev) contentsMgr.checkJson();
            contentsMgr.soundPlayer("single", "ending.mp3");
            $("#blackMatte").css("display", "block");
            contentsMgr.popup("show", "endingPopup", null, "#000000", 0.7);
            $("#endingPopup").css("display", "");
            contentsMgr.imgPlay("endingEven");
            break;
        default:
            break;
    }
}

function actionSucess(itemObj, targetObj, cloneElement) {
    targetObj.src = pageVar.imgPath + itemObj.id + ".png";
    contentsMgr.cssAction(targetObj, "effect-bounceIn", 0.75, "remove");
    $(itemObj).css("display", "none");
    contentsMgr.soundPlayer("duplicate", "effect_sucess.mp3", -100, () => {
        actionList("soundPlay", itemObj);
    });
}

function actionFail(itemObj, targetObj) {
    $(itemObj).css("z-index", 0).animate(
        {
            left: itemObj.property.x,
            top: itemObj.property.y,
        },
        300,
        "easeOutBack"
    );
    contentsMgr.soundPlayer("single", "effect_fail.mp3", 200, () => {
        commonVar.isHold = false;
    });
}

function msg(message) {
    if (commonVar.isMsg) console.log(message);
}
