## SSH and Server Access

- SSH provides encrypted remote access to a server.
- SSH client: Linux Mint.
- SSH server (`sshd`): Debian, normally port 22.
- Authentication: private key on the client, public key authorized on the server.
- Never share your private key.
- Disable password authentication after verifying SSH key login.
- `PermitRootLogin no` prevents direct root SSH login.
- UFW controls inbound access.
- VirtualBox NAT port forwarding connects host ports to VM ports.

### Lab Connection

```text
Linux Mint :2222 → Debian :22
```

### Command

```bash
ssh -p 2222 vboxuser@127.0.0.1
```

`127.0.0.1` always refers to the current machine.
