import * as mongoose from 'mongoose';
import {Schema} from 'mongoose';

const accountSchema = new mongoose.Schema(
    {
        _id: {
            type: Schema.Types.ObjectId,
            required: true,
            auto: true,
        },
        name: {type: String, required: true},
        password_hash: {type: String, required: true, select: false,},
        role: {type: String, required: true, enum: ['super_admin', 'school_admin'], default: 'super_admin'},
        created_at: {type: Date, required: true, default: Date.now()},
        last_modified: {type: Date, required: false, default: null},
    },
    {
        methods: {},
    }
);

export type Account = mongoose.InferSchemaType<typeof accountSchema>;
export const Account = mongoose.model('Account', accountSchema);
