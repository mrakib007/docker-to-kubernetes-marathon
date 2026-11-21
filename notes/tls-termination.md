## TLS Termination

- TCP connection is established first.
- TLS handshake authenticates the server and establishes session keys.
- Certificate contains server identity and public key.
- CA signature helps verify certificate authenticity.
- TLS uses symmetric encryption for application data.
- HTTPS = HTTP over TLS.

### TLS Termination Flow

```text
Browser --HTTPS--> Nginx --HTTP--> Node.js API
```

Nginx handles encryption/decryption.  
The API receives HTTP on the internal Docker network.

- Self-signed certificate: Useful for labs.
- Trusted CA certificate: Normally needed for public websites.
- Private keys must never be committed to Git.
