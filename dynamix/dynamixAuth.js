if (typeof DynamixAuth === "undefined") {
    var DynamixAuth = {
        uuid: null,
        authListener: null,

        /** 
		@readonly
		@enum
		@property {String} DynamixAuth.Enums.QR_CODE_GENERATED QR_CODE_GENERATED
		@property {String} DynamixAuth.Enums.QR_CODE_GENERATED DYNAMIX_DEVICE_FOUND
		@property {String} DynamixAuth.Enums.DYNAMIX_DEVICE_NOT_FOUND DYNAMIX_DEVICE_NOT_FOUND 
		**/

        Enums: Object.freeze({
            QR_CODE_GENERATED: "QR_CODE_GENERATED",
            DYNAMIX_DEVICE_FOUND: "DYNAMIX_DEVICE_FOUND",
            DYNAMIX_DEVICE_NOT_FOUND: "DYNAMIX_DEVICE_NOT_FOUND"
        }),

        /**
		Generate a Dynamix authentication QR Code.  
		@param {function} app_name The name of the Web Application. This will be displayed on the 
		@param {Object} qrParams Parameters for the QR Code. 
		@param {function} qrAuthListener The web client should provide a listener which would listen to changes in the authentication state. 
		@param {Boolean} auto A Boolean flag which tells Dynamix to automatically start retrieving the Dynamix device's IP address.
		@example
        var authListener = function(status) {
            switch(status){
                case DynamixAuth.Enums.QR_CODE_GENERATED: 
                	//QR Code successfully generated
                    break;
                case DynamixAuth.Enums.DYNAMIX_DEVICE_FOUND :
                	//Dynamix device ip was successfully retrieved.
                    break;
                case DynamixAuth.Enums.DYNAMIX_DEVICE_NOT_FOUND :
                	//Could not retrieve Dynamix device ip.
                    break;
            }
        };    
		var qrParams = {};
        qrParams.divId = 'dialog-div';
        qrParams.width = 256;
        qrParams.height = 256;
        DynamixAuth.showQRCode('Alien Invasion', qrParams, authListener, true);
		*/
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

        /**
		Retrieve the IP Address of the Dynamix device. This method is automatically called by the showQRCode() method when the auto flag is set to true by the client. 
		The web client can also make an explicit request to this function to retrieve the ip address of the pairing Dynamix device.
		@param {function} qrAuthListener
		@example
        var authListener = function(status) {
            switch(status){
                case DynamixAuth.Enums.QR_CODE_GENERATED: 
                	//QR Code successfully generated
                    break;
                case DynamixAuth.Enums.DYNAMIX_DEVICE_FOUND :
                	//Dynamix device ip was successfully retrieved.
                    break;
                case DynamixAuth.Enums.DYNAMIX_DEVICE_NOT_FOUND :
                	//Could not retrieve Dynamix device ip.
                    break;
            }
        };    
        DynamixAuth.retrieveIp(authListener);
		*/
        retrieveIp: function(qrAuthListener){
			if(DynamixAuth.uuid == undefined){
				throw {name : 'Undefined uuid', message : 'Method is probably called before the QR Code is displayed'};
				return;   	
			}
			var numOfTries = 60;
        	var retrieve = function() {
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