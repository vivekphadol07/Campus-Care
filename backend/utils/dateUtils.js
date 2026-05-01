const formatDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
};

const calculateLeaveDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive
};

const getDayName = (date = new Date()) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date(date).getDay()];
};

const getDatesInRange = (startDate, endDate) => {
    const dates = [];
    let current = new Date(startDate);
    const end = new Date(endDate);
    while (current <= end) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
    }
    return dates;
};

module.exports = {
    formatDate,
    calculateLeaveDays,
    getDayName,
    getDatesInRange
};
