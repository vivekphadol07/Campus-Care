const successResponse = (res, data, message = "Success", statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

const errorResponse = (res, error, message = "Error", statusCode = 500) => {
    return res.status(statusCode).json({
        success: false,
        message,
        error: typeof error === 'string' ? error : error.message,
        details: error.details || null
    });
};

module.exports = {
    successResponse,
    errorResponse
};
