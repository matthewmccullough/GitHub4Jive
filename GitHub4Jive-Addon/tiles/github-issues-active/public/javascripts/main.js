var ticketErrorCallback = function() {
    alert('ticketErrorCallback error');
};

var jiveAuthorizeUrlErrorCallback = function() {
    alert('jiveAuthorizeUrlErrorCallback error');
};

var preOauth2DanceCallback = function() {
    $("#j-card-authentication").show();
    $("#j-card-configuration").hide();
    gadgets.window.adjustHeight(350);
};

var onLoadCallback = function( config, identifiers ) {
    onLoadContext = {
        config: config,
        identifiers : identifiers
    };
};

function doIt( host ) {
    var oauth2SuccessCallback = function(ticketID) {
        // do configuration
        $("#j-card-authentication").hide();
        $("#j-card-configuration").show();
        gadgets.window.adjustHeight(350);  // do this here in case the pre-auth callback above wasn't called

        var identifiers = jive.tile.getIdentifiers();
        var viewerID = identifiers['viewer'];   // user ID
        if (ticketID == undefined)    ticketID = viewerID;

        osapi.http.get({
            'href' : host + '/example-github/user/repos?' +
                'id=' + ticketID +
                "&ts=" + new Date().getTime() +
                "&ticketID=" + ticketID,
            //"&query=" + query,
            'format' : 'json',
            'authz': 'signed'
        }).execute(function( response ) {
            var config = onLoadContext['config'];
            if ( typeof config === "string" ) {
                config = JSON.parse(config);
            }

            var json = config || {
                "posting": "on"
            };
            var ticketErrorCallback = function() {
                alert('ticketErrorCallback error');
            };

            var jiveAuthorizeUrlErrorCallback = function() {
                alert('jiveAuthorizeUrlErrorCallback error');
            };

            var preOauth2DanceCallback = function() {
                $("#j-card-authentication").show();
                $("#j-card-configuration").hide();
                gadgets.window.adjustHeight(350);
            };

            var onLoadCallback = function( config, identifiers ) {
                onLoadContext = {
                    config: config,
                    identifiers : identifiers
                };
            };

            function doIt( host ) {
                var oauth2SuccessCallback = function(ticketID) {
                    // do configuration
                    $("#j-card-authentication").hide();
                    $("#j-card-configuration").show();
                    gadgets.window.adjustHeight(350);  // do this here in case the pre-auth callback above wasn't called

                    var identifiers = jive.tile.getIdentifiers();
                    var viewerID = identifiers['viewer'];   // user ID
                    if (ticketID == undefined)    ticketID = viewerID;

                    osapi.http.get({
                        'href' : host + '/example-github/user/repos?' +
                            'id=' + ticketID +
                            "&ts=" + new Date().getTime() +
                            "&ticketID=" + ticketID,
                        //"&query=" + query,
                        'format' : 'json',
                        'authz': 'signed'
                    }).execute(function( response ) {
                        var config = onLoadContext['config'];
                        if ( typeof config === "string" ) {
                            config = JSON.parse(config);
                        }

                        var json = config || {
                            "posting": "on"
                        };

                        // prepopulate the sequence input dialog
                        $("input[name=post_activity]").val([json["posting"]]);

                        var config = onLoadContext['config'];
                        if ( response.status >= 400 && response.status <= 599 ) {
                            alert("ERROR!" + JSON.stringify(response.content));
                        }
                        var data = response.content;
                        for (var i = 0; i < data.length; i++) {
                            var opt;

                            if (data[i].full_name == config['organization']) {
                                opt = "<option value=" + data[i].name + " selected>" + data[i].fullName +"</option>";
                            } else {
                                opt = "<option value=" + data[i].name + ">" + data[i].fullName +"</option>";
                            }
                            $("#repoList").append(opt);
                        }

                        $("#btn_submit").click( function() {
                            var status = $("input[name=post_activity]:checked").val();
                            var fullName = $("#repoList option:selected").text();
                            var parts = fullName.split("/");
                            var owner = parts[0];
                            var repoName = parts[1];
                            var fullName = $("#repoList option:selected").text();
                            var toReturn = {
                                "repoOwner" : owner,
                                "repoName" : repoName,
                                "repoFullName": fullName,
                                "isGitHub" : true,
                                "posting"  : status

                            };

                            console.log("toReturn", toReturn);
                            if ( ticketID ) {
                                toReturn['ticketID'] = ticketID;
                            }

                            jive.tile.close(toReturn);

                        });
                    });
                };

                var options = {
                    serviceHost : host,
                    grantDOMElementID : '#oauth',
                    ticketErrorCallback : ticketErrorCallback,
                    jiveAuthorizeUrlErrorCallback : jiveAuthorizeUrlErrorCallback,
                    oauth2SuccessCallback : oauth2SuccessCallback,
                    preOauth2DanceCallback : preOauth2DanceCallback,
                    onLoadCallback : onLoadCallback,
                    authorizeUrl : host + '/example-github/oauth/authorizeUrl',
                    ticketURL: '/example-github/oauth/isAuthenticated',
                    extraAuthParams: {
                        scope:'user,repo'
                    }
                };

                $("#btn_done").click( function() {
                    console.log(onLoadContext);
                });

                OAuth2ServerFlow( options ).launch();
            }
            // prepopulate the sequence input dialog
            $("input[name=post_activity]").val([json["posting"]]);

            var config = onLoadContext['config'];
            if ( response.status >= 400 && response.status <= 599 ) {
                alert("ERROR!" + JSON.stringify(response.content));
            }
            var data = response.content;
            for (var i = 0; i < data.length; i++) {
                var opt;

                if (data[i].full_name == config['organization']) {
                    opt = "<option value=" + data[i].name + " selected>" + data[i].fullName +"</option>";
                } else {
                    opt = "<option value=" + data[i].name + ">" + data[i].fullName +"</option>";
                }
                $("#repoList").append(opt);
            }

            $("#btn_submit").click( function() {
                var status = $("input[name=post_activity]:checked").val();
                var fullName = $("#repoList option:selected").text();
                var parts = fullName.split("/");
                var owner = parts[0];
                var repoName = parts[1];
                var fullName = $("#repoList option:selected").text();
                var toReturn = {
                    "repoOwner" : owner,
                    "repoName" : repoName,
                    "repoFullName": fullName,
                    "isGitHub" : true,
                    "posting"  : status

                    };

                console.log("toReturn", toReturn);
                if ( ticketID ) {
                    toReturn['ticketID'] = ticketID;
                }

                jive.tile.close(toReturn);

            });
        });
    };

    var options = {
        serviceHost : host,
        grantDOMElementID : '#oauth',
        ticketErrorCallback : ticketErrorCallback,
        jiveAuthorizeUrlErrorCallback : jiveAuthorizeUrlErrorCallback,
        oauth2SuccessCallback : oauth2SuccessCallback,
        preOauth2DanceCallback : preOauth2DanceCallback,
        onLoadCallback : onLoadCallback,
        authorizeUrl : host + '/example-github/oauth/authorizeUrl',
        ticketURL: '/example-github/oauth/isAuthenticated',
        extraAuthParams: {
            scope:'user,repo'
        }
    };

    $("#btn_done").click( function() {
        console.log(onLoadContext);
    });

    OAuth2ServerFlow( options ).launch();
}