console.log('Preparation-Phase script loaded')

import { world, system, EasingType, ItemStack } from "@minecraft/server"
import { chooseFromArray } from "./util.js"
import { gotoArena } from "./battle.js"

export function GameStart(runId_queue) {
    const players = world.getAllPlayers()
    const overworld = world.getDimension('minecraft:overworld')
    const trading_hall_coord = { x: 0, y: 98, z: 0 }

    // Reset all villager trade
    overworld.runCommandAsync("kill @e[type=!player,type=!painting,type=!armor_stand]")
    overworld.runCommandAsync("kill @e[type=item]")
    overworld.setBlockType(trading_hall_coord, 'minecraft:redstone_block')
    system.runTimeout(() => { overworld.setBlockType(trading_hall_coord, 'minecraft:air') }, 5)

    // Play cutscene animation
    players.forEach(player => TradingHallCutscene(player, runId_queue))
}

// Function to play the trading hall cutscene
function TradingHallCutscene(player, runId_queue) {
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
    player.onScreenDisplay.setTitle("§l§o§aThe arena", {
        stayDuration: 105,
        fadeInDuration: 1,
        fadeOutDuration: 1,
        subtitle: "§o§ahas been chosen!"
    })

    system.runTimeout(() => {
        player.camera.setCamera("minecraft:free", {
            location: {x:-8, y: 123, z: 10},
            rotation: {x: 90, y: 225},
        })
    }, 5)

    system.runTimeout(() => {
        player.camera.setCamera("minecraft:free", {
            location: {x: 10, y: 123, z: -8},
            rotation: {x: 90, y: 225},
            easeOptions: {
                easeTime: 5,
                easeType: EasingType.Linear,
            }
        })
    }, 20)

    system.runTimeout(() => {
        player.camera.fade({
            fadeTime: {
                fadeInTime: 0.25,
                holdTime: 1.0,
                fadeOutTime: 0.25,
            }
        })
        player.onScreenDisplay.setTitle("§l§o§cBe Prepare!", {
            stayDuration: 60,
            fadeInDuration: 1,
            fadeOutDuration: 1
        })
    }, 110)

    system.runTimeout(() => {
        player.camera.setCamera("minecraft:free", {
            location: {x: 0, y: 104, z: 14},
            rotation: {x: 45, y: 180}
        })
    }, 115)

    system.runTimeout(() => {
        player.camera.setCamera("minecraft:free", {
            location: {x: 0, y: 104, z: 14},
            rotation: {x: 0, y: 180},
            easeOptions: {
                easeTime: 2,
                easeType: EasingType.Linear
            }
        })
    }, 120)

    system.runTimeout(() => {
        // Set up the player
        PlayerSetUp(player, runId_queue)
    }, 175)
}

// Function to set up the player
function PlayerSetUp(player, runId_queue) {
    const budget = [
        world.scoreboard.getObjective("Budget").getScore("Emerald Block:"),
        world.scoreboard.getObjective("Budget").getScore("Emerald:")
    ]

    // Clear the player inventory
    // player.runCommandAsync("clear")

    // Give the player the budget   
    const inventory = player.getComponent('minecraft:inventory')
    if (inventory === undefined || inventory.container === undefined) return

    if (budget[0] > 0) inventory.container.setItem(0, new ItemStack("minecraft:emerald_block", budget[0]))
    if (budget[1] > 0) inventory.container.setItem(1, new ItemStack("minecraft:emerald", budget[1]))

    // Teleport the player to the trading hall
    player.teleport({ x: 0, y: 102, z: 15 }, { facingLocation: { x: 0, y: 100, z: 0 }})
    for (let i = 0; i < 3; i++) {
        system.runTimeout(() => {
            player.onScreenDisplay.setTitle(`§l§c${3-i}`, { stayDuration: 10, fadeInDuration: 1, fadeOutDuration: 1 })
            player.playSound("note.pling")
        }, i * 20)
    }

    system.runTimeout(() => {
        player.camera.clear()
        player.inputPermissions.cameraEnabled = true
        player.inputPermissions.movementEnabled = true
        player.onScreenDisplay.setHudVisibility(1)
        player.playSound("note.pling", { pitch: 2 })
        StartTimer(player, runId_queue)
    }, 60)
}

// Function to start the timer
function StartTimer(player, runId_queue) {
    // Choose a random arena
    const arena_names = world.scoreboard.getObjective("Arena").getScores()
    let arena_pool = []
    for (let arena of arena_names) {
        if (arena.score) arena_pool.push(arena.participant.displayName)
    }
    const arena = chooseFromArray(arena_pool)
    let prepare_time = world.scoreboard.getObjective("Prepare-Time").getScore("Time:") * 60

    // Display remaining time on the action bar
    runId_queue.push(system.runInterval(() => {
        let time_min = Math.floor(prepare_time / 60)
        let time_sec = prepare_time % 60

        player.onScreenDisplay.setActionBar(`§l§o§cArena - ${arena}\n§a${time_min}:${String(time_sec).padStart(2, '0')} Remaining§r`)
        if (prepare_time <= 3 && prepare_time > 0) {
            player.onScreenDisplay.setTitle(`§l§c${prepare_time}`)
            player.playSound("note.pling")
        }
        
        if (prepare_time > 0) {
            prepare_time-- // Decrease the prepare time counter
        } else {
            gotoArena(runId_queue, arena) // Teleport the player to the arena
        }
    }, 20))
}