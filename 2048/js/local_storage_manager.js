"use strict";
var FakeStorage = /** @class */ (function () {
    function FakeStorage() {
        this._data = {};
        this.length = 0;
    }
    FakeStorage.prototype.setItem = function (id, val) {
        return (this._data[id] = String(val));
    };
    FakeStorage.prototype.getItem = function (id) {
        // eslint-disable-next-line no-prototype-builtins
        return this._data.hasOwnProperty(id) ? this._data[id] : null;
    };
    FakeStorage.prototype.removeItem = function (id) {
        return delete this._data[id];
    };
    FakeStorage.prototype.clear = function () {
        return (this._data = {});
    };
    FakeStorage.prototype.key = function (index) {
        return null;
    };
    return FakeStorage;
}());
var LocalStorageManager = /** @class */ (function () {
    function LocalStorageManager() {
        this.bestScoreKey = "bestScore";
        this.gameStateKey = "gameState";
        var supported = this.localStorageSupported();
        this.storage = supported ? window.localStorage : window.fakeStorage;
    }
    LocalStorageManager.prototype.localStorageSupported = function () {
        var testKey = "test";
        try {
            var storage = window.localStorage;
            storage.setItem(testKey, "1");
            storage.removeItem(testKey);
            return true;
        }
        catch (error) {
            return false;
        }
    };
    // Best score getters/setters
    LocalStorageManager.prototype.getBestScore = function () {
        var _a;
        return parseInt((_a = this.storage.getItem(this.bestScoreKey)) !== null && _a !== void 0 ? _a : "0", 10);
    };
    LocalStorageManager.prototype.setBestScore = function (score) {
        this.storage.setItem(this.bestScoreKey, score.toString());
    };
    // Game state getters/setters and clearing
    LocalStorageManager.prototype.getGameState = function () {
        var stateJSON = this.storage.getItem(this.gameStateKey);
        return stateJSON ? JSON.parse(stateJSON) : null;
    };
    LocalStorageManager.prototype.setGameState = function (gameState) {
        this.storage.setItem(this.gameStateKey, JSON.stringify(gameState));
    };
    LocalStorageManager.prototype.clearGameState = function () {
        this.storage.removeItem(this.gameStateKey);
    };
    return LocalStorageManager;
}());
