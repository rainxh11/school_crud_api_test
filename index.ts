import * as mongoose from 'mongoose';
import {serverApp} from "./app/routes"

const db = await mongoose.connect('mongodb://127.0.0.1:27017/SchoolManagementDemo');

export default {port: 12000, fetch: serverApp.fetch, host:'0.0.0.0'}