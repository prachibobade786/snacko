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

const addressExists = async (addressId, userId) => {
    const address = await addressModel.getAddressById(addressId);
    return address && address.user_id === userId ? address : null;
};

module.exports = {
    addAddress,
    getUserAddresses,
    getAddress,
    editAddress,
    removeAddress,
    addressExists
};