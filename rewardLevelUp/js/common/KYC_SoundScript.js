var KYC_SoundMgr = (function () {
    "use strict";

    // Instance stores a reference to the Singleton
    var instance;

    function init() {
        // Singleton

        //Private
        function privateMethod() {
            console.log("private");
        }
        var kyc_defaultMgr = KYC_DefaultMgr.getInstance();
        var kyc_callMgr = KYC_CallMgr.getInstance();
        // var contentsMgr = ContentsMgr.getInstance();
        var bgmPlayer;
        var playerMap = new Map();
        var duplicatePlayerMap = new Map();
        var playerKeyArray = new Array();
        var duplicatePlayerKeyArray = new Array();

        function playBackGroundSound(path) {
            if (kyc_defaultMgr.isApplication() == false) {
                if (bgmPlayer != null) {
                    bgmPlayer.pause();
                    bgmPlayer.currentTime = 0;
                    bgmPlayer = null;
                }
                bgmPlayer = new Audio(path);
                bgmPlayer.loop = true;
                bgmPlayer.autoplay = true;
                var promise = bgmPlayer.play();

                if (typeof promise !== "undefined") {
                    promise
                        .then(function () {})
                        .catch(function (error) {
                            //can not play safari 11 in mobile
                        });
                }
            } else {
                var parameter = new Object();
                parameter.path = path;
                parameter.mainBgmPlay = soundVar.mainBgmPlay;
                parameter.looping = soundVar.looping;
                parameter.useAutoPage = soundVar.useAutoPage;
                parameter.autoPageNumber = soundVar.autoPageNumber;
                parameter.autoPageDuration = soundVar.autoPageDuration;
                kyc_callMgr.sendActionNameWithParameter(KYC_ActionList.KYC_PlayBackGroundSound, parameter);
                parameter = null;
            }
        }

        function resumeBackGroundSound(path) {
            if (kyc_defaultMgr.isApplication() == false) {
                if (bgmPlayer != null) {
                    var promise = bgmPlayer.play();
                    if (typeof promise !== "undefined") {
                        promise
                            .then(function () {})
                            .catch(function (error) {
                                //can not play safari 11 in mobile
                            });
                    }
                }
            } else {
                var parameter = new Object();
                parameter.path = path;
                kyc_callMgr.sendActionNameWithParameter(KYC_ActionList.KYC_PlayBackGroundSound, parameter);
                parameter = null;
            }
        }

        function stopBackGroundSound() {
            if (kyc_defaultMgr.isApplication() == false) {
                if (bgmPlayer != null) {
                    bgmPlayer.pause();
                    bgmPlayer.currentTime = 0;
                    bgmPlayer = null;
                }
            } else {
                var parameter = new Object();
                kyc_callMgr.sendActionNameWithParameter(KYC_ActionList.KYC_StopBackGroundSound, parameter);
                parameter = null;
            }
        }

        function playSound(path) {
            if (kyc_defaultMgr.isApplication() == false) {
                var player = playerMap.get(path);
                var promise;
                if (player != null) {
                    if (isPlaying(player) == false) {
                        player.currentTime = 0;

                        //4 = HAVE_ENOUGH_DATA
                        if (player.readyState == 4) {
                            player.pause();
                            player.src = player.src;
                            player.currentTime = 0;
                        }
                        promise = player.play();
                        // var currentDuration = { duration: player.duration };
                        // contentsMgr.globalVar("save", currentDuration);
                    } else {
                        var array = duplicatePlayerMap.get(path);
                        var player = new Audio(path);
                        promise = player.play();
                        if (array == null) {
                            array = new Array();
                        }
                        array.push(player);
                        duplicatePlayerMap.set(path, array);
                        duplicatePlayerKeyArray.push(path);
                    }
                } else {
                    var player = new Audio(path);
                    promise = player.play();
                    playerMap.set(path, player);
                    playerKeyArray.push(path);
                }

                if (typeof promise !== "undefined") {
                    promise
                        .then(function () {
                            // console.log("auto-play started!");
                        })
                        .catch(function (error) {
                            //console.log("auto-play failed!");
                            //can not play safari 11 in mobile
                        });
                }
            } else {
                var parameter = new Object();
                parameter.path = path;
                kyc_callMgr.sendActionNameWithParameter(KYC_ActionList.KYC_PlaySound, parameter);
                parameter = null;
            }
        }

        function stopSound(path) {
            if (kyc_defaultMgr.isApplication() == false) {
                var player = playerMap.get(path);
                if (player != null) {
                    player.pause();
                    player.currentTime = 0;
                    player = null;
                    playerMap.delete(path);

                    var pos = playerKeyArray.indexOf(path);
                    playerKeyArray.splice(pos, 1);
                }

                var players = duplicatePlayerMap.get(path);
                if (players != null) {
                    //for(var tempPlayer of players)
                    for (var key in players) {
                        var tempPlayer = players[key];
                        //var tempPlayer = players[i];
                        tempPlayer.pause();
                        tempPlayer.currentTime = 0;
                        tempPlayer = null;
                    }
                    players = null;
                    duplicatePlayerMap.delete(path);

                    var pos = duplicatePlayerKeyArray.indexOf(path);
                    duplicatePlayerKeyArray.splice(pos, 1);
                }
            } else {
                var parameter = new Object();
                parameter.path = path;
                kyc_callMgr.sendActionNameWithParameter(KYC_ActionList.KYC_StopSound, parameter);
                parameter = null;
            }
        }

        function stopAllSound() {
            if (kyc_defaultMgr.isApplication() == false) {
                //for(var player of playerMap.values())
                for (var key in playerKeyArray) {
                    var path = playerKeyArray[key];
                    var player = playerMap.get(path);
                    player.pause();
                    player.currentTime = 0;
                    player = null;
                }

                playerMap.clear();
                playerKeyArray.length = 0;

                //for(var players of duplicatePlayerMap.values())
                for (var key in duplicatePlayerKeyArray) {
                    var path = duplicatePlayerKeyArray[key];
                    var players = duplicatePlayerMap.get(path);
                    //for(var tempPlayer of players)
                    for (var subKey in players) {
                        var tempPlayer = players[subKey];
                        tempPlayer.pause();
                        tempPlayer.currentTime = 0;
                        tempPlayer = null;
                    }
                    players = null;
                }
                duplicatePlayerMap.clear();
                duplicatePlayerKeyArray.length = 0;
            } else {
                kyc_callMgr.sendActionNameWithParameter(KYC_ActionList.KYC_StopAllSound, null);
            }
        }

        function isPlaying(player) {
            return player && player.currentTime > 0 && !player.paused && !player.ended && player.readyState > 2;
        }

        function isPlayingBGM() {
            return bgmPlayer && bgmPlayer.currentTime > 0 && !bgmPlayer.paused && !bgmPlayer.ended && bgmPlayer.readyState > 2;
        }

        return {
            playBackGroundSound: function (path) {
                playBackGroundSound(path);
            },
            resumeBackGroundSound: function (path) {
                resumeBackGroundSound(path);
            },
            stopBackGroundSound: function () {
                stopBackGroundSound();
            },

            playSound: function (path) {
                playSound(path);
            },
            stopSound: function (path) {
                stopSound(path);
            },
            stopAllSound: function () {
                stopAllSound();
            },
            isPlaying: function (player) {
                return isPlaying(player);
            },
            isPlayingBGM: function () {
                return isPlayingBGM();
            },
        };
    }

    return {
        getInstance: function () {
            if (instance == null) {
                instance = init();
            }
            return instance;
        },
    };
})();
