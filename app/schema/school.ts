import * as mongoose from 'mongoose';
import {Schema} from 'mongoose';

const schoolSchema = new mongoose.Schema(
    {
        _id: {
            type: Schema.Types.ObjectId,
            required: true,
            auto: true,
        },
        name: {type: String, required: true},
        director_name: {type: String, required: false},
        address: {type: String, required: true},
        phone_number: {type: String, required: true},
        created_at: {type: Date, required: true, default: Date.now()},
        last_modified: {type: Date, required: false, default: null},
        created_by: {type: Schema.Types.ObjectId, ref: 'Account'},
        last_updated_by: {type: Schema.Types.ObjectId, ref: 'Account', required: false}
    },
    {
        methods: {},
    }
);

export type SchoolInfo = mongoose.InferSchemaType<typeof schoolSchema>;
export const SchoolInfo = mongoose.model('SchoolInfo', schoolSchema);