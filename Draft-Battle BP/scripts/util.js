import { world, system } from "@minecraft/server"

export function Vec3toStr(vec) {
    return `${vec.x}, ${vec.y}, ${vec.z}`
}

export function chooseFromArray(Array, doRemove = false) {
    const index = Math.floor(Math.random() * Array.length)
    const chosen = Array[index]
    if (doRemove == true) Array.splice(index, 1)
    return chosen
}

export function clearRunQueue(runId_queue) {
    for (let runId of runId_queue) {
        system.clearRun(runId)
    }
}

export function displaySetting(player) {
    const setting = {
        "Time": world.scoreboard.getObjective("Prepare-Time").getScore("Time:"),
        "Budget": {
            "Block": world.scoreboard.getObjective("Budget").getScore("Emerald Block:"),
            "Emerald": world.scoreboard.getObjective("Budget").getScore("Emerald:")
        }
    }
    const setting_display_text = `§l§o§uGame Settings§r\n> §bPrepare Time: ${setting.Time}:00§f\n> §qBudget:§f\n  §aEmerald block - ${setting.Budget.Block}\n  §aEmerald - ${setting.Budget.Emerald}`
    player.onScreenDisplay.setActionBar(setting_display_text)
}