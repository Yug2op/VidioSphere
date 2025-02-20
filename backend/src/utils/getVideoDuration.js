import ffmpeg from 'fluent-ffmpeg';

/**
 * Get the duration of a video file.
 * @param {string} filePath - The local path of the video file.
 * @returns {Promise<number>} - Duration in seconds.
 */
export const getVideoDuration = (filePath) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) {
                return reject(err);
            }
            resolve(metadata.format.duration); // Duration in seconds
        });
    });
};


