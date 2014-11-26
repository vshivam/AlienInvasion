if (typeof DynamixAuth === "undefined") {
	var DynamixAuth = {
 		showQRCode : function (app_name, elemId, successCallback) {
	 		console.log("New QR code auth request from : "+ app_name);
	 		var Params = {};
	 		Params.app_name = app_name;
			var token = Dynamix.generateGuid();
			Dynamix.pairing_token = token;
			Params.type ="pairing";
			Params.uuid = Dynamix.generateGuid().substr(3,7);
			Params.salt = Dynamix.generateGuid().substr(3,7);
			var saltedToken = Params.salt.concat(token);
			console.log("Salted Token : " + saltedToken);
			SHA512Hash = CryptoJS.SHA512(saltedToken);
			Params.hashCode = SHA512Hash.toString(CryptoJS.enc.Base64) ;
			var paramsString = JSON.stringify(Params);
			console.log("Generating QR Code for : "+paramsString);
			qrcode = new QRCode(elemId);
			qrcode.makeCode(paramsString);
			$("#"+elemId).dialog({
				autoOpen:false,
				resizable:false,
				modal:true, 
				title:"Scan !", 
			 	show: {
					effect: "blind",
					duration: 1000
				}, 
				buttons : {
					"OK" : function() {
						console.log("Retrieving Phone's IP From Database");
						//Send request to server for the ip.
						var url = "http://pairing.ambientdynamix.org/pairing/retrieveip.php?uuid="+Params.uuid;
						console.log(url);
					 	var xmlhttp = new XMLHttpRequest();
						xmlhttp.onreadystatechange=function(){
							try {
								if (xmlhttp.readyState==4 && xmlhttp.status==200){
									//4: request finished and response is ready
									//200: "OK"
									var ip = convertToJsonObject(xmlhttp.response).ip;
									Dynamix.base_url = "http://"+ip;
									console.log("Dynamix.base_url >> "+Dynamix.base_url);
									successCallback();
								}
							} catch(err){
								console.log(err.message);
							}
						}
						xmlhttp.open("GET",url,true);
						xmlhttp.send();
					}
				}
			});
			$("#"+elemId).dialog("open");
 		}
	}
}

