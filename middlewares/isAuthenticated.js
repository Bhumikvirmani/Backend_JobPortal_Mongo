import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
    try {
        console.log("Request URL:", req.originalUrl);
        console.log("Request method:", req.method);
        console.log("Request headers:", JSON.stringify(req.headers, null, 2));
        console.log("Cookies received:", req.cookies);
        console.log("Query params:", req.query);

        // First try to get token from cookies
        let token = req.cookies.token;
        let tokenSource = "cookie";

        // If no token in cookies, check Authorization header
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
                tokenSource = "authorization header";
                console.log("Using token from Authorization header:", token.substring(0, 10) + "...");
            }
        }

        // If still no token, check query parameter (not recommended for production, but useful for debugging)
        if (!token && req.query.token) {
            token = req.query.token;
            tokenSource = "query parameter";
            console.log("Using token from query parameter:", token.substring(0, 10) + "...");
        }

        if (!token) {
            console.log("No token found in any location");
            return res.status(401).json({
                message: "User not authenticated - No token found in cookies, headers, or query parameters",
                success: false,
            });
        }

        console.log(`Token found in ${tokenSource}. Length: ${token.length}`);

        try {
            console.log("SECRET_KEY exists:", !!process.env.SECRET_KEY);

            // Check if token is a manual token (for debugging only)
            if (token.startsWith('manual_')) {
                console.log("Manual token detected, extracting user ID");
                // Format: manual_USER_ID_TIMESTAMP
                const parts = token.split('_');
                if (parts.length >= 2) {
                    const userId = parts[1];
                    console.log("User ID extracted from manual token:", userId);
                    req.id = userId;
                    next();
                    return;
                } else {
                    console.log("Invalid manual token format");
                    return res.status(401).json({
                        message: "Invalid manual token format",
                        success: false
                    });
                }
            }

            // Normal JWT verification
            const decode = jwt.verify(token, process.env.SECRET_KEY);
            console.log("Token decoded successfully:", decode);

            if(!decode){
                console.log("Decode is falsy even though verification didn't throw");
                return res.status(401).json({
                    message:"Invalid token",
                    success:false
                });
            }

            req.id = decode.userId;
            console.log("User ID extracted from token:", req.id);
            next();
        } catch (jwtError) {
            console.log("JWT verification error:", jwtError);
            return res.status(401).json({
                message: "Invalid or expired token",
                success: false
            });
        }
    } catch (error) {
        console.log("Authentication error:", error);
        return res.status(500).json({
            message: "Server error during authentication",
            success: false
        });
    }
}
export default isAuthenticated;