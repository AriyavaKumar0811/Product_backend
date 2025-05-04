const { Transaction } = require('../../models');

exports.saveDeposit = async (req, res) => {
    try {
        const { hash, amount, type = 'deposit', symbol = 'ETH', userAddress } = req.body;

        // Check for duplicate transaction hash
        const existing = await Transaction.findOne({ hash });
        if (existing) {
            return res.status(409).json({
                status: false,
                message: `${capitalize(type)} transaction already exists`,
                data: existing
            });
        }

        // Save new transaction
        const newTransaction = await Transaction.create({ hash, amount, type, symbol, userAddress });

        return res.status(201).json({
            status: true,
            message: `${capitalize(type)} saved successfully`,
            data: newTransaction
        });
    } catch (error) {
        console.error("🔥 Error saving transaction:", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Helper to capitalize first letter
function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}
