import * as mongoose from 'mongoose';
import {Schema} from 'mongoose';
import {SchoolInfo} from "./school.ts";

const teacherSchema = new mongoose.Schema({
    name: {type: String, required: true},
    hired_at: {type: Date, required: true},
    birth_date: {type: Date, required: true},
    identification_number: {type: String, required: true},
    phone_number: {type: String, required: true},
    qualifications: [{type: String, required: false}],
    subject: {type: String, required: true},
}, {_id: false});

const classRoomSchema = new mongoose.Schema(
    {
        _id: {
            type: Schema.Types.ObjectId,
            required: true,
            auto: true,
        }, name: {type: String, required: true},
        capacity: {type: Number, required: true},
        teacher: {type: teacherSchema, required: true},
        major_subject: {type: String, required: true},
        school: {type: Schema.Types.ObjectId, required: true, ref: "SchoolInfo"},
        school_year: {type: Number, required: true},
        created_at: {type: Date, required: true, default: Date.now()},
        last_modified: {type: Date, required: false, default: null},
        created_by: {type: Schema.Types.ObjectId, ref: 'Account'},
        last_updated_by: {type: Schema.Types.ObjectId, ref: 'Account', required: false}
    },
    {
        methods: {},
    }
);


export type ClassRoom = mongoose.InferSchemaType<typeof classRoomSchema>;
export const ClassRoom = mongoose.model('ClassRoom', classRoomSchema);
