var ticketErrorCallback = function () {
    alert('ticketErrorCallback error');
};

var jiveAuthorizeUrlErrorCallback = function () {
    alert('jiveAuthorizeUrlErrorCallback error');
};

var preOauth2DanceCallback = function () {
    $("#j-card-authentication").show();
    $("#j-card-action").hide();
    gadgets.window.adjustHeight(400);

    var config = onLoadContext['config'];

    if (typeof config === 'string') {
        config = JSON.parse(config);
    }
    debugger;
    $("#repoA").text(config.repo);
    $("#issueA").text(config.number);
    $("#labelsA").empty();
    config.labels.forEach(function(label){
        $("#labelsA").append('<span style="color:#'+label.color+'">'+label.name+'</span>,&nbsp;');
    });
    $("#GitHubLinkA").attr("href", config.url);
    $("#GitHubLinkA").text(config.title);
};

var onLoadCallback = function (config, identifiers) {
    onLoadContext = {
        config: config,
        identifiers: identifiers
    };
};
function populateCommentsTable(host, ticketID, repository, issueNumber) {
    // get the data ...
    var bodyPayload = { body: ""};

    osapi.http.get({
        'href': host + '/example-github/comments?' +
            'id=all' + // hack job to get us to act different that the one and only other GET we make ...
            "&ts=" + new Date().getTime() +
            "&ticketID=" + ticketID +
            "&repo=" + repository +
            "&number=" + issueNumber,
        headers: { 'Content-Type': ['application/json'] },
        'noCache': true,
        'authz': 'signed'
    }).execute(function (response) {
        if (response.status >= 400 && response.status <= 599) {
            alert("ERROR (get comments)!" + JSON.stringify(response.content));
        } else {
            var items = [];
            var body = response.content;
            var json = JSON.parse(response.content);
            console.log("number of comments=" + json.length);

            if (json && json.length) {
                var count = json.length;
                json.forEach(function (comment) {
                    if (count-- <= 5) {
                        var d = new Date(comment.updated_at);
                        var dt = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " "
                            + d.getHours() + ":" + d.getMinutes();
                        items.push('<tr><td>&nbsp' + comment.body + '&nbsp</td><td>&nbsp' + comment.user.login +
                            '&nbsp</td><td>&nbsp' + dt + '&nbsp</td></tr>');
                    }
                });
            } else {
                items.push('<tr><td>---</td><td>---</td><td>---</td></tr>');
            }
            $("#comments-table tr").remove();
            $("#comments-table").append(items.join(''));

            gadgets.window.adjustHeight();
        }
    });
}

function doIt(host) {
    var qTicketID;
    $("#btn_submitA").click(function () {
        jive.tile.close(null, {});
    });

    $("#btn_submitB").click(function () {
        // close the action window ...
        jive.tile.close(null, {});
    });

    $("#btn_close").click(function () {
        // close the issue
        var issue = $("#issueB").text();

        var config = onLoadContext['config'];
        if (typeof config === 'string') {
            config = JSON.parse(config);
        }

        var bodyPayload = {"state": "closed"};
        osapi.http.post({
            'href': host + '/example-github/changeIssueState?' +
                'id=' + qTicketID +
                "&ts=" + new Date().getTime() +
                "&ticketID=" + qTicketID +
                "&repo=" + config.repo +
                "&number=" + config.number +
                "&state=closed" ,
            headers: { 'Content-Type': ['application/json'] },
            'noCache': true,
            'authz': 'signed',
            'body': bodyPayload
        }).execute(function (response) {
            var config = onLoadContext['config'];

            //alert( "status=" + response.status) ;
            if (response.status >= 400 && response.status <= 599) {
                alert("ERROR (close)!" + JSON.stringify(response.content));
            }
            else {
                alert("GOOD (close)!" + JSON.stringify(response.content, null, 2));
            }
        });

        // and exit ....
        jive.tile.close(null, {});
    });  // end btn_close

    $("#btn_comment").click(function () {
        var comment = $("#comment").val();
        if (comment.length == 0) {
            // really need to trim up comment and such before doing all of this, but this is first pass!
            alert("can't post an empty comment");
            return;
        }


        var config = onLoadContext['config'];

        if (typeof config === 'string') {
            config = JSON.parse(config);
        }

        var bodyPayload = { newComment: comment};
        osapi.http.post({
            'href': host + '/example-github/newComment?' +
                'id=' + qTicketID +
                "&ts=" + new Date().getTime() +
                "&ticketID=" + qTicketID +
                "&repo=" + config.repo +
                "&number=" + config.number,
            headers: { 'Content-Type': ['application/json'] },
            'noCache': true,
            'authz': 'signed',
            'body': bodyPayload
        }).execute(function (response) {
            if (response.status >= 400 && response.status <= 599) {
                alert("ERROR (comment post)!" + JSON.stringify(response.content));
            }
            else {
                $("#comment").val("");       // clear out the comment ...
                populateCommentsTable(host, qTicketID, config.repo, config.number);
            }
        });
    }); // end btn_comment

    var oauth2SuccessCallback = function (ticketID) {
        // If we are here, we have been successfully authenticated and now can display some useful data ...
        $("#j-card-authentication").hide();
        $("#j-card-action").show();

        // how do we resize after adding stuff?
        gadgets.window.adjustHeight(700);  // do this here in case preOauth2DanceCallback wasn't called

        //debugger;
        var identifiers = jive.tile.getIdentifiers();
        var viewerID = identifiers['viewer'];   // user ID
        // handle the case of a callback with no ticketID passed .. this happens if
        // we verified that the viewer ID already has a valid token without doing the OAuth2 dance ...
        if (ticketID == undefined)    ticketID = viewerID;
        qTicketID = ticketID;       // save globally for comments, close, and other actions ....

        var config = onLoadContext['config'];

        if (typeof config === 'string') {
            config = JSON.parse(config);
        }

        $("#repoB").text(config.repo);
        $("#issueB").text(config.number);
        //    $("#labelsA").text(config.labels);
        $("#labelsB").empty();
        config.labels.forEach(function(label){
            $("#labelsB").append('<span style="color:#'+label.color+'">'+label.name+'</span>,&nbsp;');
        });
        $("#GitHubLinkB").attr("href", config.url);
        $("#GitHubLinkB").text(config.title);

        // note: the repository is actually the full org/repo path ...
        populateCommentsTable(host, ticketID, config.repo, config.number);

    }; // end OAuth2SuccessCallback ...

    // 'host' was defined, now replaced by a hardcoded one for now ...
    var options = {
        serviceHost: host,
        grantDOMElementID: '#oauth',
        ticketErrorCallback: ticketErrorCallback,
        jiveAuthorizeUrlErrorCallback: jiveAuthorizeUrlErrorCallback,
        oauth2SuccessCallback: oauth2SuccessCallback,
        preOauth2DanceCallback: preOauth2DanceCallback,
        onLoadCallback: onLoadCallback,
        authorizeUrl: host + '/example-github/oauth/authorizeUrl',
        ticketURL: '/example-github/oauth/isAuthenticated',
        extraAuthParams: {
            scope: 'user,repo'
        }
    };

    $("#btn_done").click(function () {
        console.log(onLoadContext);
    });

    //debugger;
    OAuth2ServerFlow(options).launch();
}
