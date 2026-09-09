// Gère uniquement la logique visuelle de l'Arbre R&D
UI.buildSkills = function() {
    let svg = document.getElementById("tree-svg");
    let nodes = document.getElementById("tree-nodes");
    if (!svg || !nodes) return;
    
    svg.innerHTML = ""; nodes.innerHTML = "";

    for(let k in SkillDB) {
        let s = SkillDB[k];
        if(s.req && SkillDB[s.req]) {
            let p = SkillDB[s.req];
            svg.innerHTML += `<line x1="${p.x}" y1="${p.y}" x2="${s.x}" y2="${s.y}" stroke="#334155" stroke-width="4" id="line-${k}" />`;
        }

        let txt = ""; 
        for(let r in s.cost) {
            txt += `${s.cost[r]} ${ResourceDB[r] ? ResourceDB[r].name : r} `;
        }
        nodes.innerHTML += `
            <div id="skill-${k}" class="tree-node locked" style="left:${s.x}px; top:${s.y}px;" onclick="Game.buySkill('${k}')">
                ${s.icon}
                <div class="tooltip">
                    <strong style="color:#f59e0b;">${s.name}</strong><br>
                    <span style="color:#ccc;">${s.desc}</span><br>
                    <hr style="margin:5px 0; border-color:#444;">
                    Coût : ${txt}
                </div>
            </div>`;
    }
};

UI.updateTreeScreen = function() {
    for(let k in SkillDB) {
        let el = document.getElementById(`skill-${k}`);
        let line = document.getElementById(`line-${k}`);
        if(el) {
            let s = SkillDB[k];
            let reqMet = !s.req || SkillDB[s.req].purchased;
            let aff = true; 
            for(let r in s.cost) {
                if(ResourceDB[r].amount < s.cost[r]) aff = false;
            }
            
            el.className = "tree-node";
            if(line) line.setAttribute("stroke", "#334155");

            if(s.purchased) { 
                el.classList.add("purchased"); 
                if(line) line.setAttribute("stroke", "#f59e0b");
            }
            else if(reqMet && aff) { el.classList.add("available"); }
            else { el.classList.add("locked"); }
        }
    }
};