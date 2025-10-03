export const handleRequestError = (err) => {
    if (err.response) {
        const message =
            err.response.data?.detail ||
            err.response.data?.message ||
            JSON.stringify(err.response.data);
        throw new Error(`Server error: ${message}`);
    } else if (err.request) {
        throw new Error('No response from server');
    } else {
        throw new Error(`Request error: ${err.message}`);
    }
};