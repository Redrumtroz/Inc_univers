const UI = {
    async loadTabsHTML() {
        const tabs = ['tab-village.html', 'tab-equipment.html', 'tab-tree.html', 'tab-settings.html', 'tab-defense.html'];
        const container = document.getElementById("main-container");
        container.innerHTML = ""; 
        for (const file of tabs) {
            try {
                const response = await fetch('tabs/' + file);
                const html = await response.text();
                container.insertAdjacentHTML('beforeend', html);
            } catch(e) { console.error(e); }
        }
    },
    setupEvents() {
        let b1 = document.getElementById("btn-manual-gather"); if(b1) b1.onclick = () => Game.manualGather("wood");
        let b2 = document.getElementById("btn-save"); if(b2) b2.onclick = () => Game.save();
        let b3 = document.getElementById("btn-reset"); if(b3) b3.onclick = () => Game.reset();
    },
    showSaveMessage() { let msg = document.getElementById("save-msg"); if(msg) { msg.style.display = "block"; setTimeout(() => msg.style.display = "none", 2000); } },
    updateScreen() {
        if (this.updateResourcesScreen) this.updateResourcesScreen();
        if (this.updateGeneratorsScreen) this.updateGeneratorsScreen();
        if (this.updateTreeScreen) this.updateTreeScreen();
    }
};
window.UI = UI;
function openTab(e, id) {
    document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    let target = document.getElementById(id);
    if(target) target.classList.add("active"); 
    e.currentTarget.classList.add("active");
    if(id === 'tab-1' && window.CityBuilder) setTimeout(() => CityBuilder.resize(), 10);
}
window.openTab = openTab;