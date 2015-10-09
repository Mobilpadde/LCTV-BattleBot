window.battlebot = (function(){
    var version = "0.0.8", counter = 0;
    /*
    # = team
    @ = username
    € = time
    */

    var messages = {
        welcome: "Greetings @! You have been assigned the #-team. Fight!",
        sorry: "Sorry, Sir @, I don't know the answer for that.",
        noIdea: "I don't know! But what I do now, is that we're in the middle of a war!",
        length: "The war has been on for € seconds.",
        history: "A long time ago. The two nations, red and blue, decided that they did not like one another. So as any sane person would do, they declared war against eachother.",
        stats: "#-team seems to be winning.",
        dead: "Hey, @! A skeleton do not talk!"
    }, questions = [
        "length",
        "history",
        "stats"
    ], knights = {red: {}, blue: {}}, lastMessage = $(".message:last-child"), interval = 275;

    var sendMessage = (function(message){
        $("#message-textarea").val("battlebot: " + message);
        $(".message-form").submit();
    }), selectTeam = function(user){
        var team;
        if(Object.keys(knights["red"]).length == Object.keys(knights["blue"]).length){
            team = (~~(Math.random() * 2) ? "red" : "blue");
        }else if(Object.keys(knights["red"]).length < Object.keys(knights["blue"]).length){
            team = "red";
        }else team = "blue";

        knights[team][user] = {hp: 100, def: 75};

        user = user.charAt(0).toUpperCase() + user.slice(1);
        sendMessage(messages.welcome.replace("@", user).replace("#", team));
    }, bot = function(){
        if(lastMessage != $(".message:last-child")){
            var rawText = $(".message:last-child").html().replace(/\<.*\>/, ""),
                asker = $(".message:last-child").html().replace(/(<.*>)(.*)(<.*>)(.*)/, "$2");

            asker = asker.charAt(0).toUpperCase() + asker.slice(1);

            if($(lastMessage).hasClass("message-info")){
                var username = asker.split(" ")[0];
                selectTeam(username);
            }else if(rawText.indexOf("!battlebot") == 0){
                var text = $(".message:last-child").html().replace(/\<.*\>/, "").substr(7, $(".message:last-child").html().replace(/\<.*\>/, "").length).toLowerCase(),
                    foundAnswer = false;

                for(var i in questions){
                    if(text.indexOf(questions[i].toLowerCase()) > -1){
                        var red = 0, blue = 0;
                        if(questions[i] == "stats"){
                            for(var knight in knights["red"]) blue += knight.hp;
                            for(var knight in knights["blue"]) red += knight.hp;

                            red /= Object.keys(knights["red"]).length;
                            blue /= Object.keys(knights["blue"]).length;
                        }
                        sendMessage(messages[questions[i]].replace("@", asker).replace("€", counter).replace("#", (red > blue ? "red" : "blue")));
                        foundAnswer = true;
                        break;
                    }
                }

                if(!foundAnswer && text.indexOf("attack") > -1){
                    var splitText = text.split(" ");
                    if(splitText.length > 2){
                        var knight;
                        if(knights["red"].hasOwnProperty(splitText[2])){
                            knight = knights["red"][splitText[2]];
                        }else if(knights["blue"].hasOwnProperty(splitText[2])){
                            knight = knights["blue"][splitText[2]];
                        }
                        console.log(splitText, knight, knight == undefined);

                        sendMessage("Attacking " + splitText[2] + "!");
                        var lostHp = ~~(Math.random() * ((knight.hp - knight.def) + knight.hp));
                        if(knight.def <= 0){
                            knight.hp -= lostHp;
                            sendMessage(splitText[2] + " lost " + lostHp + "HP. [HP: " + knight.hp + ", DEF: " + knight.def + "]");
                        }else{
                            var prevDef = knight.def;
                            knight.def -= lostHp;
                            if(knight.def < 0){
                                knight.def = 0;
                                knight.hp -= lostHp - prevDef;
                                sendMessage(splitText[2] + " lost " + prevDef + "DEF and " + (lostHp - prevDef) + "HP. [HP: " + knight.hp + ", DEF: 0]");
                            }else{
                                sendMessage(splitText[2] + " lost " + lostHp + "DEF. [HP: " + knight.hp + ", DEF: " + knight.def + "]");
                            }
                        }
                    }else{
                        sendMessage("No such knight exists.");
                    }
                }
                else if(!foundAnswer && text.indexOf("help") > -1){
                    var commands = "My commands are: ";
                    for(var i in questions){
                        commands += " " + questions[i] + ",";
                    }
                    commands = commands.substr(0, commands.length - 1);
                    commands += " and help.";

                    sendMessage(commands);
                    foundAnswer = true;
                }
                else if(!foundAnswer && text.indexOf("?") > -1) sendMessage(messages.sorry.replace("@", asker));
                else if(!foundAnswer) sendMessage(messages.noIdea);
            }

            var found = false, hp = 10;
            if(knights["red"].hasOwnProperty(asker)){ found = true; hp = knights["red"][asker.toLowerCase()].hp; }
            if(knights["blue"].hasOwnProperty(asker)){ found = true; hp = knights["blue"][asker.toLowerCase()].hp; }
            if(found && hp <= 0) sendMessage(messages.dead.replace("@", asker));
            lastMessage = $(".message:last-child");
        }
    }, regenHp = function(){
        for(var o in knights["red"]){
            if(knights["red"][o].hp < 45) knights["red"][o].hp += 1;
        }
        for(var o in knights["blue"]){
            if(knights["blue"][o].hp < 45) knights["blue"][o].hp += 1;
        }
    }, findKnights = function(){
        var toBe = $(".roster-pane .user"), toBeKnights = [];
        toBe.each(function(i){
            toBeKnights[i] = toBe[i].dataset.nick;
        });

        for(var i in toBeKnights){
            var found = false;
            if(knights["red"].hasOwnProperty(toBeKnights[i])) found = true;
            if(knights["blue"].hasOwnProperty(toBeKnights[i])) found = true;
            if(found) continue;
            selectTeam(toBeKnights[i]);
        }
    };

    var init = function(obj){
        if(window.battlebotInterval != undefined || window.battlebotCounter != undefined || window.battlebotRegen != undefined){
            console.log("Battlebot is already running!\r\nPlease kill it before running another.");
            return false;
        }

        if(typeof obj == "object"){
            for(var i in obj) messages[i] = obj[i];
        }

        findKnights();

        window.battlebotInterval = setInterval(bot, interval);
        window.battlebotRegen = setInterval(regenHp, 60 * 5 * 1000);
        window.battlebotCounter = setInterval(function(){ counter++ }, 1000);

        sendMessage("The battle has begun!");
        console.log("The battle has begun!");
    }, pause = function(){
        clearInterval(window.battlebotInterval);
        clearInterval(window.battlebotRegen);
        clearInterval(window.battlebotCounter);

        sendMessage("A truce has been called, stop the battle!");
        console.log("A truce has been called, stop the battle!");
    }, resume = function(){
        window.battlebotInterval = setInterval(bot, interval);
        window.battlebotCounter = setInterval(function(){ counter++ }, 1000);
        window.battlebotRegen = setInterval(regenHp, 60 * 5 * 1000);

        sendMessage("The battle has been resumed. Carry on, knights!");
        console.log("The battle has been resumed. Carry on, knights!");
    }, kill = function(){
        clearInterval(window.battlebotInterval);
        clearInterval(window.battlebotRegen);
        clearInterval(window.battlebotCounter);

        window.battlebot = undefined;
        window.battlebotInterval = undefined;
        window.battlebotRegen = undefined;
        window.battlebotCounter = undefined;

        var red = 0, blue = 0;
        for(var knight in knights["red"]) blue += knights["red"][knight].hp;
        for(var knight in knights["blue"]) red += knights["blue"][knight].hp;

        red /= Object.keys(knights["red"]).length;
        blue /= Object.keys(knights["blue"]).length;

        var winner = "The battle has ended. " + (red == blue ? "It's a tie between red and blue!" : "The " + (red > blue ? "red" : "blue") + "-team won!");
        sendMessage(winner);
        console.log(winner);
    };

    return {
        init: init,
        pause: pause,
        resume: resume,
        kill: kill,
        version: version
    }
}());
