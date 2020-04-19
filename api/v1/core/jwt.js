const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

class JWTHandler {

    // keys for access token
    static _privateKey;
    static _publicKey;

    // keys for refresh token
    static _RprivateKey;
    static _RpublicKey;

    constructor() {
        this._fetchKeys();
    }

    async _fetchKeys() {
        this._privateKey = fs.readFileSync(path.join(__dirname, '../../../keys/private.pem'), 'utf8')
        this._publicKey = fs.readFileSync(path.join(__dirname, '../../../keys/public.pem'), 'utf8')
        this._RprivateKey = fs.readFileSync(path.join(__dirname, '../../../keys/privater.pem'), 'utf8')
        this._RpublicKey = fs.readFileSync(path.join(__dirname, '../../../keys/publicr.pem'), 'utf8')
    }

    async genAccessToken(email) {
        if (!this._privateKey) {
            this._privateKey = await fs.readFile(path.join(__dirname, '../../../keys/private.pem'), 'utf8');
        }
        return await this._genJWT(this._payloadAccessToken(email), this._privateKey, '1d');
    }

    async genRefreshToken(user_id) {
        if (!this._RprivateKey) {
            this._RprivateKey = fs.readFileSync(path.join(__dirname, '../../../keys/privater.pem'), 'utf8')
        }
        return await this._genJWT(this._payloadRefreshToken(user_id), this._RprivateKey, '30d');
    }

    verifyAccessToken(token) {
        return this._decodeJWT(token, this._publicKey);
    }

    verifyRefreshToken(token) {
        return this._decodeJWT(token, this._RpublicKey);
    }

    _decodeJWT(token, cert) {
        try {
            return { valid: true, data: jwt.verify(token, cert) };
        } catch (err) {
            if (err.name.includes('TokenExpiredError')) {
                return { valid: false, error: 'Access-Token Expired' };
            }
            return { valid: false, error: err };
        }
    }

    async _genJWT(payload, cert, expiresIn) {
        return await jwt.sign(payload, cert, { expiresIn: expiresIn, algorithm: 'RS256' });
    }

    _payloadAccessToken(email) {
        return {
            aud: process.env.TOKEN_AUDIENCE,
            sub: process.env.TOKEN_SUBJECT + '_AccessToken',
            iss: process.env.TOKEN_ISSUER,
            email: email,
        };
    }

    _payloadRefreshToken(user_id) {
        return {
            aud: process.env.TOKEN_AUDIENCE,
            sub: process.env.TOKEN_SUBJECT + '_RefreshToken',
            iss: process.env.TOKEN_ISSUER,
            user_id: user_id,
        };
    }

}

module.exports = JWTHandler;