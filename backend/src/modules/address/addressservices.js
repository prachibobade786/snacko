const addressModel = require("../address/addressmodel");

const addAddress = async (data) => {
    return await addressModel.createAddress(data);
};

const getUserAddresses = async (userId) => {
    return await addressModel.getAddressesByUserId(userId);
};

const getAddress = async (id) => {
    return await addressModel.getAddressById(id);
};

const editAddress = async (id, data) => {
    return await addressModel.updateAddress(id, data);
};

const removeAddress = async (id) => {
    return await addressModel.deleteAddress(id);
};

module.exports = {
    addAddress,
    getUserAddresses,
    getAddress,
    editAddress,
    removeAddress
};