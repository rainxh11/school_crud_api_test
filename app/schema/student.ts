import * as mongoose from 'mongoose';
import {Schema} from 'mongoose';

const parentSchema = new mongoose.Schema({
    full_name: {type: String, required: true},
    arabic_name: {type: String, required: true},
    birth_date: {type: Date, required: true},
    phone_number: {type: String, required: true},
    address: {type: String, required: true},
    identification_number: {type: String, required: true},
    parenthood_type: {
        type: String,
        required: true,
        enum: ["Guardian", "Father", "Mother", "Adult_Sibling", "Legal_Guardian"],
        default: "Legal_Guardian"
    },
}, {_id: false})

const studentSchema = new mongoose.Schema(
    {
        _id: {
            type: Schema.Types.ObjectId,
            required: true,
            auto: true,
        },
        full_name: {type: String, required: true},
        arabic_name: {type: String, required: true},
        birth_date: {type: Date, required: true},
        phone_number: {type: String, required: true},
        address: {type: String, required: true},
        parents: [{type: parentSchema}],
        classes: [{type: mongoose.Types.ObjectId, required: false, ref: "ClassRoom"}],
        created_at: {type: Date, required: true, default: Date.now()},
        last_modified: {type: Date, required: false, default: null},
        created_by: {type: Schema.Types.ObjectId, ref: 'Account'},
        last_updated_by: {type: Schema.Types.ObjectId, ref: 'Account', required: false}
    },
    {
        methods: {},
    }
);


export type Student = mongoose.InferSchemaType<typeof studentSchema>;
export const Student = mongoose.model('Student', studentSchema);
