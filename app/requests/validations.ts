import {CreateClassRoomRequest, TeacherNestedRequest, UpdateClassRoomRequest} from "./classroom.ts";
import {LoginRequest, SignupRequest, UpdateAccountPasswordRequest} from "./account.ts"
import {CreateSchoolRequest, UpdateSchoolRequest} from "./school.ts"
import {CreateStudentRequest, NestedParentRequest, UpdateStudentRequest} from "./student.ts"

export const Validations = {
    CreateStudentRequest,
    UpdateStudentRequest,
    CreateSchoolRequest,
    UpdateSchoolRequest,
    CreateClassRoomRequest,
    UpdateClassRoomRequest,
    SignupRequest,
    LoginRequest,
    UpdateAccountPasswordRequest,
    TeacherNestedRequest,
    NestedParentRequest
}