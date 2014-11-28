if (typeof DynamixAuth === "undefined") {
	var DynamixAuth = {
 		showQRCode : function (app_name, elemId, successCallback) {
			$("#"+elemId).html("");
	 		console.log("New QR code auth request from : "+ app_name);
	 		var Params = {};
	 		Params.appName = app_name;
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
			$("#"+elemId).css('text-align','center');
 			$("#"+elemId).append("<br/> Use The Scan to Interact Feature in the Ambient Dynamix Android Application to connect.<br/><br/>");
			qrcode = new QRCode(elemId, {
					    width: 128,
					    height: 128,
					    colorDark : "#000000",
					    colorLight : "#ffffff",
					});
			qrcode.makeCode(paramsString);
 			$("#"+elemId).append("<br/><br/><img id=loading src =images/loading.gif style=margin:auto;width:40px;height:40px;>");
 			$("#"+elemId+" > img").css('display', 'inline');
			$("#"+elemId).dialog({
				autoOpen:false,
				resizable:false,
				modal:true, 
				title:"Authentication QR Code", 
			 	show: {
					effect: "blind",
					duration: 500
				}, 
				//position : { my: "right top", at: "right top", of: window }
			});

			
			$("#"+elemId).dialog("open");
			var numOfTries = 60;
			var retrieveIp = function() {
				//Send request to server for the ip.
				//Append the datetime to prevent caching of result. 
				var url = "http://pairing.ambientdynamix.org/pairing/retrieveip.php?timestamp="+Date.now()+"&uuid="+Params.uuid;
				console.log(url);
			 	var xmlhttp = new XMLHttpRequest();
				xmlhttp.onreadystatechange=function(){
					try {
						if (xmlhttp.readyState==4 && xmlhttp.status==200){
							//4: request finished and response is ready
							//200: "OK"
							var ip = convertToJsonObject(xmlhttp.response).ip;
							console.log("Response> " + xmlhttp.response);
							if(ip!==undefined){
								Dynamix.base_url = "http://"+ip;
								console.log("Dynamix.base_url >> "+Dynamix.base_url);
								successCallback();
							} else {
								//Ip Not found, retry
								if(numOfTries>0){
									numOfTries--;
									setTimeout(retrieveIp(),10000); 
								} else {
									console.log("exiting retry loop");
			 			 			$("#"+elemId).html("<br/> <br/> Could not retrieve Ip Address. Please try again.<br/> <br/>");
								}
							}
						} 
					} catch(err){
						console.log("Exception >> " + err.message);
						//Some exception occured, retry
						if(numOfTries>0){
							numOfTries--;
							setTimeout(retrieveIp(),10000); 
						} else {
								console.log("exiting retry loop");
		 			 			$("#"+elemId).html("<br/> <br/> Could not retrieve Ip Address. Please try again.<br/> <br/>");
			}
					}
				}
				xmlhttp.open("GET",url,true);
				xmlhttp.send();
			};
			retrieveIp();
 		}
	}
}