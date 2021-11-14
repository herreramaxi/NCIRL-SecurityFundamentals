'use strict';
var crypto = require('crypto');
require('dotenv').config();
const password = process.env.ADMIN_PWD;

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */

    //crypto.createHash('sha256').update(password).digest('hex');
    // const hash = crypto.createHash('sha256').update(password).digest('hex');
    const hash = crypto.createHash('sha256').update(password).digest('base64');
    return queryInterface.bulkInsert('Users', [{
      firstName: "admin",
      lastName: "admin",
      email: "admin@sf.com",
      password: hash,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete('Users', null, {});
  }
};
