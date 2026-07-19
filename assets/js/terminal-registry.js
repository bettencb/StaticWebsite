/**
 * Secure Vault Breaker 3D — Terminal Game Registry
 * Copyright (c) 2026 bettencb (https://github.com/bettencb)
 *
 * Licensed under CC BY-NC 4.0.
 * Free to use and modify with attribution. Commercial use prohibited.
 * https://creativecommons.org/licenses/by-nc/4.0/
 */

/**
 * Global registry for terminal mini-games.
 * Each game registers itself via TerminalGames.register(id, game).
 *
 * A game object must expose:
 *   setup(terminalObj, onComplete)  — render the game UI and start internal state.
 *                                     Call onComplete(logArea) when the player wins.
 *   handleKey(code, event)          — called for every keypress while the terminal
 *                                     is open (except 'KeyQ', which closes it).
 */
window.TerminalGames = {
    _registry: {},

    register: function(id, game) {
        this._registry[id] = game;
    },

    pick: function() {
        const ids = Object.keys(this._registry);
        if (!ids.length) return null;
        return this._registry[ids[Math.floor(Math.random() * ids.length)]];
    }
};
