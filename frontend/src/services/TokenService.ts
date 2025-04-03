class TokenService {
    // Decode token payload
    private decodeTokenPayload(token: string): Record<string, any> {
        try {
            // Split the token into its parts
            const [, payloadBase64] = token.split('.');

            // Decode the base64 payload
            const decodedPayload = window.atob(
                payloadBase64
                    .replace(/-/g, '+')
                    .replace(/_/g, '/')
                    .padEnd(payloadBase64.length + (4 - (payloadBase64.length % 4)) % 4, '=')
            );

            // Parse the JSON payload
            return JSON.parse(decodedPayload);
        } catch (error) {
            console.error('Error decoding token:', error);
            return {};
        }
    }

    // Check if token is expired
    public isTokenExpired(token: string | null): boolean {
        // If no token is provided, consider it expired
        if (!token) return true;

        try {
            const payload = this.decodeTokenPayload(token);

            // Check expiration time
            const exp = payload.exp;
            if (!exp) return true;

            // Compare current time with expiration time
            return Date.now() >= exp * 1000;
        } catch {
            return true;
        }
    }

    // Extract roles from token
    public getRolesFromToken(token: string | null): string[] {
        // If no token is provided, return empty array
        if (!token) return [];

        try {
            const payload = this.decodeTokenPayload(token);

            // Common fields where roles might be stored
            const roleFields = ['roles', 'role', 'authorities'];

            for (const field of roleFields) {
                if (payload[field]) {
                    // Ensure roles is always an array
                    const roles = Array.isArray(payload[field])
                        ? payload[field]
                        : [payload[field]];

                    // Clean up roles (remove 'ROLE_' prefix if needed)
                    return roles.map((role: string) =>
                        role.startsWith('ROLE_') ? role.substring(5) : role
                    );
                }
            }

            return [];
        } catch (error) {
            console.error('Error extracting roles:', error);
            return [];
        }
    }

    // Get username from token
    public getUsernameFromToken(token: string | null): string | null {
        // If no token is provided, return null
        if (!token) return null;

        try {
            const payload = this.decodeTokenPayload(token);
            return payload.sub || payload.username || null;
        } catch {
            return null;
        }
    }

    // Check if token contains a specific role
    public hasRole(token: string | null, role: string): boolean {
        // If no token is provided, return false
        if (!token) return false;

        const roles = this.getRolesFromToken(token);
        return roles.includes(role);
    }

    // Validate token structure
    public isValidTokenFormat(token: string | null): boolean {
        // Basic JWT token format check
        return !!token && token.split('.').length === 3;
    }
}

export default new TokenService();