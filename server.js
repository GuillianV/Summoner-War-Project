
//---------------Gestion des imports
let express = require("express")
let app = express()

let http = require("http");
let server = http.Server(app)

let socketio = require("socket.io")
let io = socketio(server)

const request = require('request');

let { Pool, Client } = require('pg');
const { forever } = require("request");
let apiurl = 'https://swarfarm.com';

app.use("/css", express.static(__dirname + "/css"))
app.use("/js", express.static(__dirname + "/js"))
app.use("/modules", express.static(__dirname + "/modules"))
app.use("/img", express.static(__dirname + "/img"))
app.use("/html", express.static(__dirname + "/html"))


app.get("/", (req, res) => {
    res.sendFile(__dirname + "/html/index.html")
})

app.get("/monster/:id?", (req, res) => {
    var id = req.params.id;
    console.log(id)
    res.sendFile(__dirname + "/html/monster.html")
})

//-----------------socket
io.on("connect", (socket) => {

    // console.log(socket.id +" is connected")

    socket.on("monsterSearch", (data) => {


        

        requestAllMonsters = []

        let baseStar = ""
        if(data.naturalStar >= 1 &&  data.naturalStar <= 5){
            baseStar = "&natural_stars="+data.naturalStar
        } 

        let name = ""
        if(VerifyingCarac(data.monsterName)){
            name = "&name="+data.monsterName
        }

        let element = ""
        if(data.element == "fire" || data.element == "water" || data.element == "wind" || data.element == "light" || data.element == "dark" ){
            element = "&element="+data.element
        }

        let archetype = ""
        if(data.archetype == "attack" || data.archetype == "defense" || data.archetype == "hp" || data.archetype == "support"){
            archetype = "&archetype="+data.archetype
        }


        loadMonsterRecursive(true,1)

        function loadMonsterRecursive(isNext, nbPage) {

            if (isNext != null) {
                request(apiurl + '/api/v2/monsters/?page=' + nbPage + baseStar + name + element + archetype, { json: true }, (err, res, body) => {
                    if (err) { return console.log(err); }

                    if(res.body.results != undefined || res.body.results != null){
                        res.body.results.forEach(monsterObj =>{
                            requestAllMonsters.push(monsterObj)
                        })
                        
                    }
                    loadMonsterRecursive(res.body.next, nbPage + 1)
                });
        
            }else{
                socket.emit("mosterData", requestAllMonsters)
            }
        
        }

        // while(res.body.next != null){
        //     request(apiurl + '/api/v2/monsters/?name=' + data.monsterName, { json: true }, (err, res, body) => {
        //         if (err) { return console.log(err); }
        //         socket.emit("mosterNameData", res.body.results)
        //     });
        // }
    })

    socket.on("monsterSkills", (data) => {

        let promiseSkills = data.idSkills.length
        let dataAllSkills = []

        data.idSkills.forEach(idskill => {
            request(apiurl + '/api/v2/skills/' + idskill, { json: true }, (err, res, body) => {
                if (err) { return console.log(err); }
                dataAllSkills.push(res.body)
                promiseSkills--
                if (promiseSkills == 0) {
                    console.log(dataAllSkills)
                    socket.emit("monsterSkillsData", dataAllSkills)
                }
            });
        });

    })



})


//-----------Verifie une chaine de caractere
function VerifyingCarac(string) {
    const regex = /[^\w\s]/g;
    if (string.length >= 255) {
        return false
    }
    for (c of string) {
        if (c.search(regex) == 0) {
            return false
        }
    }
    if (!string.replace(/\s/g, '').length) {
        return false
    }
    if (string == undefined || string == null) {
        return false
    }
    return true
}

server.listen(8848)