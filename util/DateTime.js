const moment = require('moment');
require('moment-timezone');

// Set the default timezone to Africa/Algiers
moment.tz.setDefault("Africa/Algiers");

const getCurrentDateTime = () => {
    return moment().format('YYMMDDHHmmss');
};

module.exports = {
    getCurrentDateTime
};