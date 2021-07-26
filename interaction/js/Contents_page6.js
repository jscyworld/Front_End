"use strict";

var contentsMgr = ContentsMgr.getInstance();
var soundMgr = js_soundMgr.getInstance();
var callMgr = js_callMgr.getInstance();

var pageVar = {
        totalPage: 6,
        currentPage: 6,
        checkMobile: null,
        document: null,
        imgPath: null,
        soundPath: null,
        vendor: "jlskke",
        bundleName: "jlskke_stage11_unit1_01.kyc",
    },
    commonVar = {
        isDev: false,
        count: 0,
        totalStep: 0,
        totalScore: 0,
        userStep: 0,
        userScore: 0,
        isMsg: true,
        isGameStart: false,
        isPlay: false,
        isHold: true,
    },
    cardHandlerVar = {
        maxCols: 3,
        testExit: false,
    },
    soundVar = {},
    fpsList = {
        endingFinale: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        introPlay: [4, 4, 4, 4, 4, 4, 4],
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
    if (cardHandlerVar.testExit) {
        cardHandlerVar.testExit = false;
        var card = document.getElementById("card");
        card.style.removeProperty("position");
        document.getElementById("showBtn").src = pageVar.imgPath + "stage_btn_look_on.svg";
        document.getElementById("showBtn").setAttribute("data-pressed", "false");
    }
    // *** 아래 카드 변수를 수정해 주세요 Var *******************
    var totalCard = [3, 3, 3], // 단계별 카드의 종류 수
        imageFileFormat = "png",
        frontCard0 = "card", // 일련번호의 _이전 name
        frontCard1 = "card", // 일련번호의 _이전 name
        backCard = null, // 일련번호의 _이전 name
        random = null,
        resultCard = "card",
        margin = 20,
        cardScatterSpeed = 70;
    // ***************************************************
    commonVar.totalStep = totalCard.length; // total step
    cardHandlerVar.totalCard = totalCard; // 모든 레벨에 대한 total card
    cardHandlerVar.frontCard0 = frontCard0; // front card image1
    cardHandlerVar.frontCard1 = frontCard1; // front card image2
    cardHandlerVar.backCard = backCard; // image format
    cardHandlerVar.resultCard = resultCard;
    cardHandlerVar.imageFileFormat = "." + imageFileFormat; // image format
    cardHandlerVar.margin = margin; // image format
    cardHandlerVar.arrResult = new Array();
    cardHandlerVar.arrCardList = null;
    cardHandlerVar.cardScatterSpeed = cardScatterSpeed;
    cardHandlerVar.cardTotalIndex = new Array();

    var count = totalCard.reduce(function (acc, val) {
        return acc + val;
    }, 0);
    for (var i = 0; i < count; i++) cardHandlerVar.cardTotalIndex.push(i);
    if (random !== null) cardHandlerVar.cardTotalIndex.sort(() => Math.random() - 0.5);
    contentsMgr.addEvent("setting", "btnBack");
    contentsMgr.cardHandler("setting", null, commonVar.userStep);
}

function actionList(type, element) {
    var topCard = document.getElementById("card");
    switch (type) {
        // Common Action
        case "introBridge":
            document.getElementById("blackMatte").style.display = "block";
            contentsMgr.popup("show", "introPopup", null, "#000000", 0.7);
            document.getElementById("introPopup").style.display = "";
            contentsMgr.imgPlay("introPlay");
            contentsMgr.soundPlayer("single", "intro.mp3", 1500, function () {
                actionList("hideIntro");
            });
            break;
        case "hideIntro":
            contentsMgr.popup("hide", "introPopup");
            contentsMgr.soundPlayer("single", "popupHide.mp3", 1000, setInteraction);
            break;
        case "nextLevel":
            contentsMgr.cardHandler("init", null, commonVar.userStep);
            break;
        case "endGame":
            if (!commonVar.isDev) contentsMgr.checkJson();
            contentsMgr.soundPlayer("single", "ending.mp3");
            document.getElementById("blackMatte").style.display = "block";
            contentsMgr.popup("show", "endingPopup", null, "#000000", 0.7);
            document.getElementById("endingPopup").style.display = "";
            contentsMgr.imgPlay("endingFinale");
            break;
        default:
            break;
        // Card Action
        case "cardShow":
            var pt = contentsMgr.getCenterPosition(topCard);
            contentsMgr.soundPlayer("single", "effect_card.mp3");
            topCard.style.opacity = 1;
            $(topCard).animate(
                {
                    left: pt.x,
                    top: pt.y,
                },
                500,
                "easeOutBack",
                function () {
                    contentsMgr.arrAction(cardHandlerVar.arrCardList, null, 50, "cardScatter", "cardHide");
                }
            );
            break;
        case "cardScatter":
            contentsMgr.setAlignPosition(element, "container", "xy");
            contentsMgr.soundPlayer("single", "effect_cardin.mp3");
            $(element).css("opacity", "1");
            $(element).animate(
                {
                    left: element.x,
                    top: element.y,
                },
                300,
                "easeOutBack"
            );
            contentsMgr.cssAction(topCard, "effect-scale-xy", 0.05);
            break;
        case "cardHide":
            $("#card").animate(
                {
                    top: "800px",
                },
                500,
                "easeInBack",
                function () {
                    setTimeout(function () {
                        contentsMgr.arrAction(cardHandlerVar.arrCardList, null, 30, "cardTurn");
                    }, 1000);
                }
            );
            break;
        case "cardTurn":
            var arr = cardHandlerVar.arrCardList;
            if (element == arr[arr.length - 1]) {
                element.addEventListener("transitionend", transitionEnd);
            }
            element.classList.remove("flip-card-active");
            document.getElementById("card").classList.remove("effect-scale-xy");

            function transitionEnd() {
                element.removeEventListener("transitionend", transitionEnd);
            }
            setTimeout(() => {
                commonVar.isHold = false;
                commonVar.isPlay = true; // game start
            }, 1000);

            break;
    }
}

// UI -------------------------------------------------------------------------------------
function touchUI() {
    contentsMgr.cssAction(this, "effect_touch", 0.4, "remove");
    contentsMgr.soundPlayer("stopAllSound");
    switch (this.id) {
        case "btnBack":
            contentsMgr.pageJump("fadeOut", 70, "index.html");
            break;
        case "btnReplay":
            contentsMgr.pageJump("fadeOut", 70, "page6.html");
            break;
        case "btnHome":
            contentsMgr.pageJump(null, 0, "home");
            break;
        default:
            break;
    }
}

// Contents Action -------------------------------------------------------------------------
function touchStart() {
    if (this.getAttribute("data-btntype") == "flip-card") {
        if (this.isPress == true) return;
        if (!commonVar.isPlay) return;
        if (commonVar.isHold) return;

        contentsMgr.soundPlayer("single", "effect_touch.mp3");
        contentsMgr.cardHandler("check", this);
    } else {
        switch (this.id) {
            case "":
        }
    }
}

function touchMove() {}

function touchEnd() {}

// sucess ---------------------------------------------------------------------------------
function actionSucess(itemObj, targetObj, cloneElement) {
    // action
    cardSucess("hide");
    commonVar.isHold = true;

    function cardSucess(type) {
        if (type == "keep") {
            commonVar.isHold = false;
            scoreSum();
        } else if (type == "hide") {
            contentsMgr.soundPlayer("single", "effect_success.mp3", 0, () => {
                itemObj.style.display = "none";
                targetObj.style.display = "none";
                var successCard = document.createElement("img");
                $(successCard)
                    .attr({
                        id: "successCard",
                        src: pageVar.imgPath + "card_sucess_" + (itemObj.index + 1) + ".png",
                    })
                    .css("z-index", 1)
                    .addClass("effect-scale-xy");
                document.getElementById("cardGroup").append(successCard);
                contentsMgr.soundPlayer("single", "word" + itemObj.index + ".mp3", 1500, scoreSum);
            });
        }
    }

    function scoreSum() {
        document.getElementById("successCard").classList.add("effect-scale-xy");
        commonVar.userScore++;
        if (commonVar.userScore == commonVar.totalScore) {
            commonVar.userStep++;
            commonVar.userScore = 0;

            $("#successCard")
                .css("position", "absolute")
                .animate(
                    {
                        top: "-800px",
                    },
                    500,
                    () => {
                        document.getElementById("cardGroup").removeChild(document.getElementById("successCard"));
                    }
                );
            contentsMgr.soundPlayer("single", "cardHide.mp3", 0, () => {
                if (commonVar.userStep == commonVar.totalStep) {
                    commonVar.userStep = 0;
                    setTimeout(actionList, 500, "endGame");
                } else {
                    $("#step" + commonVar.userStep).attr("src", pageVar.imgPath + "progress1.png");
                    $("#step" + (commonVar.userStep + 1)).attr("src", pageVar.imgPath + "progress2.png");
                    actionList("nextLevel");
                }
            });
        } else {
            $("#successCard")
                .css("position", "absolute")
                .animate(
                    {
                        top: "-800px",
                    },
                    500,
                    () => {
                        $("#successCard").remove();
                    }
                );
            contentsMgr.soundPlayer("single", "cardHide.mp3", 0, () => {
                commonVar.isHold = false;
            });
        }
    }
}

// fail ---------------------------------------------------------------------------------
function actionFail(itemObj, targetObj) {
    contentsMgr.soundPlayer("single", "effect_fail.mp3", 0, () => {
        $(itemObj).css("border", "none").removeClass("flip-card-active");
        $(targetObj).css("border", "none").removeClass("flip-card-active");
        targetObj.addEventListener("transitionend", transitionEnd);

        function transitionEnd() {
            targetObj.removeEventListener("transitionend", transitionEnd);
            itemObj.isPress = false;
            targetObj.isPress = false;
            $(itemObj).css("z-index", "");
            $(targetObj).css("z-index", "");
            commonVar.isHold = false;
        }
    });
}

function msg(message) {
    if (commonVar.isMsg) console.log(message);
}
