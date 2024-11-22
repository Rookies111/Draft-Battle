console.log('Admin Menu loaded')

import { world, system, GameMode, DisplaySlotId } from "@minecraft/server"
import { ActionFormData } from "@minecraft/server-ui"
import { Arena } from "../arena.js"

world.beforeEvents.itemUse.subscribe(data => {
    const player = data.source
    const title = "§l§o§uAdmin Menu"
    if (data.itemStack.typeId == "draft:toolbox") system.run(() => main(player))

    function main() {
        const form = new ActionFormData()
            .title(title)
            .body(`§l§o§5Welcome §d${player.nameTag}§5!`)
            .button(`§0Gamemode`)
            .button(`§1Warps`)
            .button(`§4Get Block`)
            .button(`§2Display Scoreboard`)
            .button(`§cExit Menu`)
        form.show(player).then(r => {
            if (r.selection == 0) Gamemode(player)                
            if (r.selection == 1) Warps(player)
            if (r.selection == 2) Get_Block(player)
            if (r.selection == 3) Scoreboard(player)
        })
        .catch(() => {return -1})
    }

    function Gamemode(player) {
        new ActionFormData()
            .title(title)
            .body("Select Gamemode")
            .button("§o§0Survival\n§7[ Click to Change ]")
            .button("§o§0Creative\n§7[ Click to Change ]")
            .button("§o§0Adventure\n§7[ Click to Change ]")
            .button("§o§0Spectator\n§7[ Click to Change ]")
            .button(`§l§cBack`)
            .show(player).then(r => {
                if (r.selection == 0) {
                    player.sendMessage(`§cChanged §4${player.nameTag} §cTo Survival`)
                    player.setGameMode(GameMode.survival)
                }
                if (r.selection == 1) {
                    player.sendMessage(`§cChanged §4${player.nameTag} §cTo Creative`)
                    player.setGameMode(GameMode.creative)
                }
                if (r.selection == 2) {
                    player.sendMessage(`§cChanged §4${player.nameTag} §cTo Adventure`)
                    player.setGameMode(GameMode.adventure)
                }
                if (r.selection == 3) {
                    player.sendMessage(`§cChanged §4${player.nameTag} §cTo Spectator`)
                    player.setGameMode(GameMode.spectator)
                }
                if (r.selection == 4) main(player)
            })
            .catch(() => {return -1})
    }

    function Warps() {
        new ActionFormData()
            .title(title)
            .body("Select destination")
            .button("§o§1Waiting Room\n§7[ Click to Teleport ]") // Teleport to waiting room
            .button("§o§1Trading Hall\n§7[ Click to Teleport ]") // Teleport to trading hall
            .button("§o§1Under Trading Hall\n§7[ Click to Teleport ]") // Open arena teleport menu
            .button("§o§1Arena\n§7[ Click to Teleport ]") // Open arena teleport menu
            .button(`§l§cBack`)
            .show(player).then(r => {
                if (r.selection == 0) {
                    player.sendMessage(`§cTeleported §4${player.nameTag} §cTo Waiting Room`)
                    player.teleport({ x: 0, y: 102, z: 29 })
                }
                if (r.selection == 1) {
                    player.sendMessage(`§cTeleported §4${player.nameTag} §cTo Trading Hall`)
                    player.teleport({ x: 0, y: 120, z: 0})
                }
                if (r.selection == 2) {
                    player.sendMessage(`§cTeleported §4${player.nameTag} §cTo Under Trading Hall`)
                    player.teleport({ x: 0, y: 90, z: 0})
                }
                if (r.selection == 3) toArena(player)
                if (r.selection == 4) main(player)
            })
            .catch(() => {return -1})
    }

    function toArena(player) {
        const form = new ActionFormData()
            .title(title)
            .body("Select arena")
        for (let name of Object.keys(Arena)) {
            form.button(`§o§q${name}\n§7[ Click to Teleport ]`, `textures/gui/icon/${name}.png`)
        }
        form.button(`§l§cBack`)
        form.show(player).then(r => {
            if (r.selection == 10) Warps(player)
            else if (r.selection < 10) {    
                player.sendMessage(`§cTeleported §4${player.nameTag} §cTo ${Object.keys(Arena)[r.selection]} Arena`)
                player.teleport(Object.values(Arena)[r.selection].visitPoint)
            }
        })
        .catch(() => {return -1})
    }

    function Get_Block(player) {
        const form = new ActionFormData()
            .title(title)
            .body("Select block")
            .button("§o§0Command Block\n§7[ Click to Get ]")
            .button("§o§0Structure Block\n§7[ Click to Get ]")
            .button("§o§0Light\n§7[ Click to Get ]")
            .button("§o§0Barrier\n§7[ Click to Get ]")
            .button(`§l§cBack`)
        form.show(player).then(r => {
            if (r.selection == 0) player.runCommandAsync(`give ${player.nameTag} minecraft:command_block`)
            if (r.selection == 1) player.runCommandAsync(`give ${player.nameTag} minecraft:structure_block`)
            if (r.selection == 2) player.runCommandAsync(`give ${player.nameTag} minecraft:light_block_15`)
            if (r.selection == 3) player.runCommandAsync(`give ${player.nameTag} minecraft:barrier`)
            if (r.selection == 4) main(player)
        })
        .catch(() => {return -1})
    }

    function Scoreboard(player) {
        const objectives = world.scoreboard.getObjectives()
        const form = new ActionFormData()
            .title(title)
            .body("Select objective to display")
        for (let obj of objectives) {
            form.button(`§o§1${obj.id}\n§7[ Click to Display ]`)
        }
        form.button(`§o§0Hide All`)
        form.button(`§l§cBack`)
        form.show(player).then(r => {
            switch (r.selection) {
                case objectives.length + 1:
                    main(player)
                    break
                case objectives.length:
                    world.scoreboard.clearObjectiveAtDisplaySlot(DisplaySlotId.Sidebar)
                    world.sendMessage(`§cAll objectives have been hidden`)
                    break
                default:
                    player.sendMessage(`§cDisplaying §4${objectives[r.selection].id} §cObjective`)
                    world.scoreboard.setObjectiveAtDisplaySlot(DisplaySlotId.Sidebar, {
                        objective: world.scoreboard.getObjective(objectives[r.selection].id)
                    })
            }
        })
        .catch(() => {return -1})
    }
})
