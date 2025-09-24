import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Teacher from "@/models/Teacher";
import Student from "@/models/Student";
import dbConnect from "@/lib/db";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await dbConnect();

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        // 🔹 Check Teacher
        let user = await Teacher.findOne({ email: credentials.email });
        if (user && (await bcrypt.compare(credentials.password, user.password))) {
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: "teacher",
          };
        }

        // 🔹 Check Student
        user = await Student.findOne({ email: credentials.email });
        if (user && (await bcrypt.compare(credentials.password, user.password))) {
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: "student",
          };
        }

        // ❌ No match
        throw new Error("Invalid credentials");
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login", // student & teacher login page
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
