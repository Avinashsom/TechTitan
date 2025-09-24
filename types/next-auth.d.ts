import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;  // add id here
  }

  interface Session {
    user?: User; // user remains User type with id added
  }
}
