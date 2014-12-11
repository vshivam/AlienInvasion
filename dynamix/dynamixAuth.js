if (typeof DynamixAuth === "undefined") {
    var DynamixAuth = {
        uuid: null,
        authListener: null,
        Enums: Object.freeze({
            QR_CODE_GENERATED: "QR_CODE_GENERATED",
            DYNAMIX_DEVICE_FOUND: "DYNAMIX_DEVICE_FOUND",
            DYNAMIX_DEVICE_NOT_FOUND: "DYNAMIX_DEVICE_NOT_FOUND"
        }),

        showQRCode: function(app_name, qrParams, qrAuthListener, auto) {
            console.log("New QR code auth request from : " + app_name);
            if (qrParams.divId !== undefined) {
                elemId = qrParams.divId;
            }
            if (qrParams.width === undefined) {
                qrParams.width = 128;
            }
            if (qrParams.height === undefined) {
                qrParams.height = 128;
            }

            var Params = {};
            Params.appName = app_name;
            Dynamix.pairing_token = Dynamix.generateGuid().substr(3,7);
            Params.uuid = Dynamix.generateGuid().substr(3, 7);
            DynamixAuth.uuid = Params.uuid;
            Params.salt = Dynamix.generateGuid().substr(3, 7);
            Params.type = "pairing";
            var saltedToken = Params.salt.concat(Dynamix.pairing_token);
            console.log("Salted Token : " + saltedToken);
            SHA256Hash = CryptoJS.SHA256(saltedToken);
            Params.hashCode = SHA256Hash.toString(CryptoJS.enc.Base64);
            var paramsString = JSON.stringify(Params);
            console.log("Generating QR Code for : " + paramsString);

            var qrContainerDiv = document.getElementById(elemId);
            qrcode = new QRCode(qrContainerDiv, {
                width: qrParams.width,
                height: qrParams.height,
                colorDark: "#000000",
                colorLight: "#ffffff",
            });
            qrcode.makeCode(paramsString);
            qrAuthListener(DynamixAuth.Enums.QR_CODE_GENERATED);
            if (auto) {
                DynamixAuth.retrieveIp(qrAuthListener);
            }
        },


        retrieveIp: function(qrAuthListener){
        	var numOfTries = 60;
        	var retrieve = function() {
	        	console.log('try number' + numOfTries);
	            //Send request to server for the ip.
	            //Append the datetime to prevent caching of result. 
	            var url = "http://pairing.ambientdynamix.org/pairing/retrieveip.php?timestamp=" + Date.now() + "&uuid=" + DynamixAuth.uuid;
	            console.log(url);
	            var xmlhttp = new XMLHttpRequest();
	            xmlhttp.onreadystatechange = function() {
	                try {
	                    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
	                        //4: request finished and response is ready
	                        //200: "OK"
	                        var ip = convertToJsonObject(xmlhttp.response).ip;
	                        console.log("Response> " + xmlhttp.response);
	                        if (ip !== undefined) {
	                            Dynamix.base_url = "http://" + ip;
	                            console.log("Dynamix.base_url >> " + Dynamix.base_url);
	                            qrAuthListener(DynamixAuth.Enums.DYNAMIX_DEVICE_FOUND);
	                        } else {
	                            //Ip Not found, retry
	                            if (numOfTries > 0) {
	                                numOfTries--;
	                                setTimeout(retrieve(), 10000);
	                            } else {
	                                console.log("exiting retry loop");
	                                qrAuthListener(DynamixAuth.Enums.DYNAMIX_DEVICE_NOT_FOUND);
	                            }
	                        }
	                    }
	                } catch (err) {
	                    console.log("Exception >> " + err.message);
	                    if (numOfTries > 0) {
	                        numOfTries--;
	                        setTimeout(retrieve(), 10000);
	                    } else {
	                        console.log("exiting retry loop");
	                        qrAuthListener(DynamixAuth.Enums.DYNAMIX_DEVICE_NOT_FOUND);
	                    }
	                }
	            }
	            xmlhttp.open("GET", url, true);
	            xmlhttp.send();
	        }
	        retrieve();
        }

    }
}