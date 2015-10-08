clearInterval(window.botbotInterval);
clearInterval(window.botbotKnights);
clearInterval(window.botbotCounter);
window.botbot = (function(){
    var version = "0.0.5", counter = 0;

    var messages = {
        welcome: "Welcome to the battle @! You have been assigned the #-team. Fight!",
        sorry: "Sorry, Sir @, I don't know the answer for that.",
        noIdea: "I don't know! But what I do now, is that we're in the middle of a war!",
        length: "The war has been on for " + counter + " seconds.",
        history: "A long time ago. The two nations, red and blue, decided that they did not like one another. So as any sane person would do, they declared war against eachother.",
        stats: "#-team seems to be winning."
    }, questions = [
        "length",
        "history",
        "stats"
    ], knights = {red: {}, blue: {}}, lastMessage = $(".message:last-child"), interval = 275;

    var sendMessage = (function(message){
        $("#message-textarea").val("Botbot: " + message);
        $(".message-form").submit();
    }), bot = function(){
        if(lastMessage != $(".message:last-child")){
            var rawText = $(".message:last-child").html().replace(/\<.*\>/, ""),
                asker = $(".message:last-child").html().replace(/(<.*>)(.*)(<.*>)(.*)/, "$2");

            asker = asker.charAt(0).toUpperCase() + asker.slice(1);

            if($(lastMessage).hasClass("message-info")){
                var username = asker.split(" ")[0], team = (~~(Math.random() * 2) ? "red" : "blue");
                knights[team][username] = {hp: 100, def: 75};
                sendMessage(messages.welcome.replace("@", username).replace("#", team));
            }else if(rawText.indexOf("!botbot") == 0){
                var text = $(".message:last-child").html().replace(/\<.*\>/, "").substr(7, $(".message:last-child").html().replace(/\<.*\>/, "").length).toLowerCase(),
                    foundAnswer = false;

                for(var i in questions){
                    if(text.indexOf(questions[i].toLowerCase()) > -1){
                        var red = 0, blue = 0;
                        if(questions[i] == "stats"){
                            for(var knight in knights["red"]) blue += knight.hp;
                            for(var knight in knights["blue"]) red += knight.hp;
                        }
                        sendMessage(messages[questions[i]].replace("@", asker).replace("#", (red < blue ? "red" : "blue")));
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
                        console.log(splitText, knight);

                        sendMessage("Attacking " + splitText[2] + "!");
                        var lostHp = ~~(Math.random() * ((knight.hp - knight.def) + knight.hp));
                        if(knight.def <= 0){
                            knight.hp -= lostHp;
                            sendMessage(splitText[2] + " lost " + lostHp + "HP. [HP: " + knight.hp + ", DEF: " + knight.def + "]");
                        }else{
                            knight.def -= lostHp;
                            sendMessage(splitText[2] + " lost " + lostHp + "DEF. [HP: " + knight.hp + ", DEF: " + knight.def + "]");
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
            lastMessage = $(".message:last-child");
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
            if(found) break;
            var team = (~~(Math.random() * 2) ? "red" : "blue");
            knights[team][toBeKnights[i]] = {hp: 100, def: 75};
            sendMessage(toBeKnights[i] + ", you have been assigned to the " + team + "-team. Fight!");
        }
    };

    var init = function(obj){
        if(window.botbotInterval != undefined || window.botbotCounter != undefined || window.botbotKnights != undefined){
            console.log("Botbot is already running!\r\nPlease kill it before running another.");
            return false;
        }

        window.botbotInterval = undefined;
        window.botbotKnights = undefined;
        window.botbotCounter = undefined;

        if(typeof obj == "object"){
            for(var i in obj) messages[i] = obj[i];
        }

        window.botbotInterval = setInterval(bot, interval);
        window.botbotKnights = setInterval(findKnights, 2500);
        window.botbotCounter = setInterval(function(){ counter++ }, 1000);
        sendMessage("The battle has begun!");
        console.log("The battle has begun!");
    }, pause = function(){
        clearInterval(window.botbotInterval);
        clearInterval(window.botbotKnights);
        clearInterval(window.botbotCounter);
        sendMessage("A truce has been called, stop the battle!");
        console.log("A truce has been called, stop the battle!");
    }, resume = function(){
        window.botbotInterval = setInterval(bot, interval);
        window.botbotKnights = setInterval(findKnights, 2500);
        window.botbotCounter = setInterval(function(){ counter++ }, 1000);
        sendMessage("The battle has been resumed. Carry on, knights!");
        console.log("The battle has been resumed. Carry on, knights!");
    }, kill = function(){
        clearInterval(window.botbotInterval);
        clearInterval(window.botbotKnights);
        clearInterval(window.botbotCounter);
        botbot = undefined;
        window.botbotInterval = undefined;
        window.botbotKnights = undefined;
        window.botbotCounter = undefined;

        var red = 0, blue = 0;
        for(var knight in knights["red"]) blue += knight.hp;
        for(var knight in knights["blue"]) red += knight.hp;

        sendMessage("The battle has ended. And " + (red < blue ? "red" : "blue") + "-team won!");
        console.log("The battle has ended. And " + (red < blue ? "red" : "blue") + "-team won!");
    };

    return {
        init: init,
        pause: pause,
        resume: resume,
        kill: kill,
        version: version
    }
}());
