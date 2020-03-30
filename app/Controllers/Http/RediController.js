"use strict";
const Redis = use("Redis");
class RediController {
  static async createcardlist(id,cards) {
    let result;
    try {
      await Redis.sadd(id + "listcards", cards);
      result = "ok";
    } catch (error) {
      result = error.message;
    }
    return result;
  }
}

module.exports = RediController;
