console.log('Battle-Phase script loaded')

import { system, world, EasingType } from "@minecraft/server"
import { clearRunQueue, chooseFromArray } from "./util.js";
import { Arena } from "./arena.js";

export function gotoArena(runId_queue, arena) {
    const players = world.getAllPlayers()
    let spawn_pool = Arena[arena].spawnPoint.toSpliced(0,0) // Clone the spawn point array
    clearRunQueue(runId_queue)
    world.gameRules.pvp = true // Enable player vs player combat
    world.sendMessage(`The game is begin in the ${arena} arena`)
    for (let player of players) {
        let spawnPoint = chooseFromArray(spawn_pool, true)
        player.teleport(spawnPoint, { facingLocation: Arena[arena].facingLocation })

        // Play cutscene animation
        ArenaCutscene(player, arena)
    }

    world.afterEvents.entityDie.subscribe((event) => {
        if (event.deadEntity.typeId === "player") {
            world.sendMessage(`${event.entity.name} has been eliminated`)
        }
    })
}

// Function to play the arena cutscene
function ArenaCutscene(player, arena) {
    const start = {
        x: Arena[arena].visitPoint.x - 30,
        y: Arena[arena].visitPoint.y + 10,
        z: Arena[arena].visitPoint.z - 30
    }
    const end = {
        x: Arena[arena].visitPoint.x - 30,
        y: Arena[arena].visitPoint.y + 10,
        z: Arena[arena].visitPoint.z + 30
    }
    player.onScreenDisplay.setHudVisibility(0)
    player.inputPermissions.cameraEnabled = false
    player.inputPermissions.movementEnabled = false

    player.camera.fade({
        fadeTime: {
            fadeInTime: 0.25,
            holdTime: 1.0,
            fadeOutTime: 0.25,
        }
    })
    player.onScreenDisplay.setTitle(`§l§o§a${arena} Arena`, {
        stayDuration: 125,
        fadeInDuration: 1,
        fadeOutDuration: 1,
    })

    system.runTimeout(() => {
        player.camera.setCamera("minecraft:free", {
            location: (arena != "Mansion") ? start : {x: 619, y: 103, z: 77},
            facingLocation: Arena[arena].facingLocation,
        })
    }, 20)

    system.runTimeout(() => {
        player.camera.setCamera("minecraft:free", {
            location: (arena != "Mansion") ? start : {x: 579, y: 103, z: 77},
            facingLocation: Arena[arena].facingLocation,
            easeOptions: {
                easeTime: 5,
                easeType: EasingType.Linear,
            }
        })
    }, 25)

    system.runTimeout(() => {
        player.camera.clear()

        for (let i = 0; i < 3; i++) {
            system.runTimeout(() => {
                player.onScreenDisplay.setTitle(`§l§c${3-i}`, { stayDuration: 10, fadeInDuration: 1, fadeOutDuration: 1 })
                player.playSound("note.pling")
            }, i * 20)
        }
    
        system.runTimeout(() => {
            player.inputPermissions.cameraEnabled = true
            player.inputPermissions.movementEnabled = true
            player.onScreenDisplay.setHudVisibility(1)
            player.playSound("note.pling", { pitch: 2 })
        }, 60)
    }, 145)
}