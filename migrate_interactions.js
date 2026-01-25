const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const Activity = mongoose.model('Activity', new mongoose.Schema({
            user: mongoose.Schema.ObjectId,
            book: mongoose.Schema.ObjectId,
            type: String,
            review: mongoose.Schema.ObjectId,
            likes: [mongoose.Schema.ObjectId],
            comments: Array
        }));

        const Review = mongoose.model('Review', new mongoose.Schema({
            user: mongoose.Schema.ObjectId,
            book: mongoose.Schema.ObjectId,
            likes: [mongoose.Schema.ObjectId],
            comments: Array,
            status: String
        }));

        const activities = await Activity.find({ type: 'RATED_BOOK', review: { $exists: false } }).lean();
        console.log(`Found ${activities.length} activities to migrate`);

        for (const act of activities) {
            const review = await Review.findOne({
                user: act.user,
                book: act.book,
                status: 'Approved'
            }).sort({ createdAt: -1 }).lean();

            if (review) {
                console.log(`Syncing act ${act._id} with rev ${review._id}`);

                const actLikes = (act.likes || []).map(id => id.toString());
                const revLikes = (review.likes || []).map(id => id.toString());
                const mergedLikes = [...new Set([...actLikes, ...revLikes])].map(id => new mongoose.Types.ObjectId(id));

                const actComments = act.comments || [];
                const revComments = review.comments || [];
                const mergedComments = [...revComments];

                for (const ac of actComments) {
                    const exists = revComments.some(rc =>
                        rc.user.toString() === ac.user.toString() &&
                        rc.text === ac.text
                    );
                    if (!exists) {
                        mergedComments.push(ac);
                    }
                }

                await Review.updateOne({ _id: review._id }, {
                    $set: { likes: mergedLikes, comments: mergedComments }
                });

                await Activity.updateOne({ _id: act._id }, {
                    $set: { review: review._id }
                });

                console.log('  Success');
            }
        }

        console.log('Migration complete');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
