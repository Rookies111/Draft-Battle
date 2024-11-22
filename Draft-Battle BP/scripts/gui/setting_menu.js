import { world } from "@minecraft/server"
import { ActionFormData, ModalFormData, MessageFormData  } from "@minecraft/server-ui"
import { Arena } from "../arena.js"

console.log('Setting Menu loaded')

// Function to open the setting menu
export function openSettingMenu(player) {
    const form = new ActionFormData()
        .title("§l§o§uGame Settings Menu")
        .body(``)
        .button(`§qGame Budget`)
        .button(`§1Preparation Time`)
        .button(`§0Arena`)
        .button(`§mDefault Settings`)
        .button(`§cExit Menu`)
    form.show(player).then(r => {
        if (r.selection == 0) Budget(player)                
        if (r.selection == 1) Prepare_time(player)
        if (r.selection == 2) ArenaSetting(player)
        if (r.selection == 3) Default(player)
    })
}

// Function to set the game budget
function Budget(player) {
    const block = world.scoreboard.getObjective("Budget").getScore("Emerald Block:")
    const emerald = world.scoreboard.getObjective("Budget").getScore("Emerald:")
    const form = new ModalFormData()
        .title("§l§o§qGame Budget Setting")
        .textField("Emerald block amount:", "0 - 64", String(block))
        .textField("Emerald amount:", "0 - 64", String(emerald))
        .show(player).then(r => {
            world.scoreboard.getObjective("Budget").setScore("Emerald Block:", Number(r.formValues[0]))
            world.scoreboard.getObjective("Budget").setScore("Emerald:", Number(r.formValues[1]))
            player.sendMessage(`§cGame Budget has been set to\n§a${r.formValues[0]} §cEmerald Blocks and\n§a${r.formValues[1]} §cEmeralds`)
        })
        .catch(() => {return -1})
}

// Function to set the preparation time
function Prepare_time(player) {
    const prepare_time = world.scoreboard.getObjective("Prepare-Time").getScore("Time:")
    const form = new ModalFormData()
        .title("§l§o§1Preparation Time Setting")
        .slider("Preparation Time(Min.)", 1, 10, 1, prepare_time)
        .show(player).then(r => {
            world.scoreboard.getObjective("Prepare-Time").setScore("Time:", r.formValues[0])
            player.sendMessage(`§cPreparation Time has been set to §a${r.formValues[0]} §cMinutes`)
        })
        .catch(() => {return -1})
}

// Function to enable or disable the arena
function ArenaSetting(player) {
    const arena_name = world.scoreboard.getObjective("Arena").getScores()
    const form = new ModalFormData()
        .title("§l§o§0Arena Setting")
    arena_name.forEach((arena) => form.toggle(arena.participant.displayName, Boolean(arena.score)))
    form.show(player).then(r => {
        for (let i = 0; i < arena_name.length; i++) {
            world.scoreboard.getObjective("Arena").setScore(arena_name[i].participant.displayName, Number(r.formValues[i]))
        }
        player.sendMessage(`§cArena has been changed`)
    })
    .catch(() => {return -1})
}

// Function to reset the game settings to default
function Default(player) {
    const form = new MessageFormData()
        .title("§l§mDefault Settings")
        .body("Are you sure you want to reset the game settings to default?")
        .button2("§cReset")
        .button1("§l§qCancel")
        .show(player).then(r => {
            if (r.selection == 1) reset(player)
            else openSettingMenu(player)
        })

    function reset(player) {
        world.scoreboard.getObjective("Budget").setScore("Emerald Block:", 20)
        world.scoreboard.getObjective("Budget").setScore("Emerald:", 0)
        world.scoreboard.getObjective("Prepare-Time").setScore("Time:", 5)
        Object.keys(Arena).forEach((arena) => world.scoreboard.getObjective("Arena").setScore(arena, 1))
        player.sendMessage(`§cGame settings has been reset to default`)
    }
}
