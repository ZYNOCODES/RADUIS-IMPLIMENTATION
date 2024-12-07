const { getCurrentDateTime } = require('../util/DateTime.js');

// Function to generate a unique code for a given model
const generateUniqueCode = async (prefix, digits, model) => {
    const randomDigits = Math.floor(Math.pow(10, digits - 1) + Math.random() * 9 * Math.pow(10, digits - 1));
    const dateTime = getCurrentDateTime();
    const code = prefix + dateTime + randomDigits;

    const exists = await model.findOne({
        where: { code },
        raw: true
    });

    if (exists) {
        return await generateUniqueCode(prefix, digits, model);
    }
    return code;
};

module.exports = {
    generateUniqueCode
};
