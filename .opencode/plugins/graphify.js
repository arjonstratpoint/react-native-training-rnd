// .opencode/plugins/graphify.js
// Auto-updates the Graphify knowledge graph after every tool execution.

import { Plugin } from "@opencode/plugin"
import { execSync } from "node:child_process"

export default Plugin.define({
  id: "graphify",

  async setup(ctx) {
    await ctx.tool.hook("execute.after", async () => {
      try {
        execSync("graphify update . --force", {
          cwd: ctx.location.directory,
          stdio: "ignore",
        })
      } catch (error) {
        console.error("[Graphify] Failed to update knowledge graph:", error)
      }
    })
  },
})
