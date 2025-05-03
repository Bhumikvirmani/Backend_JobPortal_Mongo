import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
    try {
        console.log("Cookies received:", req.cookies);
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                message: "User not authenticated - No token found in cookies",
                success: false,
            })
        }

        try {
            const decode = await jwt.verify(token, process.env.SECRET_KEY);
            if(!decode){
                return res.status(401).json({
                    message:"Invalid token",
                    success:false
                })
            };
            req.id = decode.userId;
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