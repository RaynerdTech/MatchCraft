import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

// Create handler for GET + POST requests
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
