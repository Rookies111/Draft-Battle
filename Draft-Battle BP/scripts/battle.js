console.log('Battle-Phase script loaded')

import { system, world, EasingType, GameMode, EntityComponentTypes } from "@minecraft/server"
import { clearRunQueue, chooseFromArray, displaySetting } from "./util.js";
import { Arena } from "./arena.js";

let runId_queue = [] // Define the runId_queue

// Function to teleport the players to the arena
export function gotoArena(runId_queue, arena) {
    runId_queue = runId_queue
    const players = world.getAllPlayers()
    let spawn_pool = Arena[arena].spawnPoint.toSpliced(0,0) // Clone the spawn point array

    world.gameRules.pvp = true // Enable player vs player combat
    clearRunQueue(runId_queue)
    world.sendMessage(`The game is begin in the ${arena} arena`)

    for (let player of players) {
        let spawnPoint = chooseFromArray(spawn_pool, true)

        player.teleport(spawnPoint, { facingLocation: Arena[arena].facingLocation })
        ArenaReset(arena)

        // Play cutscene animation
        ArenaCutscene(player, arena)
    }
}

world.afterEvents.entityDie.subscribe((event) => {
    // Clone the player array
    let players = world.getAllPlayers().toSpliced(0,0)
    if (event.deadEntity.typeId === "minecraft:player") {
        players.splice(players.indexOf(event.deadEntity), 1)
        event.deadEntity.setGameMode(GameMode.adventure)
        if (players.length === 1) {
            world.sendMessage(`${players[0].nameTag} has won the game`)
            playerWin(players[0])
        }
    }
})

// Function for the player win event
function playerWin(player) {
    player.onScreenDisplay.setTitle("§l§o§aVictory!", {
        stayDuration: 105,
        fadeInDuration: 1,
        fadeOutDuration: 1,
    })
    player.playSound("random.levelup")

    system.runTimeout(() => {
        player.teleport({ x: 0, y: 102, z: 29 })
        world.gameRules.pvp = false
        player.setGameMode(GameMode.adventure)
        player.resetLevel()
        player.runCommandAsync("clear")
    }, 80)
    runId_queue.push(system.runInterval(() => displaySetting(player), 20))
}

// Function to play the arena cutscene
function ArenaCutscene(player, arena) {
    const start = {
        x: Arena[arena].visitPoint.x - 25,
        y: Arena[arena].visitPoint.y,
        z: Arena[arena].visitPoint.z - 30
    }
    const end = {
        x: Arena[arena].visitPoint.x - 25,
        y: Arena[arena].visitPoint.y,
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
            location: (arena != "Mansion") ? end : {x: 579, y: 103, z: 77},
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
            }, i * 20 + 5)
        }
    
        system.runTimeout(() => {
            player.inputPermissions.cameraEnabled = true
            player.inputPermissions.movementEnabled = true
            player.onScreenDisplay.setHudVisibility(1)
            player.playSound("note.pling", { pitch: 2 })
        }, 65)
    }, 145)
}

// Function to reset the arena
function ArenaReset(arena) {
    const overworld = world.getDimension("overworld")

    overworld.setBlockType(Arena[arena].resetLocation, 'minecraft:redstone_block')
    system.runTimeout(() => { overworld.setBlockType(Arena[arena].resetLocation, 'minecraft:air') }, 5)
}