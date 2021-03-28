document.addEventListener("DOMContentLoaded", () => {

    window.socket = io()

    let searchBar = document.querySelector('#inputShearchHome')
    let monsterContainer = document.querySelector('#SearchMonsterContainer')
    let skillContainer = document.querySelector('#ShowSkillContainer')
    let buttonShearchHome = document.querySelector('#buttonShearchHome')
    let showMonsterContainerSkills = document.querySelector(".showMonsterContainerSkills") 
    let showSkillContainerEffects = document.querySelector(".showSkillContainerEffects") 

    let popup = document.querySelector(".popup")
    let titlePop = document.querySelector(".popupTitre")
    let popupDescription = document.querySelector(".popupDescription")


    let body = document.querySelector("body")
    

    function emitSearch(){
        setTimeout(function(){
            window.socket.emit("monsterSearch", {
                monsterName: searchBar.value,
                naturalStar: slider.value,
                element : selectElemMonster.value,
                archetype : selectArchetype.value,
            })
        },500)
    }


    searchBar.addEventListener('input', function () {
        emitSearch()
    });

    var slider = document.getElementById("myRange");
    var slideOutput = document.getElementById("slideOutput");
    slideOutput.innerHTML = "all" // Natural Stars
    slider.oninput = function() {
        if(this.value == 6)
            slideOutput.innerHTML = "all"
        else
            slideOutput.innerHTML = this.value;
    }

    let selectElemMonster = document.getElementById("MonsterElement");
    let selectArchetype = document.getElementById("Archetype");


    //Valider la requette
    searchBar.addEventListener("keyup", function(event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
          // Cancel the default action, if needed
          event.preventDefault();
          // Trigger the button element with a click
          emitSearch()
        }
    });

    buttonShearchHome.addEventListener("click",function () {
        emitSearch()
    });

    socket.on("mosterData", (results) => {
    
        console.log(results)

        monsterContainer.innerHTML=""


        results.forEach(monster => {
            let myDiv = createDom("div",monsterContainer,"MonsterMainContainer")
            let myAnchor = createDom("a",myDiv,"anchorMonsterMain")
            myAnchor.href = "#showMonsterContainerTitle";
            myDiv.addEventListener("click",function(){
                showMonster(monster)
            })
            let myImg = createDom("img",myAnchor,"imgMonsterMain")
            myImg.src = "https://swarfarm.com/static/herders/images/monsters/"+monster.image_filename;
            let myName = createDom("div",myAnchor,"textMonsterMain")
            myName.innerHTML = monster.name
        });

    })



    function showMonster(monster){
        console.log(monster)
        document.querySelector("#showMonsterContainer").style.opacity = "1"

        document.querySelector("#idMonsterName").innerHTML = monster.name
        document.querySelector(".showMonsterImage img").src = "https://swarfarm.com/static/herders/images/monsters/"+monster.image_filename;
        document.querySelector("#idMonsterElement").innerHTML = monster.element
        document.querySelector("#idMonsterArchetype").innerHTML = monster.archetype
        document.querySelector("#idMonsterCanAwake").innerHTML = monster.can_awaken
        //Stats
        document.querySelector("#idMonsterHP").innerHTML = monster.max_lvl_hp
        document.querySelector("#idMonsterATT").innerHTML = monster.max_lvl_attack
        document.querySelector("#idMonsterDEF").innerHTML = monster.max_lvl_defense
        document.querySelector("#idMonsterSPD").innerHTML = monster.speed
        document.querySelector("#idMonsterTC").innerHTML = monster.crit_rate +"%"
        document.querySelector("#idMonsterDC").innerHTML = monster.crit_damage+"%"
        document.querySelector("#idMonsterRES").innerHTML = monster.resistance+"%"
        document.querySelector("#idMonsterPREC").innerHTML = monster.accuracy+"%"
        window.socket.emit("monsterSkills",{
            idSkills : monster.skills,
        })
    }


    window.socket.on("monsterSkillsData",(monsterSkills) =>{

        showMonsterContainerSkills.innerHTML =""

        monsterSkills.forEach(skill => {
            console.log(skill)
            let myDiv = createDom("div",showMonsterContainerSkills,"showMonsterSkill")

            myDiv.addEventListener("mouseenter",function(e){
                popup.style.display = "initial"
            })

            myDiv.addEventListener("mousemove",function(e){
                let widthPopup = e.pageX + 5
                popup.style.left = widthPopup + "px"
                let heightPopup = e.pageY - 205
                popup.style.top = heightPopup + "px"
                titlePop.innerHTML = skill.name
                popupDescription.innerHTML = skill.description
            })

            myDiv.addEventListener("mouseleave",function(e){
                popup.style.display = "none"
            })

            myDiv.addEventListener("click",function(e){
                ShowSkillContainer.style.display = "block"
                displaySkill(skill)
                myDiv.href = "#ShowSkillContainer";
            })

            let myImg = createDom("img",myDiv,"imgMonsterMain")
            myImg.src = "https://swarfarm.com/static/herders/images/skills/"+skill.icon_filename;
        })
    })


    function displaySkill(skill){
        document.querySelector("#idSkillName").innerHTML = skill.name
        document.querySelector("#idSkillDescription").innerHTML = skill.description
        document.querySelector(".showSkillImage img").src = "https://swarfarm.com/static/herders/images/skills/"+skill.icon_filename;
        
        //details Skills
        document.querySelector("#idSkillIsAoe").innerHTML = skill.aoe
        document.querySelector("#idSkillCooldown").innerHTML = skill.cooltime
        document.querySelector("#idSkillSlot").innerHTML = skill.slot
        document.querySelector("#idSkillNbHits").innerHTML = skill.hits
        document.querySelector("#idSkillIsPassive").innerHTML = skill.passive
    
        showSkillContainerEffects.innerHTML =""

        skill.effects.forEach(myEffect =>{
            console.log(myEffect)
            if(myEffect.effect.icon_filename != ""){
                let myDiv = createDom("div",showSkillContainerEffects,"showMonsterSkill")
                let myImg = createDom("img",myDiv,"imgMonsterMain")
                myImg.src = "https://swarfarm.com/static/herders/images/buffs/"+myEffect.effect.icon_filename;
            
                myDiv.addEventListener("mouseenter",function(e){
                    popup.style.display = "initial"
                })
    
                myDiv.addEventListener("mousemove",function(e){
                    let widthPopup = e.pageX + 5
                    popup.style.left = widthPopup + "px"
                    let heightPopup = e.pageY - 205
                    popup.style.top = heightPopup + "px"
                    titlePop.innerHTML = myEffect.effect.name
                    popupDescription.innerHTML = myEffect.effect.description
                })
    
                myDiv.addEventListener("mouseleave",function(e){
                    popup.style.display = "none"
                })
    
                myDiv.addEventListener("click",function(e){
                    ShowSkillContainer.style.display = "block"
                    displaySkill(skill)
                    myDiv.href = "#ShowSkillContainer";
                })
            
            }
          
    
        })
    }


    window.socket.on("skillsEffectData",(skillsEffects) =>{

    })


})






function createDom(elementType, parent, classs = null, idd =null){
    let elem = document.createElement(elementType);
    parent.appendChild(elem)
    if(classs != null){
        elem.classList.add(classs);
    }
    if(idd != null){
        elem.id = idd
    }

    return elem
}