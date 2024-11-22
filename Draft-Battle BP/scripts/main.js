import './gui/admin_menu.js'

import { world, system } from '@minecraft/server'
import { Arena } from './arena.js'
import { Vec3toStr, clearRunQueue, displaySetting } from './util.js'
import { openSettingMenu } from './gui/setting_menu.js'
import { GameStart } from './prepare.js'

console.log('main script loaded')

let runId_queue = []

// Check if the objectives exist, if not, create them
const objectives = ['Budget', 'Prepare-Time', 'Arena']
for (let obj of objectives) {
    if (world.scoreboard.getObjective(obj) == null) {
        world.scoreboard.addObjective(obj, obj)
    }
}

// Set default values for the objectives and display the game setting in the action bar
world.afterEvents.worldInitialize.subscribe(() => {
    const players = world.getAllPlayers()
    
    world.scoreboard.getObjective("Budget").setScore("Emerald Block:", 20)
    world.scoreboard.getObjective("Budget").setScore("Emerald:", 0)
    world.scoreboard.getObjective("Prepare-Time").setScore("Time:", 1)
    for (let name of Object.keys(Arena)) {
        world.scoreboard.getObjective("Arena").setScore(name, 1)
    }

    players.forEach((player) => runId_queue.push(system.runInterval(() => displaySetting(player), 20)))
})

// Display the game setting in the action bar when player spawn
world.afterEvents.playerSpawn.subscribe( ({player}) => {
    // Display the game setting in the action bar for all players
    runId_queue.push(system.runInterval(() => displaySetting(player), 20))
})

// Handle the button push event in the waiting room
world.afterEvents.buttonPush.subscribe(buttonPushEvent => {
    const btn_loc = buttonPushEvent.block.location
    const start_btn = "3, 103, 34"
    const setting_btn = "0, 103, 34"
    const mode_btn = "-3, 103, 34"

    // Check the button location and perform the corresponding action
    switch (Vec3toStr(btn_loc)) {
        case start_btn: // Start the game
            clearRunQueue(runId_queue)
            system.run(() => GameStart(runId_queue))
            break

        case setting_btn: // Open the setting menu
            system.run(() => openSettingMenu(buttonPushEvent.source))
            break

        case mode_btn: // Change the game mode
            world.sendMessage("§cThis feature is not available yet")
    }
})

world.afterEvents.playerLeave.subscribe(() => {
    const players = world.getAllPlayers()
    clearRunQueue(runId_queue)
    players.forEach((player) => runId_queue.push(system.runInterval(() => displaySetting(player), 20)))
})

world.afterEvents.playerInteractWithBlock.subscribe((event) => {
    if (event.block.typeId === "minecraft:anvil" || event.block.typeId === "minecraft:chipped_anvil") {
        world.getDimension('minecraft:overworld').setBlockType(event.block.location, 'minecraft:anvil')
        
    }
})
