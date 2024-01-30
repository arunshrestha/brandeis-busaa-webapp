const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const eventSchema = Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        location: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        isOnline: { type: Boolean, default: false },
        registrationlink: { type: String },
        organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    },
);

module.exports = mongoose.model("Event", eventSchema);