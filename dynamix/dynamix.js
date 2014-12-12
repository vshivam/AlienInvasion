/**
 * Copyright (C) The Ambient Dynamix Project
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @fileoverview
 * The Dynamix object allows web applications to control a local Dynamix
 * Framework instance that is running on the device. 
 ===============================================================<br/>
	Supported Browsers<br/>
 ===============================================================<br/>
	<ul>
		<li> Standard Android Browser </li>
		<li> Chrome for Android </li>
		<li> Firefox for Android </li>
		<li> Dolphin Browser HD for Android </li>
		<li> Dolphin Browser Mini for Android </li>
		<li> Boat Browser </li>
		<li> Boat Browser Mini </li>
		<li> Maxthon Android Web Browser </li>
		<li> SkyFire Browser </li>
	</ul>
 ===============================================================
 **/
if (typeof Dynamix === "undefined") {

    /**
     * @namespace Dynamix
     **/
    var Dynamix = {
        // ===============================================================
        // Dynamix Configuration Data (!!USED INTERNALLY - DO NOT MODIFY!!)
        // ===============================================================
        /*
         * Base URL for the Dynamix Web Connector. Note that we need to use
         * '127.0.0.1' and not 'localhost', since on some devices, 'localhost' is
         * problematic.
         */
        base_url: "http://127.0.0.1",
        // List of possible Dynamix ports
        port_list: [18087, 5633, 5634, 5635, 5636, 5637, 6130, 6131,
            6132, 6133, 6134, 8223, 8224, 8225, 8226, 8227, 10026, 10027,
            10028, 10029, 10030, 12224, 12225, 12226, 12227, 12228, 16001,
            16002, 16003, 16004, 16005, 19316, 19317, 19318, 19319
        ],

        // ===============================================================
        // Dynamix Private Data (!!USED INTERNALLY - DO NOT MODIFY!!)
        // ===============================================================

        port: 0,
        binding: false,
        bound: false,
        token: null,
        token_cookie: "DynamixTokenCookie",
        port_cookie: "DynamixPortCookie",
        pairing_token: null,
        call_timeout: 1000,
        bind_call_timeout: 100,
        SUCCESS: 0,
        JAVASCRIPT_ERROR: 100,
        BIND_ERROR: 101,
        HTTP_ERROR: 102,
        JSON_ERROR: 103,

        Callbacks: {},
        Listeners: {},
        Handlers: {},


        /** 
		@readonly
		@enum
		@property {String} Dynamix.Enums.SESSION_OPENED SESSION_OPENED
		@property {String} Dynamix.Enums.SESSION_CLOSED SESSION_CLOSED
		@property {String} Dynamix.Enums.SUCCESS SUCCESS 
		@property {String} Dynamix.Enums.WARNING WARNING 
		@property {String} Dynamix.Enums.FAILURE FAILURE
		@property {String} Dynamix.Enums.PLUGIN_ENABLED PLUGIN_ENABLED
		@property {String} Dynamix.Enums.PLUGIN_DISABLED PLUGIN_DISABLED
		@property {String} Dynamix.Enums.PLUGIN_INSTALLED PLUGIN_INSTALLED
		@property {String} Dynamix.Enums.PLUGIN_UNINSTALLED PLUGIN_UNINSTALLED
		@property {String} Dynamix.Enums.PLUGIN_ERROR PLUGIN_ERROR
		@property {String} Dynamix.Enums.INSTALL_PROGRESS INSTALL_PROGRESS
		@property {String} Dynamix.Enums.BOUND BOUND
		@property {String} Dynamix.Enums.UNBOUND UNBOUND
		@property {String} Dynamix.Enums.BIND_ERROR BIND_ERROR
		@property {String} Dynamix.Enums.PLUGIN_DISCOVERY_STARTED PLUGIN_DISCOVERY_STARTED
		@property {String} Dynamix.Enums.PLUGIN_DISCOVERY_FINISHED PLUGIN_DISCOVERY_FINISHED
		**/

        Enums: Object.freeze({
            SESSION_OPENED: "SESSION_OPENED",
            SESSION_CLOSED: "SESSION_CLOSED",
            SUCCESS: "SUCCESS",
            WARNING: "WARNING",
            FAILURE: "FAILURE",
            PLUGIN_RESULT: "PLUGIN_RESULT",
            PLUGIN_ENABLED: "PLUGIN_DISABLED",
            PLUGIN_DISABLED: "PLUGIN_DISABLED",
            PLUGIN_INSTALLED: "PLUGIN_INSTALLED",
            PLUGIN_UNINSTALLED: "PLUGIN_UNINSTALLED",
            PLUGIN_ERROR: "PLUGIN_ERROR",
            INSTALL_PROGRESS: "INSTALL_PROGRESS",
            BOUND: "BOUND",
            UNBOUND: "UNBOUND",
            BIND_ERROR: "BIND_ERROR",
            PLUGIN_DISCOVERY_STARTED: "PLUGIN_DISCOVERY_STARTED",
            PLUGIN_DISCOVERY_FINISHED: "PLUGIN_DISCOVERY_FINISHED"
        }),


        /**
		Binds to the Dynamix Framework. 
		@param {function} bindListener The web client should provide a listener which would listen to changes in the bind state. 
		@example
		var bindListener = function(status) {
			switch(status) {
				case Dynamix.Enums.BOUND :
					openDynamixSession();
					break;
				case Dynamix.Enums.BIND_ERROR :
					Dynamix.bind(bindListener)
					break;
				case Dynamix.Enums.UNBOUND :
					break;
			}
		}
		Dynamix.bind(bindListener);
		*/
        bind: function(listener) {
            console.log("Dynamix.bind called");
            /*
             * Check if we're already binding.
             */
            Dynamix.Listeners['bind-state-listener'] = listener;
            if (!Dynamix.binding) {
                // Set binding
                Dynamix.binding = true;

                /*
                 * Check if we're already bound.
                 */
                if (!Dynamix.bound) {
                    // Check for cookie values
                    var cookieToken = Dynamix.getCookie(Dynamix.token_cookie);
                    var cookiePort = Dynamix.getCookie(Dynamix.port_cookie);
                    if (cookieToken != null && cookieToken != "" && cookiePort != null && cookiePort != "") {
                        console.log("Found Dynamix cookie token");
                        console.log("Found Dynamix cookie port: " + cookiePort);
                        // Use the cookie to set the port value
                        Dynamix.port = cookiePort;
                        // We have a cookie token, check if it's valid
                        if (Dynamix.isTokenValid(cookieToken)) {
                            // The cookie token is still valid, so use it
                            Dynamix.token = cookieToken;
                            // Set bound
                            Dynamix.bound = true;
                            Dynamix.binding = false;
                            // Start the event loop
                            setTimeout(Dynamix.eventLoop, 10);
                            console.log("Dynamix cookie token was valid");

                            // Notify bound
                            DynamixListener.onDynamixFrameworkBound();

                            /*
                             * Notify Dynamix listener, since this page has not
                             * received state events yet because it didn't setup the
                             * session.
                             */
                            // Notify session state
                            if (Dynamix.isSessionOpen())
                                DynamixListener.onSessionOpened();
                            else
                                DynamixListener.onSessionClosed();
                            // Notify active state
                            if (Dynamix.isDynamixActive())
                                DynamixListener.onDynamixFrameworkActive();
                            else
                                DynamixListener.onDynamixFrameworkInactive();
                            return;

                        } else {
                            console.log("Dynamix cookie has expired");
                        }
                    } else {
                        console.log("No Dynamix cookie found");
                    }
                    /*
                     * No valid cookie, so try connecting on each specified Dynamix
                     * port
                     */
                    Dynamix.bindHelper(0);

                } else {
                    console.log("Dynamix Already Bound!");
                    // Notify
                    DynamixListener.onDynamixFrameworkBound();
                }
            } else {
                console.log("Dynamix Already Binding!");
            }
        },

        /**
		Open a new Dynamix Session. A session can be opened only after the bind call was successful. 
		@param {Object} optParams Optional callback and listener
		@example 
		var openSessionCallback = function(status) {
			switch(status) {
				case Dynamix.Enums.SUCCESS :
					createContextHandler();
					break;
				case Dynamix.Enums.FAILURE : 
					break;
			}
		};			
		//The session listener gets updates when
		//1. Session state changes.
		//2. Plugin state changes.
		var sessionListener = function(status, result) {
			switch(status) {
				case Dynamix.Enums.SESSION_OPENED :
					break;
				case Dynamix.Enums.SESSION_CLOSED : 
					break;
				case Dynamix.Enums.PLUGIN_UNINSTALLED :
					break;
				case Dynamix.Enums.PLUGIN_INSTALLED :
					break;
				case Dynamix.Enums.PLUGIN_ENABLED :
					break;
				case Dynamix.Enums.PLUGIN_DISABLED :
					break;
				case Dynamix.Enums.PLUGIN_ERROR :
					break;
			}
		};
		Dynamix.openDynamixSession({listener:sessionListener, callback:openSessionCallback});
		**/
        openDynamixSession: function(optParams) {
            var xmlhttp = Dynamix.getXmlHttpRequest();
            try {
                if (optParams.listener !== undefined && optParams.callback !== undefined) {
                    var listenerId = Dynamix.generateGuid();
                    Dynamix.Listeners[listenerId] = optParams.listener;
                    var callbackId = Dynamix.generateGuid();
                    Dynamix.Callbacks[callbackId] = optParams.callback;
                    xmlhttp.open("GET", Dynamix.base_url + ":" + Dynamix.port + "/opendynamixsession?sessionListenerId=" + listenerId +
                        "&callbackId=" + callbackId);
                } else if (optParams.listener !== undefined) {
                    var listenerId = Dynamix.generateGuid();
                    Dynamix.Listeners[listenerId] = optParams.listener;
                    xmlhttp.open("GET", Dynamix.base_url + ":" + Dynamix.port + "/opendynamixsession?sessionListenerId=" + listenerId);
                } else if (optParams.callback !== undefined) {
                    var callbackId = Dynamix.generateGuid();
                    Dynamix.Callbacks[callbackId] = optParams.callback;
                    xmlhttp.open("GET", Dynamix.base_url + ":" + Dynamix.port + "/opendynamixsession?callbackId=" + callbackId);
                } else {
                    xmlhttp.open("GET", Dynamix.base_url + ":" + Dynamix.port + "/opendynamixsession");
                }
                xmlhttp.setRequestHeader("Authorization", Dynamix.token);
                xmlhttp.send();
            } catch (e) {
                console.log("Error opening new session:" + e);
            }
        },

        /**
		Creates a new {@link Dynamix.handler context handler}. 
		@params {function} callback The callback will receive a newly created context handler on success. The web client will then be able to make requests using this handler object.
		
		@example 
		var createNewHandlerCallback = function(status, handler) {
			switch(status) {
				case Dynamix.Enums.SUCCESS :
				dynamixContextHandler = handler;
				break;
			}
		};
		Dynamix.createContextHandler(createNewHandlerCallback);
		**/
        createContextHandler: function(callback) {
            var callbackId = Dynamix.generateGuid();
            Dynamix.Callbacks[callbackId] = callback;
            var xmlhttp = Dynamix.getXmlHttpRequest();
            try {
                xmlhttp.open("GET", Dynamix.base_url + ":" + Dynamix.port +
                    "/createcontexthandler?callbackId=" + callbackId, true);
                xmlhttp.setRequestHeader("Authorization", Dynamix.token);
                xmlhttp.send();
            } catch (e) {
                console.log("Error getting new context handler : " + e);
            }
        },

        /**
         * Represents a Context Handler.
         * @constructor
         **/
        handler: function handler(id) {
            this.id = id;
            /**
			Add a new context support to the context handler. 
			@param {String} pluginId Plugin Id
			@param {String} contextType Context Type
			@param {object} optParams Optional callback and listener
			@example
			var batteryLevelCallback = function(status, result) {
				switch(status) {
					case Dynamix.Enums.SUCCESS :
						break;
					case Dynamix.Enums.FAILURE :
						break;
					case Dynamix.Enums.INSTALL_PROGRESS :
						break;
					case Dynamix.Enums.WARNING :
						break;
				}
			};
			var batteryLevelListener = function(status, result) {
				switch(status) {
					case Dynamix.Enums.PLUGIN_RESULT :
						batteryLevel = parseInt(result.batteryLevel);
						console.log(result.batteryLevel);
						break;
				}
			};

			dynamixContextHandler.addContextSupport( "org.ambientdynamix.contextplugins.batterylevel",
				"org.ambientdynamix.contextplugins.batterylevel", {callback : batteryLevelCallback , listener : batteryLevelListener});
			**/
            this.addContextSupport = function(pluginId, contextType, optParams) {
                try {
                    var xmlhttp = Dynamix.getXmlHttpRequest();
                    if (optParams === undefined) {
                        xmlhttp.open("GET", Dynamix.base_url + ":" + Dynamix.port +
                            "/addContextSupport?contextHandlerId=" + id +
                            "&contextType=" + contextType + "&pluginId=" + pluginId, true);
                        console.log("Requesting for context support without callback or listener");
                    } else if (typeof optParams.callback !== undefined &&
                        optParams.listener !== undefined) {
                        var listenerId = Dynamix.generateGuid();
                        var callbackId = Dynamix.generateGuid();
                        Dynamix.Callbacks[callbackId] = optParams.callback;
                        Dynamix.Listeners[listenerId] = optParams.listener;
                        xmlhttp.open("GET", Dynamix.base_url + ":" + Dynamix.port +
                            "/addContextSupport?contextHandlerId=" + id +
                            "&contextType=" + contextType + "&pluginId=" + pluginId +
                            "&callbackId=" + callbackId +
                            "&contextListenerId=" + listenerId, true);
                        console.log("Requesting for context support with callback and listener");
                    } else if (typeof optParams.callback !== undefined) {
                        var callbackId = Dynamix.generateGuid();
                        Dynamix.Callbacks[callbackId] = optParams.callback;
                        xmlhttp.open("GET", Dynamix.base_url + ":" + Dynamix.port +
                            "/addContextSupport?contextHandlerId=" + id +
                            "&contextType=" + contextType + "&pluginId=" + pluginId +
                            "&callbackId=" + callbackId, true);
                        console.log("Requesting for context support with only callback");
                    } else if (typeof optParams.listener !== undefined) {
                        var listenerId = Dynamix.generateGuid();
                        Dynamix.Listeners[listenerId] = optParams.listener;
                        xmlhttp.open("GET", Dynamix.base_url + ":" + Dynamix.port +
                            "/addContextSupport?contextHandlerId=" + id +
                            "&contextType=" + contextType + "&pluginId=" + pluginId +
                            "&contextListenerId=" + listenerId, true);
                        console.log("Requesting for context support with only listener");
                    }
                    xmlhttp.setRequestHeader("Authorization", Dynamix.token);
                    xmlhttp.send();
                } catch (e) {
                    console.log("Add context support failed : " + e);
                }
            };

            /**
			Make a new context request. A context request can only be made if the 
			context support request has been made successfully.
			@param {String} pluginId Id of the plugin. 
			@param {String} contextType Context type for the context request.
			@param {function} callback a function to which Dynamix would return the context request result object.
			@example
			var voiceControlContextRequestCallback = function(status, result) {
				switch(status) {
					case Dynamix.Enums.SUCCESS:
						doSomethingWithResult(result);
						break;
				}
			};
			dynamixContextHandler.contextRequest("org.ambientdynamix.contextplugins.speechtotext", 
			"org.ambientdynamix.contextplugins.speechtotext.voiceresults", voiceControlContextRequestCallback );
			**/
            this.contextRequest = function(pluginId, contextType, callback) {
                try {
                    var xmlhttp = Dynamix.getXmlHttpRequest();
                    var callbackId = Dynamix.generateGuid();
                    Dynamix.Callbacks[callbackId] = callback;
                    xmlhttp.open("GET", Dynamix.base_url + ":" + Dynamix.port +
                        "/contextrequest?contextHandlerId=" + id +
                        "&contextType=" + contextType + "&pluginId=" + pluginId +
                        "&callbackId=" + callbackId, true);
                    xmlhttp.setRequestHeader("Authorization", Dynamix.token);
                    xmlhttp.send();
                } catch (e) {
                    console.log("Context request failed : " + e);
                }
            };

            /**
			Make a configured request to the Dynamix Framework. 
			Since, the request to be made is similar for addConfiguredContextSupport() and configuredContextRequest() 
			we pass on the parameters from these methods to makeConfiguredRequest() which makes the relevant REST Request. 

			NOTE : This method is used internally and the web client does not need to use this method. 
			The client should make use of addConfiguredContextSupport() and configuredContextRequest() as required.
			@private
			*/
            makeConfiguredRequest = function(url, method, pluginId, contextType, optParams) {
                var getParamStringFromObject = function(obj) {
                    var str = [];
                    for (var p in obj) {
                        if (obj.hasOwnProperty(p)) {
                            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                        }
                    }
                    return str.join("&");
                };

                var xmlhttp = Dynamix.getXmlHttpRequest();
                var restParamString = "";
                method = method.toUpperCase();
                var restUrl = Dynamix.base_url + ":" + Dynamix.port + url;
                var paramString = "";
                if (typeof optParams.callback !== undefined &&
                    optParams.listener !== undefined) {
                    var listenerId = Dynamix.generateGuid();
                    var callbackId = Dynamix.generateGuid();
                    Dynamix.Callbacks[callbackId] = optParams.callback;
                    Dynamix.Listeners[listenerId] = optParams.listener;
                    paramString = "contextHandlerId=" + id +
                        "&contextType=" + contextType + "&pluginId=" + pluginId +
                        "&callbackId=" + callbackId +
                        "&contextListenerId=" + listenerId;
                } else if (typeof optParams.callback !== undefined) {
                    var callbackId = Dynamix.generateGuid();
                    Dynamix.Callbacks[callbackId] = optParams.callback;
                    paramString = "contextHandlerId=" + id +
                        "&contextType=" + contextType + "&pluginId=" + pluginId +
                        "&callbackId=" + callbackId;
                } else if (typeof optParams.listener !== undefined) {
                    var listenerId = Dynamix.generateGuid();
                    Dynamix.Listeners[listenerId] = optParams.listener;
                    paramString = "contextHandlerId=" + id +
                        "&contextType=" + contextType + "&pluginId=" + pluginId +
                        "&contextListenerId=" + listenerId;
                } else {
                    paramString = "contextHandlerId=" + id +
                        "&contextType=" + contextType + "&pluginId=" + pluginId;
                }
                console.log("Param String : " + paramString);

                if (method == "GET") {
                    if (optParams.params !== undefined) {
                        var configuredParamString = getParamStringFromObject(optParams.params);
                        restUrl = restUrl + "?" + paramString + "&" + configuredParamString;
                        console.log(restUrl);
                    } else {
                        restUrl = restUrl + "?" + paramString;
                    }
                    xmlhttp.open(method, restUrl, true);
                    if (optParams.headers !== undefined) {
                        for (var key in optParams.headers) {
                            xmlhttp.setRequestHeader(key, optParams.headers.key);
                        }
                    }
                    xmlhttp.setRequestHeader("Authorization", Dynamix.token);
                    xmlhttp.send();
                } else if (method == "POST" || method == "PUT" || method == "DELETE") {
                    if (optParams.params !== undefined) {
                        var configuredParamString = getParamStringFromObject(optParams.params);
                        restParamString = configuredParamString + "&" + paramString;
                    } else {
                        restParamString = paramString;
                    }
                    xmlhttp.open(method, restUrl, true);
                    if (optParams.headers !== undefined) {
                        for (var key in optParams.headers) {
                            xmlhttp.setRequestHeader(key, optParams.headers.key);
                        }
                    }
                    xmlhttp.setRequestHeader("Authorization", Dynamix.token);
                    // xmlhttp.setRequestHeader("Content-length", restParamString.length); 
                    console.log(restParamString);
                    xmlhttp.send(restParamString);
                } else {
                    console.log("Unsupported REST Method");
                }
            };

            /**
			Allows the web clients to make configured context requests. These requests 
			can only be made if a context support has been successfully requested.
			@param {String} method The Dynamix Framework supports GET, PUT, POST and DELETE Methods.
			@param {String} pluginId The id of the plugin
			@param {String} contextType The context type. 
			@param {Object} optParams The optional parameters. 
			@example 
			var paramsObject = {color : "red", lux : 22};
			var headerObject = {"Content-type" : "application/x-www-form-urlencoded"};
			dynamixContextHandler.addConfiguredContextSupport("PUT", "org.ambientdynamix.contextplugins.samplepluginid, "org.ambientdynamix.contextplugins.samplecontexttype", 
				{callback : configuredRequestCallback, params : params, headers : headerObject});
			**/
            this.configuredContextRequest = function(method, pluginId, contextType, optParams) {
                makeConfiguredRequest("/configuredcontextrequest", method, pluginId, contextType, optParams);
            };

            /**
			Allows the web clients to add configured context support. 

			@param {String} method The Dynamix Framework supports GET, PUT, POST and DELETE Methods.
			@param {String} pluginId The id of the plugin
			@param {String} contextType The context type. 
			@param {Object} optParams The optional parameters. 
			@example 
			var paramsObject = {color : "red", lux : 22};
			var headerObject = {"Content-type" : "application/x-www-form-urlencoded"};
			dynamixContextHandler.addConfiguredContextSupport("PUT", "org.ambientdynamix.contextplugins.samplepluginid", "org.ambientdynamix.contextplugins.samplecontexttype", 
				{callback : configuredRequestCallback, listener : configuredRequestListener, params : paramsObject, headers : headerObject});
			**/
            this.addConfiguredContextSupport = function(method, pluginId, contextType, optParams) {
                makeConfiguredRequest("/addconfiguredcontextsupport", method, pluginId, contextType, optParams);
            };
            /**
			Remove context support for the given context type.
			@param {String} contextType The contextType for which the support should be removed.
			@param {Object} optParams The optional parameters. The web client can provide an optional callback.
			@example 
			var disableVoiceControlPluginCallback = function(status, result) {
				switch(status) {
					case Dynamix.Enums.FAILURE :
						break;
					case Dynamix.Enums.SUCCESS :
						break;
				}
			};
			dynamixContextHandler.removeContextSupportForContextType("org.ambientdynamix.contextplugins.speechtotext.voiceresults", 
				{callback : disableVoiceControlPluginCallback });
			**/
            this.removeContextSupportForContextType = function(contextType, optParams) {
                try {
                    var xmlhttp = Dynamix.getXmlHttpRequest();
                    if (optParams.callback !== undefined) {
                        var callbackId = Dynamix.generateGuid();
                        Dynamix.Callbacks[callbackId] = optParams.callback;
                        xmlhttp.open("GET", Dynamix.base_url + ":" + Dynamix.port +
                            "/removecontextsupportforcontexttype?contextHandlerId=" + this.id + "&contextType=" + contextType + "&callbackId=" + callbackId);
                    } else {
                        xmlhttp.open("GET", Dynamix.base_url + ":" + Dynamix.port +
                            "/removecontextsupportforcontexttype?contextHandlerId=" + this.id + "&contextType=" + contextType);
                    }
                    xmlhttp.setRequestHeader("Authorization", Dynamix.token);
                    xmlhttp.send();
                } catch (e) {
                    console.log("Error removing context support for type : " + contextType + " >>" + e);
                }
            };

            /**
			Remove context support for the given context type.
			@param {String} supportId The supportId for which the support should be removed.
			@param {Object} optParams The optional parameters. The web client can provide an optional callback.
			@example 
			var removeVoiceControlSupportCallback = function(status, result) {
				switch(status) {
					case Dynamix.Enums.FAILURE :
						break;
					case Dynamix.Enums.SUCCESS :
						break;
				}
			};
			dynamixContextHandler.removeContextSupportForSupportId("org.ambientdynamix.contextplugins.speechtotext", 
				{callback : removeVoiceControlSupportCallback });
			**/
            this.removeContextSupportForSupportId = function(supportId, optParams) {
                try {
                    var xmlhttp = Dynamix.getXmlHttpRequest();
                    if (optParams.callback !== undefined) {
                        var callbackId = Dynamix.generateGuid();
                        Dynamix.Callbacks[callbackId] = optParams.callback;
                        xmlhttp.open("GET", Dynamix.base_url + ":" + Dynamix.port +
                            "/removecontextsupportforsupportid?contextHandlerId=" + this.id + "&supportId=" + supportId + "&callbackId=" + callbackId);
                    } else {
                        xmlhttp.open("GET", Dynamix.base_url + ":" + Dynamix.port +
                            "/removecontextsupportforcontexttype?contextHandlerId=" + this.id + "&supportId=" + supportId);
                    }
                    xmlhttp.setRequestHeader("Authorization", Dynamix.token);
                    xmlhttp.send();
                } catch (e) {
                    console.log("Error removing context support for type : " + contextType + " >>" + e);
                }
            };

            /**
			Get information about all the context plugins.
			**/
            this.getAllContextPluginInformation = function() {
                try {
                    var xmlhttp = Dynamix.getXmlHttpRequest();
                    xmlhttp.open("GET", Dynamix.base_url + ":" + Dynamix.port +
                        "/getallcontextplugininformation");
                    xmlhttp.setRequestHeader("Authorization", Dynamix.token);
                    xmlhttp.send();
                } catch (e) {
                    console.log("Error getting all context plugin information : " + e);
                }
            };
          
            /**
			Get information about all the context plugins of the given type.
			@param {String} contextType The context type for which the context 
			plugins information should be fetched.
			**/
            this.getAllContextPluginsForType = function(contextType) {
                try {
                    var xmlhttp = Dynamix.getXmlHttpRequest();
                    xmlhttp.open("GET", Dynamix.base_url + ":" + Dynamix.port +
                        "/getallcontextplugininformationfortype?contextType=" + contextType);
                    xmlhttp.setRequestHeader("Authorization", Dynamix.token);
                    xmlhttp.send();
                } catch (e) {
                    console.log("Error getting context plugins for the type " + contextType + " : " + e);
                }
            };
          
            /**
			Get information about all the currently installed context plugins.
			**/
            this.getInstalledContextPlugins = function() {
                try {
                    var xmlhttp = Dynamix.getXmlHttpRequest();
                    xmlhttp.open("GET", Dynamix.base_url + ":" + Dynamix.port +
                        "/getallcontextplugininformationfortype?contextType=" + contextType);
                    xmlhttp.setRequestHeader("Authorization", Dynamix.token);
                    xmlhttp.send();
                } catch (e) {
                    console.log("Error getting context plugins for the type " + contextType + " : " + e);
                }
            };
          
            /**
			Get information about a particular plugin id.
			@param {String} pluginId The plugin id for which the information should be fetched.
			**/
            this.getContextPluginInformation = function(pluginId) {
                try {
                    var xmlhttp = Dynamix.getXmlHttpRequest();
                    xmlhttp.open("GET", Dynamix.base_url + ":" + Dynamix.port +
                        "/getcontextplugininformation?pluginId=" + pluginId);
                    xmlhttp.setRequestHeader("Authorization", Dynamix.token);
                    xmlhttp.send();
                } catch (e) {
                    console.log("Error getting plugin information for the pluginId " + pluginId + " : " + e);
                }
            };



            this.openContextPluginConfigurationView = function(pluginId) {
                try {
                    var xmlhttp = Dynamix.getXmlHttpRequest();
                    xmlhttp.open("GET", Dynamix.base_url + ":" + Dynamix.port +
                        "/opencontextpluginconfigurationview?pluginId=" + pluginId);
                    xmlhttp.setRequestHeader("Authorization", Dynamix.token);
                    xmlhttp.send();
                } catch (e) {
                    console.log("Error opening context plugin configuration view for plugin Id : " + pluginId);
                }
            };
        },
      
        /**
		Remove a context handler.
		NOTE : This'll also remove any context support that was added to the context handler and 
		the web client will have to request a new handler to make any further context support requests.
		@param {Object} handler The handler object which should be removed.
		@param {Object} optParams The web client can provide an optional callback 
		which'll be provided the success or failure state of the request. 
		**/
        removeContextHandler: function(handler, optParams) {
            try {
                var xmlhttp = Dynamix.getXmlHttpRequest();
                if (optParams.callback !== undefined) {
                    var callbackId = Dynamix.generateGuid();
                    Dynamix.Callbacks[callbackId] = optParams.callback;
                    xmlhttp.open("GET", Dynamix.base_url + ":" + Dynamix.port +
                        "/removecontexthandler?contextHandlerId=" + handler.id + "&callbackId=" + callbackId, true);
                } else {
                    xmlhttp.open("GET", Dynamix.base_url + ":" + Dynamix.port +
                        "/removecontexthandler?contextHandlerId=" + handler.id, true);
                }
                xmlhttp.setRequestHeader("Authorization", Dynamix.token);
                xmlhttp.send();
            } catch (e) {
                console.log("Error removing context handler : " + e);
            }
        },
      
        /**
		Close the current dynamix session. 
		NOTE : This'll also remove any context support that was added by the web client. The client 
		will have to open a new session before making any further requests to Dynamix. 
		The client will still be bound to Dynamix. 

		@param {Object} optParams The web client can provide an optional callback 
		which'll be provided the success or failure state of the request. 
		**/
        closeDynamixSession: function(optParams) {
            try {
                var xmlhttp = Dynamix.getXmlHttpRequest();
                if (optParams.callback !== undefined) {
                    var callbackId = Dynamix.generateGuid();
                    Dynamix.Callbacks[callbackId] = optParams.callback;
                    xmlhttp.open("GET", Dynamix.base_url + ":" + Dynamix.port +
                        "/closedynamixsession?callbackId=" + callbackId, true);
                } else {
                    xmlhttp.open("GET", Dynamix.base_url + ":" + Dynamix.port +
                        "/closedynamixsession", true);
                }
                xmlhttp.setRequestHeader("Authorization", Dynamix.token);
                xmlhttp.send();
            } catch (e) {
                console.log("Error closing dynamix session : " + e);
            }
        },
      
        /**
		Unbind dynamix. This'll completely clear all communication with the Dynamix Framework. 
		The web client will need to call bind() and start fresh.
		**/
        unbind: function() {
            var xmlhttp = Dynamix.getXmlHttpRequest();
            try {
                xmlhttp.open("GET", Dynamix.base_url + ":" + Dynamix.port + "/dynamixUnbind", false);
                xmlhttp.setRequestHeader("Authorization", Dynamix.token);
                xmlhttp.send();
                if (xmlhttp.status == 503) {
                    console.log("Unbind request status >> " + xmlhttp.status);
                    console.log("Unbind call succeeded in Dynamix");
                    Dynamix.onDynamixUnbind();
                } else {
                    Dynamix.onDynamixUnbind();
                }
            } catch (e) {
                console.log("Error unbinding Dynamix: " + e);
                // Notify locally
                Dynamix.onDynamixUnbind();
            }
        },

        /**
		 * Indicates if a Dynamix request call was accepted for processing. Note
		 * that results are sent via DynamixListener events.
 		 @private
		 */
        Result: function(success, resultCode, resultMessage) {
            // True if successful; false otherwise.
            this.success = success;
            // The result code
            this.resultCode = resultCode;
            // The result message
            this.resultMessage = decodeURIComponent(resultMessage);
            // We return 'this' so that eval-based object creation works
            return this;
        },

        /**
		 * Indicates if a Dynamix request was accepted for processing (includes a
		 * requestId). Note that results are sent via DynamixListener events.
		 * Resulting events will include a responseId that matches the requestId
		 * provided by this object. For example, a 'Dynamix.contextRequest' request
		 * will return a 'Dynamix.IdResult', which will be later included in the a
		 * context event with an associated responseId.
 		 @private
		 */
        IdResult: function(success, resultCode, resultMessage, requestId) {
            // True if successful; false otherwise.
            this.success = success;
            // The result code
            this.resultCode = resultCode;
            // The result message
            this.resultMessage = decodeURIComponent(resultMessage);
            // The request id
            this.requestId = requestId;
            // We return 'this' so that eval-based object creation works
            return this;
        },

        /**
		 * Used to test browser security by setting illegal request header values.
		 @private		 
		 */
        testSecurity: function() {
            var xmlhttp = Dynamix.getXmlHttpRequest();
            try {
                xmlhttp.open("GET", Dynamix.base_url + ":" + Dynamix.port + "/isDynamixActive", false);
                xmlhttp.setRequestHeader('Referer', 'http://www.fakereferer.com/');
                xmlhttp.setRequestHeader('Origin', 'http://www.fakeorigin.com/');
                xmlhttp.send();
                return Dynamix.getBooleanFromResponse(xmlhttp);
            } catch (e) {
                console.log("Error connecting to Dynamix: " + e);
                return false;
            }
        },

        /**
		 * Helper method that is used by Dynamix.bind to attempt to bind on a
		 * specific port. This is recursively called with an index into the
		 * Dynamix.port_list.
		   @private
		 */
        bindHelper: function(index) {
            // Make sure we're binding
            if (Dynamix.binding) {
                console.log("Trying to bind to Dynamix on port: " + Dynamix.port_list[index]);
                Dynamix.port = Dynamix.port_list[index];
                var xmlhttp = Dynamix.getXmlHttpRequest();
                // Set a short timeout
                xmlhttp.timeout = Dynamix.bind_call_timeout;
                console.log("Making bind request to: " + Dynamix.base_url + ":" + Dynamix.port + "/dynamixBind");
                if (Dynamix.pairing_token == null) {
                    xmlhttp.open("GET", Dynamix.base_url + ":" + Dynamix.port + "/dynamixBind", true);
                } else {
                    xmlhttp.open("GET", Dynamix.base_url + ":" + Dynamix.port + "/dynamixBind?pairing_token=" + Dynamix.pairing_token, true);
                }
                xmlhttp.onreadystatechange = function() {
                    if (xmlhttp.readyState == 4) {
                        if (xmlhttp.status == 200) {
                            // Store the token
                            Dynamix.token = xmlhttp.responseText;
                            // Set bound
                            Dynamix.bound = true;
                            // Set not binding
                            Dynamix.binding = false;
                            // Set cookies
                            Dynamix.setCookie(Dynamix.token_cookie, Dynamix.token,
                                1);
                            Dynamix.setCookie(Dynamix.port_cookie, Dynamix.port, 1);
                            // Start the event loop
                            setTimeout(Dynamix.eventLoop, 10);
                            console.log("Dynamix newly bound on port: " + Dynamix.port_list[index]);
                            // Notify
                            DynamixListener.onDynamixFrameworkBound();
                            return;
                        } else if (xmlhttp.status == 400) {
                            // We found Dynamix, but there was an error with the
                            // request
                            var r = Dynamix.parameterizeResult(xmlhttp);
                            console.log("Dynamix error during bind on port: " + Dynamix.port_list[index] + " " + r.resultMessage);
                            // Set not binding
                            Dynamix.binding = false;
                            DynamixListener.onDynamixFrameworkBindError(r);

                            return;
                        } else if (xmlhttp.status == 403) {
                            // We found Dynamix, but we are not authorized
                            var r = Dynamix.parameterizeResult(xmlhttp);
                            console.log("Authorization error during bind on port: " + Dynamix.port_list[index] + " " + r.resultMessage);
                            // Set not binding
                            Dynamix.binding = false;
                            DynamixListener.onDynamixFrameworkBindError(r);
                            return;
                        } else {
                            // Failed to bind on port
                            console.log("Failed to bind to Dynamix on port: " + Dynamix.port_list[index]);
                            console.log("Total ports are " + Dynamix.port_list.length);
                            console.log(xmlhttp.status);
                            if (index++ < Dynamix.port_list.length - 1) {
                                Dynamix.bindHelper(index);
                            } else {
                                // Stop binding
                                Dynamix.binding = false;
                                // Notify that we failed to bind to Dynamix
                                console
                                    .log("Failed to bind Dynamix on all specified ports");
                                DynamixListener
                                    .onDynamixFrameworkBindError(new Dynamix.Result(
                                        false, Dynamix.BIND_ERROR,
                                        "Could not bind to Dynamix"));
                            }
                        }
                    }
                };

                xmlhttp.send();
            } else {
                console.log("Can only be called when binding!");
            }
        },

        /**
		 * Returns true if Dynamix is active; false otherwise.
		 NOTE : The Dynamix Framework becomes inactive when the device screen turns off 
		 and active again when the screen is turned on.
		 */
        isDynamixActive: function() {
            var xmlhttp = Dynamix.getXmlHttpRequest();
            try {
                xmlhttp.open("GET", Dynamix.base_url + ":" + Dynamix.port + "/isDynamixActive", false);
                xmlhttp.setRequestHeader("Authorization", Dynamix.token);
                xmlhttp.send();
                return Dynamix.getBooleanFromResponse(xmlhttp);
            } catch (e) {
                console.log("Error connecting to Dynamix: " + e);
                return false;
            }
        },

        /**
		* Returns true if the specified token is valid (i.e. registered by
		* Dynamix); false otherwise.
		@private
		*/
        isTokenValid: function(token) {
            var xmlhttp = Dynamix.getXmlHttpRequest();
            try {
                xmlhttp.open("GET", Dynamix.base_url + ":" + Dynamix.port + "/isDynamixTokenValid", false);
                xmlhttp.setRequestHeader("Authorization", token);
                xmlhttp.send();
                return Dynamix.getBooleanFromResponse(xmlhttp);
            } catch (e) {
                console.log("Error connecting to Dynamix: " + e);
                return false;
            }
        },

        /**
         * Returns true if the web client's session is open; false otherwise.
         */
        isSessionOpen: function() {
            var xmlhttp = Dynamix.getXmlHttpRequest();
            try {
                xmlhttp.open("GET", Dynamix.base_url + ":" + Dynamix.port + "/isdynamixsessionopen", false);
                xmlhttp.setRequestHeader("Authorization", Dynamix.token);
                xmlhttp.send();
                return Dynamix.getBooleanFromResponse(xmlhttp);
            } catch (e) {
                console.log("Error connecting to Dynamix: " + e);
                return false;
            }
        },

        // ===============================================================
        // Dynamix Event Handlers (used internally only)
        // ===============================================================

        // onDynamixUnbind
        onDynamixUnbind: function() {
            // Set not bound
            Dynamix.bound = false;
            Dynamix.binding = false;
            Dynamix.bind_index = 0;
            // Remove our token
            Dynamix.token = null;
            // Notify listener
            DynamixListener.onDynamixFrameworkUnbound();
        },

        // getXmlHttpRequest
        getXmlHttpRequest: function() {
            /*
             * Cross platform link:
             * http://stackoverflow.com/questions/1203074/firefox-extension-multiple-xmlhttprequest-calls-per-page
             */
            var xmlhttp = false;
            if (window.XMLHttpRequest) { // Mozilla, Safari,...
                xmlhttp = new XMLHttpRequest();
                if (xmlhttp.overrideMimeType) {
                    /*
                     * Override Mime type to prevent some browsers from trying to
                     * parse responses as XML (e.g., Firefox).
                     */
                    xmlhttp.overrideMimeType('text/plain');
                    /* Can't use timeouts in some browsers for sync calls */
                    // xmlhttp.timeout = Dynamix.call_timeout;
                }
            } else if (window.ActiveXObject) { // IE
                try {
                    xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");

                    /*
                     * Override Mime type to prevent some browsers from trying to
                     * parse responses as XML (e.g., Firefox).
                     */
                    xmlhttp.overrideMimeType('text/plain');
                    /* Can't use timeouts in some browsers for sync calls */
                    // xmlhttp.timeout = Dynamix.call_timeout;
                } catch (e) {
                    try {
                        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
                        /*
                         * Override Mime type to prevent some browsers from trying
                         * to parse responses as XML (e.g., Firefox).
                         */
                        xmlhttp.overrideMimeType('text/plain');
                        /* Can't use timeouts in some browsers for sync calls */
                        // xmlhttp.timeout = Dynamix.call_timeout;
                    } catch (e) {}
                }
            }
            return xmlhttp;
        },

        // eventLoop
        eventLoop: function() {
            if (Dynamix.bound) {
                // Create the xmlHttp request
                var xmlhttp = Dynamix.getXmlHttpRequest();
                // Set 12 second timeout
                xmlhttp.timeout = 12000;
                // Handle state changes
                xmlhttp.onreadystatechange = function() {
                    if (xmlhttp.readyState == 4) {
                        if (!Dynamix.bound) {
                            console
                                .log("Dynamix.eventLoop: Dynamix Not Bound.... exiting event loop");
                            return;
                        }

                        // If eventLoop has JavaScript statement to execute
                        if (xmlhttp.status == 200) {

                            // URI decode the response
                            var msg = decodeURIComponent(xmlhttp.responseText);
                            /*
                             * Make sure we're only executing Dynamix method calls,
                             * which always start with 'javascript:try{Dynamix.' or
                             * 'javascript:try{DynamixListener.'
                             */
                            console.log("Received Message : " + msg);
                            if ((msg.indexOf("javascript:try{Dynamix.") != -1) || (msg
                                    .indexOf("javascript:try{DynamixListener.") != -1)) {
                                setTimeout(
                                    function() {
                                        try {
                                            // Eval the message JavaScript
                                            // command
                                            var t = eval(unescape(msg));
                                        } catch (e) {
                                            console
                                                .log("Dynamix.eventLoop: Error handling command: " + msg + " | Exception was: " + e);
                                        }
                                    }, 1);
                                setTimeout(Dynamix.eventLoop, 1);
                            } else {
                                console
                                    .log("Dynamix.eventLoop Security Error: Detected non-Dynamix JavaScript call.  Stopping eventLoops.");
                                Dynamix.unbind();
                                return;
                            }
                        }

                        /*
                         * If there are no events to send, Dynamix will send us HTTP
                         * 404 (to prevent XHR from timing out).
                         */
                        else if (xmlhttp.status == 404) {
                            setTimeout(Dynamix.eventLoop, 10);
                        }

                        // Handle security error
                        else if (xmlhttp.status == 403) {
                            console.log("Dynamix.eventLoop Error: Invalid token. ");
                            if (!Dynamix.bound) {
                                Dynamix.unbind();
                                return;
                            }
                        }

                        // Handle server is stopping
                        else if (xmlhttp.status == 503) {
                            console
                                .log("Dynamix.eventLoop Error: Service unavailable.");
                            if (!Dynamix.bound) {
                                Dynamix.unbind();
                                return;
                            }
                        }

                        // Handle bad request
                        else if (xmlhttp.status == 400) {
                            console.log("Dynamix.eventLoop Error: Bad request..");
                            if (!Dynamix.bound) {
                                Dynamix.unbind();
                                return;
                            }
                        }

                        // Finally, handle error
                        else {
                            console.log("Dynamix.eventLoop Error: Request failed.");
                            /*
                             * Don't unbind here, since we may be unloading the
                             * page, and we want to keep our token valid for
                             * subsequent Dynamix-enabled pages.
                             */
                            // Dynamix.unbind();
                        }
                    }
                };

                // Connect to the Dynamix event callback
                xmlhttp.open("GET", Dynamix.base_url + ":" + Dynamix.port + "/eventcallback", true);
                xmlhttp.setRequestHeader("Authorization", Dynamix.token);
                xmlhttp.send();
            } else {
                console
                    .log("Dynamix.eventLoop: Dynamix Not Bound.... exiting event loop");
            }
        },

        // setCookie
        setCookie: function(c_name, value, exdays) {
            var exdate = new Date();
            exdate.setDate(exdate.getDate() + exdays);
            var c_value = encodeURI(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
            document.cookie = c_name + "=" + c_value;
        },

        // getCookie
        getCookie: function(c_name) {
            var i, x, y, ARRcookies = document.cookie.split(";");
            for (i = 0; i < ARRcookies.length; i++) {
                x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
                y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
                x = x.replace(/^\s+|\s+$/g, "");
                if (x == c_name) {
                    return decodeURI(y);
                }
            }
        },

        // getBooleanFromResponse
        getBooleanFromResponse: function(xmlhttp) {
            if (xmlhttp.status == 200) {
                var string = xmlhttp.responseText;
                // Convert 'true' or 'false' strings from the response text
                switch (string.toLowerCase()) {
                    case "true":
                        return true;
                    case "yes":
                        return true;
                    case "1":
                        return true;
                    case "false":
                        return false;
                    case "no":
                        return false;
                    case "0":
                        return false;
                    case null:
                        return false;
                    default:
                        return Boolean(string);
                }
            } else
                return false;
        },

        // parameterizeResult
        parameterizeResult: function(xmlhttp) {
            var nvPairs = decodeURIComponent(xmlhttp.responseText).split(",");
            if (xmlhttp.status == 200) {
                if (nvPairs[0] == Dynamix.SUCCESS) {
                    return new Dynamix.Result(true, nvPairs[0], nvPairs[1]);
                } else {
                    return new Dynamix.Result(false, nvPairs[0], nvPairs[1]);
                }
            } else {
                console.log("HTTP Error: " + xmlhttp.status);
                return new Dynamix.Result(false, Dynamix.HTTP_ERROR, "HTTP Error: " + xmlhttp.status);
            }

        },

        // parameterizeIdResult
        parameterizeIdResult: function(xmlhttp) {
            var nvPairs = decodeURIComponent(xmlhttp.responseText).split(",");
            if (xmlhttp.status === 200) {
                if (nvPairs[0] == Dynamix.SUCCESS) {
                    return new Dynamix.IdResult(true, nvPairs[0], nvPairs[1],
                        xmlhttp.responseText);
                } else {
                    return new Dynamix.IdResult(false, nvPairs[0], nvPairs[1],
                        null);
                }

            } else {
                console.log("HTTP Error: " + xmlhttp.status);
                return new Dynamix.IdResult(false, Dynamix.HTTP_ERROR,
                    "HTTP Error: " + xmlhttp.status,
                    null);
            }

        },

        parameterizeContextSupportInfoResult: function(xmlhttp) {
            /*
             * Note: don't use 'decodeURIComponent' yet, since the JSON may include
             * commas.
             */
            var nvPairs = xmlhttp.responseText.split(",");
            if (xmlhttp.status === 200) {
                if (nvPairs[0] == Dynamix.SUCCESS) {

                    try {
                        return new Dynamix.ContextSupportInfoResult(
                            true,
                            nvPairs[0],
                            "SUCCESS",
                            Dynamix
                            .convertToJsonObject(decodeURIComponent(nvPairs[1])));
                    } catch (e) {
                        console.log("Could not parse: " + nvPairs[1] + " | Exception was: " + e);
                        return new Dynamix.ContextSupportInfoResult(false,
                            Dynamix.JSON_ERROR, e);
                    }

                } else {
                    return new Dynamix.ContextSupportInfoResult(false, nvPairs[0],
                        nvPairs[1]);
                }

            } else {
                console.log("HTTP Error: " + xmlhttp.status);
                return new Dynamix.ContextSupportInfoResult(false,
                    Dynamix.HTTP_ERROR, "HTTP Error: " + xmlhttp.status);
            }

        },

        // parameterizeContextPluginInfoResult
        parameterizeContextPluginInfoResult: function(xmlhttp) {
            /*
             * Note: don't use 'decodeURIComponent' yet, since the JSON may include
             * commas.
             */
            console.log("parameterizeContextPluginInfoResult:" + xmlhttp.responseText);
            var nvPairs = xmlhttp.responseText.split(",");
            if (xmlhttp.status === 200) {
                if (nvPairs[0] == Dynamix.SUCCESS) {
                    try {
                        return new Dynamix.ContextPluginInfoResult(
                            true,
                            nvPairs[0],
                            "SUCCESS",
                            Dynamix
                            .convertToJsonObject(decodeURIComponent(nvPairs[1])));
                    } catch (e) {
                        console.log("Could not parse JSON, Exception was: " + e);
                        return new Dynamix.ContextPluginInfoResult(false,
                            Dynamix.JSON_ERROR, e);
                    }

                } else {
                    return new Dynamix.ContextPluginInfoResult(false, nvPairs[0],
                        nvPairs[1]);
                }

            } else {
                console.log("HTTP Error: " + xmlhttp.status);
                return new Dynamix.ContextPluginInfoResult(false,
                    Dynamix.HTTP_ERROR, "HTTP Error: " + xmlhttp.status);
            }
        },

        /**
		* Generates random guids for the callbacks, listeners and handlers to map to.
		  @private
		**/
        generateGuid: function() {
            function _p8(s) {
                var p = (Math.random().toString(16) + "000000000").substr(2, 8);
                return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
            }
            return _p8() + _p8(true) + _p8(true) + _p8();
        }
    };

    /**
     * Setup cross-platform unload handling that removes the Dynamix listener
     * automatically when the user navigates away from the page. See:
     * http://stackoverflow.com/questions/8508987/webkit-chrome-or-safary-way-doing-ajax-safely-on-onunload-onbeforeunload
     * @private
     */
    // Browser detection
    var Browser = {
        IE: !!(window.attachEvent && !window.opera),
        Opera: !!window.opera,
        WebKit: navigator.userAgent.indexOf('AppleWebKit/') > -1,
        Gecko: navigator.userAgent.indexOf('Gecko') > -1 && navigator.userAgent.indexOf('KHTML') == -1,
        MobileSafari: !!navigator.userAgent.match(/Apple.*Mobile.*Safari/)
    };

    /**
     * Ensures the Ajax Get is performed... Asynchronously if possible or
     * Synchronously in WebKit Browsers (otherwise it'll most probably fail)
     * @private
     */
    function ensureAJAXGet(url, args) {
        var async = !Browser.WebKit;
        var finalUrl = url;
        var sep = "";
        for (var key in args) {
            sep = (sep == "?") ? "&" : "?";
            finalUrl = finalUrl + sep + encodeURIComponent(key) + "=" + encodeURIComponent(args[key]);
        }
        var req = new XMLHttpRequest();
        req.open("GET", finalUrl, async);
        req.send();
        return req;
    }
}

/**
 * Sets up an unload function for all browsers to work (onunload or
 * onbeforeunload)
 * @private
 */
function onUnload(func) {
    if (Browser.WebKit) {
        window.onbeforeunload = func;
    } else {
        window.onunload = func;
    }
}

/**
 * Handle unload.
 * @private
 */
function unload() {
    if (true) {
        console.log("Page Unload... Dynamix unbind requested");
        Dynamix.unbind();
    }
}

/**
 * Handle unload.
 * @private
 */
window.onload = function() {
    console.log("setting unload function");
    onUnload(function() {
        unload();
    });
}

/**
 *  @private
 * @fileoverview
 * The DynamixListener methods are called internally by the Dynamix Framework,
 * these methods then fire the relevant callback and listener methods that were
 * provided by the web client. The web client does not need to use the
 * DynamixListener methods directly.
 **/
if (typeof DynamixListener === "undefined") {

    /**
	 @namespace DynamixListener
     @private
     **/
    var DynamixListener = {

        /**
         * Called after the web client successfully binds itself with the Dynamix Framework.
         * This is turn raises the listener provided by the web client while making a bind request.
         * The web client after this can successfully open a session with Dynamix.
         */
        onDynamixFrameworkBound: function() {
            Dynamix.Listeners['bind-state-listener'](Dynamix.Enums.BOUND);
        },

        /**
         * Called after the web client loses connection to Dynamix. Raised in
         * response to 'Dynamix.unbind()' or Dynamix Framework initiated unbinds.
         * This is turn raises the listener provided by the web client while making a bind request.
         * The web client can no more open sessions with Dynamix before binding again.
         **/
        onDynamixFrameworkUnbound: function() {
            console.log("onDynamixFrameworkUnbound");
            Dynamix.Listeners['bind-state-listener'](Dynamix.Enums.UNBOUND);
        },

        /**
         * Called if no connection can be established to Dynamix. Note that it is
         * NOT possible to interact with Dynamix if this event is raised.
         */
        onDynamixFrameworkBindError: function(result) {
            console.log("onDynamixFrameworkBindError");
            Dynamix.Listeners['bind-state-listener'](Dynamix.Enums.BIND_ERROR);
        },


        /**
         * Called when Dynamix is waiting for the user to approve security
         * authorization for the web client. Note that it is impossible to interact
         * with Dynamix until the 'onSecurityAuthorizationGranted' event is raised,
         * which may take some time, since the user is responsible for approving web
         * application authorization.
         **/
        onAwaitingSecurityAuthorization: function() {
            console.log("onAwaitingSecurityAuthorization");
        },

        /**
         * Called after the user grants the web client security authorization. This
         * event is followed by 'DynamixListener.onSessionOpened'.
         **/
        onSecurityAuthorizationGranted: function(id) {
            console.log("onSecurityAuthorizationGranted : " + id);
        },

        /**
         * Called if the user revokes the web client's security authorization. This
         * event is followed by 'DynamixListener.onContextSupportRemoved' for any
         * existing context support, and then 'DynamixListener.onSessionClosed'.
         * possibly
         **/
        onSecurityAuthorizationRevoked: function() {
            console.log("onSecurityAuthorizationRevoked");
        },

        /**
         * Called when the web client's session has opened.
         * This in turn calls the listener provided by the web client when opening a session.
         * The web client needs to open a session after it is successfully
         * bound with Dynamix. The client can then create a handler using
         * which it can make context requests to the Dynamix Framework.
         *
         * NOTE : This will be automatically called after the security
         * authorization is granted by the user (if required).
         **/
        onSessionOpened: function(listenerId, sessionId) {
            console.log("onSessionOpened");
            Dynamix.Listeners[listenerId](
                Dynamix.Enums.SESSION_OPENED);
        },

        /**
         * Called when the web client's Dynamix session has closed. This in turn will
         * raise the session listener provided by the web client when opening a new Session.
         *
         * After this event the web client cannot make requests to the Dynamix Framework except
         * apart from unbinding or opening new sessions.
         **/
        onSessionClosed: function(listenerId) {
            console.log("onSessionClosed");
            Dynamix.Listeners[listenerId](
                Dynamix.Enums.SESSION_CLOSED);
        },

        /**
         * Called when the session is successfully opened and raises
         * the callback provided by the web client when opening a Session.
         **/
        onSessionCallbackSuccess: function(callbackId) {
            console.log("onSessionCallbackSuccess");
            Dynamix.Callbacks[callbackId](
                Dynamix.Enums.SUCCESS);
        },

        /**
         * Called when the Dynamix Framework becomes active.
         **/
        onDynamixFrameworkActive: function() {
            console.log("onDynamixFrameworkActive");
        },

        /**
         * Called when the Dynamix Framework becomes inactive.
         */
        onDynamixFrameworkInactive: function() {
            console.log("onDynamixFrameworkInactive");
        },

        /**
         * Raised when a handler is successfully created and in turn
         * provides a new handler object to the callback provided by the web client
         * when creating a new context handler.
         **/
        onContextHandlerCallbackSuccess: function(callbackId, contextHandlerId) {
            try {
                console.log("new Handler successfully created with id : " + contextHandlerId);
                var handler = new Dynamix.handler(
                    contextHandlerId);
                Dynamix.Handlers[contextHandlerId] = handler;
                Dynamix.Callbacks[callbackId](
                    Dynamix.Enums.SUCCESS, handler);
            } catch (e) {
                console.log(" Couldnt pass newly created handler to callback :" + e);
            }
        },

        /**
         * The following onContextSupportCallback* methods in turn raise the callback that
         * was provided while adding the context support.
         **/

        /**
         * Called when the context support requested by the web client was added successfully.
         **/
        onContextSupportCallbackSuccess: function(callbackId, result) {
            console.log('onContextSupportCallbackSuccess');
            Dynamix.Callbacks[callbackId](
                Dynamix.Enums.SUCCESS, convertToJsonObject(result));
        },

        /**
         * Called when the context support requested by the web client was added successfully.
         **/
        onContextSupportCallbackWarning: function(callbackId, result) {
            Dynamix.Callbacks[callbackId](
                Dynamix.Enums.WARNING, convertToJsonObject(result));
        },

        /**
         * Called when the context support requested by the web client failed.
         **/
        onContextSupportCallbackFailure: function(callbackId, result) {
            Dynamix.Callbacks[callbackId](
                Dynamix.Enums.FAILURE, convertToJsonObject(result));
        },

        /** 
         * Called when a plugin installation is in progress with the %age progress.
         **/
        onContextSupportCallbackProgress: function(callbackId, result) {
            Dynamix.Callbacks[callbackId](
                Dynamix.Enums.INSTALL_PROGRESS, progress);
        },

        onCallbackFailure: function(callbackId, result) {
            Dynamix.Callbacks[callbackId](
                Dynamix.Enums.FAILURE, convertToJsonObject(result));
        },

        /**
         * Called when a new context result is received from the Dynamix Framework.
         * The result is passed to the listener that was provided by the web client
         * while adding the context support.
         **/
        onContextResult: function(listenerId, result) {
            Dynamix.Listeners[listenerId](
                Dynamix.Enums.PLUGIN_RESULT, convertToJsonObject(result));
        },

        /** 
         * Called when a plugin is enabled. The result
         * is passed on to the listener that was provided by the web client while
         * opening a new session with Dynamix.
         * Refer to with {@link Dynamix~openDynamixSession}.
         **/
        onContextPluginEnabled: function(listenerId, result) {
            Dynamix.Listeners[listenerId](
                Dynamix.Enums.PLUGIN_ENABLED, convertToJsonObject(result))
        },

        /** 
         * Called when a plugin is disabled. The result
         * is passed on to the listener that was provided by the web client while
         * opening a new session with Dynamix.
         **/
        onContextPluginDisabled: function(listenerId, result) {
            Dynamix.Listeners[listenerId](
                Dynamix.Enums.PLUGIN_DISABLED, convertToJsonObject(result));
        },

        /**
         * Called when a plugin installation requested by the web client fails.
         **/
        onContextPluginInstallFailed: function(plugin, message) {
            console.log();
        },

        /**
         * Called when a plugin is successfully installed. This in turn sends the details of the
         * installed plugin to the listener provided by the web client
         * while opening a new session with Dynamix
         **/
        onContextPluginInstalled: function(listenerId, result) {
            Dynamix.Listeners[listenerId](
                Dynamix.Enums.PLUGIN_INSTALLED, convertToJsonObject(result));
        },

        /**
         * Called when a plugin is successfully uninstalled. This in turn sends the details of the
         * uninstalled plugin to the listener provided by the web client
         * while opening a new Dynamix Session.
         **/
        onContextPluginUninstalled: function(listenerId, result) {
            Dynamix.Listeners[listenerId](
                Dynamix.Enums.PLUGIN_UNINSTALLED, convertToJsonObject(result));
        },

        /**
         * Called when an error occurs with the plugin. This in turn sends the details of the
         * error to the listener provided by the web client
         * while opening a new Dynamix Session.
         **/
        onContextPluginError: function(callbackId, result) {
            Dynamix.Listeners[callbackId](
                Dynamix.Enums.PLUGIN_ERROR, convertToJsonObject(result));
        },

        /**
         * Called when a context request made by the web client is successful. Raises the callback
         * that was provided while making the context request with the relevant result.
         **/
        onContextRequestCallbackSuccess: function(callbackId, result) {
            console.log("onContextRequestCallbackSuccess");
            try {
                Dynamix.Callbacks[callbackId](Dynamix.Enums.SUCCESS, convertToJsonObject(result));
            } catch (e) {
                console.log(e);
            }
        },

        /**
         * Called when a context request made by the web client is unsuccessful. Raises the callback
         * that was provided while making the context request with the relevant error message.
         **/
        onContextRequestCallbackFailure: function(callbackId, result) {
            Dynamix.Callbacks[callbackId](
                Dynamix.Enums.Failure, convertToJsonObject(result));
        },

        /**
         * Called when the Dynamix Framework starts discovering plugins.
         **/
        onContextPluginDiscoveryStarted: function(listenerId) {
            Dynamix.Listeners[listenerId](Dynamix.Enums.PLUGIN_DISCOVERY_STARTED);
        },

        /**
         * Called when the Dynamix Framework finishes discovering plugins.
         **/
        onContextPluginDiscoveryFinished: function(listenerId, result) {
            Dynamix.Listeners[listenerId](Dynamix.Enums.PLUGIN_DISCOVERY_FINISHED,
                convertToJsonObject(result));
        }
    };

    var convertToJsonObject = function(json) {
        // Perform type checking
        if (typeof(json) == "string") {
            /*
             * The incoming json is a string, so simply try to parse it.
             */
            return JSON.parse(json);
        } else {
            /*
             * The incoming json is not a string, so try to stringify it before
             * parsing.
             */
            return JSON.parse(JSON.stringify(json));
        }
    };
}