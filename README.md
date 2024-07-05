# school_crud_api_test

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run --watch index.ts
```


# Submission Details

## How to use with Postman
Import `SCHOOL.postman_collection.json` with Postman

## Stack Used:
- [bun](https://bun.sh/) js runtime (compatible 100% with NodeJS)
- [Hono](https://hono.dev/) Web application framework
- [Zod](https://zod.dev/) for Http requests objects validations
- [mongoose](https://mongoosejs.com/) MongoDB ORM
- [hono_jwt_auth](https://gitlab.com/ChristianSirolli/hono-jwt-auth-middleware) Hono JWT Auth Middleware
- Hosted on my personally owned Windows Server 2022 VPS

Local Endpoint: [`http://localhost:12000`](http://localhost:12000)

Public Endpoint: [`https://madrasacloud.com/school_api_test`](https://madrasacloud.com/school_api_test)

## The Challenge:
(School Management API) the following challenge must use the following repo as its boilerplate https://lnkd.in/d59uSwqS. do not change the structure of the boilerplate, understand it and follow its structure.

Your task is to create a school management application that allows users to perform basic CRUD operations on three main entities: School, Classroom, and Student. The application should provide APIs that enable the management of these entities. Superadmins will have the ability to add schools, while school admins can manage classrooms and students within their respective schools.

Guidelines and Considerations:

1.⁠ ⁠You can only use JS

2.⁠ ⁠Use a database (MongoDB/Redis) to store the school, classroom, and student data.

3.⁠ ⁠Ensure proper validation and error handling is implemented for the API endpoints.

4.⁠ ⁠You can design the database schema according to your preference but make sure to include the necessary relationships between the entities.

5.⁠ ⁠Provide clear documentation for the API endpoints, including input and output formats.

6.⁠ ⁠Test the application thoroughly to ensure correctness and robustness.

7.⁠ ⁠Implement authentication and authorization mechanisms to ensure only authorized users can access specific endpoints.
