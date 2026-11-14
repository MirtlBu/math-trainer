/**
 * sandbox.js
 * The registry of the sandbox toys (the Sandbox topic): interactive pictures to play with, not exercises.
 *
 *   TOYS[key] = { mount(root), destroy?() }
 *
 * `mount` fills the element `root` (the toy screen). The toys are written in their own files
 * (sandbox-*.js); a card with data-toy="key" in the Sandbox view of index.html opens a toy (see goToy in ui.js).
 *
 * Load before the toys and before ui.js.
 */

const TOYS = {};
