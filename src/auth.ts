import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import "@/types/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID,
            clientSecret:
                process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET,
        }),
    ],
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    callbacks: {
        jwt({ token, user }) {
            if (user?.id) {
                token.id = user.id;
            }
            return token;
        },
        session({ session, token }) {
            if (session.user) {
                session.user.id = (token.id as string) || (token.sub as string);
            }
            return session;
        },
    },
});
