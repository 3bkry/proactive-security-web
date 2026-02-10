
import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev",
});

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/servers/:path*",
        "/logs/:path*",
        "/ai/:path*",
        "/incidents/:path*",
        "/terminal/:path*",
        "/settings/:path*",
        "/api/dashboard/:path*",
        "/api/teams/:path*"
    ]
};
