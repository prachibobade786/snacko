const addressService = require("../address/addressservices");

// Add Address
const addAddress = async (req, res) => {

    try {

        const data = {
            ...req.body,
            user_id: req.user.id
        };

        const result =
            await addressService.addAddress(data);

        res.status(201).json({
            success: true,
            message: "Address Added Successfully",
            data: result
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Get User Addresses
const getUserAddresses = async (req, res) => {

    try {

        const addresses =
            await addressService.getUserAddresses(
                req.user.id
            );

        res.status(200).json({
            success: true,
            data: addresses
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Get Address By Id
const getAddress = async (req, res) => {

    try {

        const address =
            await addressService.getAddress(
                req.params.id
            );

        res.status(200).json({
            success: true,
            data: address
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Update Address
const updateAddress = async (req, res) => {

    try {

        const result =
            await addressService.editAddress(
                req.params.id,
                req.body
            );

        res.status(200).json({
            success: true,
            message: "Address Updated Successfully",
            data: result
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Delete Address
const deleteAddress = async (req, res) => {

    try {

        await addressService.removeAddress(
            req.params.id
        );

        res.status(200).json({
            success: true,
            message: "Address Deleted Successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

module.exports = {
    addAddress,
    getUserAddresses,
    getAddress,
    updateAddress,
    deleteAddress
};