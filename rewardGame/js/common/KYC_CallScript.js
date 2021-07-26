var KYC_CallMgr = (function () {
    "use strict";

    var instance;

    function init() {
        function privateMethod() {
            console.log("private");
        }
        var kyc_defaultMgr = KYC_DefaultMgr.getInstance();
        var privateKey = "f3ZjUn4X3meucHHrF5yb6wfgBzNYCAkK";
        var platformType = undefined;
        var ua = navigator.userAgent;
        var checker = {
            iOS: ua.match(/(iPhone|iPod|iPad|Macintosh|MacIntel)/),
            android: ua.match(/Android/),
        };
        if (checker.iOS) {
            platformType = "iOS";
        } else if (checker.android) {
            platformType = "android";
        } else {
            platformType = "unknown";
        }

        function KYC_ActionCompletionHandler(filename, resultMsg, resultObject /*nullable*/, actionname) {
            console.log("filename " + filename + " resultMsg " + resultMsg + " actionname " + actionname);
            if (actionname == KYC_ActionList.KYC_RequestContentsDB) {
                var temp = JSON.parse(resultObject);
                console.log(temp);
                // console.log(resultObject + ": " + typeof(resultObject))
                window.localStorage.setItem("loadedJSON", resultObject);
            }
        }
        window.KYC_ActionCompletionHandler = KYC_ActionCompletionHandler;

        function sendJSON(jsonString) {
            if (platformType.match("iOS")) {
                var message = "jscall://" + encodeURIComponent(jsonString);
                var iframe = document.createElement("iframe");
                iframe.setAttribute("src", message);
                document.documentElement.appendChild(iframe);
                iframe.parentNode.removeChild(iframe);
                iframe = null;
            } else if (platformType.match("android")) {
                let androidParameter = JSON.parse(jsonString);
                let parameter = androidParameter.parameter;
                let parameterStr = null;
                let fileNameStr = null;
                let jsonStr = null;
                switch (androidParameter.actionname) {
                    case "returnApplication":
                        window.WebViewerProtocol.returnApplication();
                        break;
                    case "sendAppData":
                        window.WebViewerProtocol.sendAppData();
                        break;
                    case "requestAppData":
                        window.WebViewerProtocol.requestAppData();
                        break;
                    case "playBackGroundSound":
                        parameterStr = JSON.stringify(parameter);
                        window.WebViewerProtocol.playBackGroundSound(parameterStr);
                        break;
                    case "stopBackGroundSound":
                        window.WebViewerProtocol.stopBackGroundSound();
                        break;
                    case "playSound":
                        parameterStr = JSON.stringify(parameter);
                        window.WebViewerProtocol.playSound(parameterStr);
                        break;
                    case "stopSound":
                        parameterStr = JSON.stringify(parameter);
                        window.WebViewerProtocol.stopSound(parameterStr);
                        break;
                    case "stopAllSound":
                        window.WebViewerProtocol.stopAllSound();
                        break;
                    case "writeToFile":
                        fileNameStr = JSON.stringify(parameter.filename);
                        jsonStr = JSON.stringify(parameter.json);
                        window.WebViewerProtocol.writeToFile(fileNameStr, jsonStr);
                        break;
                    case "readFromFile":
                        fileNameStr = JSON.stringify(parameter.filename);
                        window.WebViewerProtocol.readFromFile(fileNameStr);
                        break;
                    case "removeFile":
                        fileNameStr = JSON.stringify(parameter.filename);
                        window.WebViewerProtocol.removeFile(fileNameStr);
                        break;
                    case "requestContentsDB":
                        parameterStr = JSON.stringify(parameter);
                        var returnVar = window.WebViewerProtocol.requestContentsDB(parameterStr);
                        window.localStorage.setItem("loadedJSON", returnVar);
                        break;
                    case "setContentsDB":
                        parameterStr = JSON.stringify(parameter);
                        window.WebViewerProtocol.setContentsDB(parameterStr);
                        break;
                    case "goBack":
                        console.log("goBack");
                        window.reward.goBack();
                        break;
                    case "gameStart":
                        console.log("gameStart");
                        window.reward.gameStart();
                        break;
                    default:
                        break;
                }
            }
        }

        // function sendJSON(jsonString) {
        //   var message = "jscall://" + encodeURIComponent(jsonString);
        //   var iframe = document.createElement('iframe');
        //   iframe.setAttribute('src', message);
        //   document.documentElement.appendChild(iframe);
        //   iframe.parentNode.removeChild(iframe);
        //   iframe = null;
        // }

        function sendActionNameWithParameter(actionName, parameter) {
            var tempObject = new Object();
            tempObject.actionname = actionName;
            if (parameter != null) {
                tempObject.parameter = parameter;
            }
            var string = JSON.stringify(tempObject);

            sendJSON(string);
            tempObject = null;
        }

        function writeToFile(filename, dictionary) {
            if (dictionary == null) return;

            var stringJSON = JSON.stringify(dictionary);

            //datastore
            if (kyc_defaultMgr.isApplication() == false) {
                try {
                    window.localStorage.setItem(filename, sjcl.encrypt(privateKey, stringJSON));
                    window.KYC_ActionCompletionHandler(filename, KYC_ActionResultList.KYC_Success, null, KYC_ActionList.KYC_WriteToFile);
                } catch (e) {
                    //if disable cookie you can not use
                    window.KYC_ActionCompletionHandler(filename, KYC_ActionResultList.KYC_Fail, null, KYC_ActionList.KYC_WriteToFile);
                    return;
                }
            } else {
                var parameter = new Object();
                parameter.filename = filename;
                parameter.json = stringJSON;

                this.sendActionNameWithParameter(KYC_ActionList.KYC_WriteToFile, parameter);
                parameter = null;
            }
        }

        function readFromFile(filename) {
            if (kyc_defaultMgr.isApplication() == false) {
                try {
                    var jsonString = window.localStorage.getItem(filename);
                    var jsonObject = null;
                    if (jsonString != null) {
                        jsonObject = JSON.parse(sjcl.decrypt(privateKey, jsonString));
                    }

                    if (jsonString == null || jsonObject == null)
                        window.KYC_ActionCompletionHandler(filename, KYC_ActionResultList.KYC_Fail, null, KYC_ActionList.KYC_ReadFromFile);
                    else window.KYC_ActionCompletionHandler(filename, KYC_ActionResultList.KYC_Success, jsonObject, KYC_ActionList.KYC_ReadFromFile);
                } catch (e) {
                    //if disable cookie you can not use
                    window.KYC_ActionCompletionHandler(filename, KYC_ActionResultList.KYC_Fail, null, KYC_ActionList.KYC_ReadFromFile);
                    return;
                }
            } else {
                var parameter = new Object();
                parameter.filename = filename;

                this.sendActionNameWithParameter(KYC_ActionList.KYC_ReadFromFile, parameter);
                parameter = null;
            }
        }

        function removeFile(filename) {
            if (kyc_defaultMgr.isApplication() == false) {
                try {
                    window.localStorage.removeItem(filename);
                    window.KYC_ActionCompletionHandler(filename, KYC_ActionResultList.KYC_Success, null, KYC_ActionList.KYC_RemoveFile);
                } catch (e) {
                    //if disable cookie you can not use
                    window.KYC_ActionCompletionHandler(filename, KYC_ActionResultList.KYC_Fail, null, KYC_ActionList.KYC_RemoveFile);
                    return;
                }
            } else {
                var parameter = new Object();
                parameter.filename = filename;
                this.sendActionNameWithParameter(KYC_ActionList.KYC_RemoveFile, parameter);
                parameter = null;
            }
        }

        return {
            sendActionNameWithParameter: function (actionName, parameter) {
                sendActionNameWithParameter(actionName, parameter);
            },
            writeToFile: function (filename, dictionary) {
                writeToFile(filename, dictionary);
            },
            readFromFile: function (filename) {
                readFromFile(filename);
            },
            removeFile: function (filename) {
                removeFile(filename);
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
