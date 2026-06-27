import mongoose from 'mongoose';

const heroSchema = new mongoose.Schema({
    images: [{
        url: {
            type: String,
            required: true
        },
        publicId: {
            type: String,
            required: true
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Hero = mongoose.model('Hero', heroSchema);

export default Hero;
