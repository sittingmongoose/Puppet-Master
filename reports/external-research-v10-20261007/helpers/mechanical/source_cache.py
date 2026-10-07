"""M04/M05: exact public bytes only. Cold fetch and explicit pinned warm read."""
import argparse
import http.client
import ipaddress
import re
import socket
import time
from urllib.parse import urlsplit, urljoin
from pathlib import Path
from common import MAX_FILE, digest, encoded, read, scoped, write_new, object_put, now, emit


def fetch_bytes(url, timeout=30, limit=MAX_FILE, stats=None):
    """HTTPS only, no credentials/proxies/cookies; connect to validated public IP."""
    deadline = time.monotonic() + timeout
    original = url
    for _ in range(6):
        u = urlsplit(url)
        if (u.scheme != "https" or not u.hostname or u.username or u.password
                or u.query or u.fragment or u.port not in (None, 443)):
            raise ValueError("use public HTTPS URL, port 443, without credentials/query/fragment")
        addresses = socket.getaddrinfo(u.hostname, 443, type=socket.SOCK_STREAM)
        if not addresses or any(not ipaddress.ip_address(a[4][0]).is_global for a in addresses):
            raise ValueError("non-public address rejected")
        remaining = deadline - time.monotonic()
        if remaining <= 0:
            raise TimeoutError("source deadline")
        conn = http.client.HTTPSConnection(u.hostname, timeout=remaining)
        # Keep TLS SNI/certificate validation for hostname, pin TCP to checked address.
        address = addresses[0][4][0]
        conn._create_connection = lambda target, timeout, source_address=None: socket.create_connection(
            (address, 443), timeout, source_address)
        try:
            if stats is not None:
                stats["network_requests"] += 1
            conn.request("GET", u.path or "/", headers={"Accept-Encoding": "identity",
                                                       "User-Agent": "ER10-public-bytes/1"})
            response = conn.getresponse()
            if response.status in (301, 302, 303, 307, 308):
                url = urljoin(url, response.getheader("Location") or "")
                continue
            if response.status != 200:
                raise ValueError(f"HTTP status {response.status}")
            if response.getheader("Content-Encoding", "identity") != "identity":
                raise ValueError("encoded response rejected; require exact identity bytes")
            body = bytearray()
            while True:
                if response.isclosed():
                    break
                remaining = deadline - time.monotonic()
                if remaining <= 0:
                    raise TimeoutError("source deadline")
                # response owns the socket after Connection: close.
                response.fp.raw._sock.settimeout(remaining)
                chunk = response.read1(min(65536, limit + 1 - len(body)))
                if not chunk:
                    break
                body.extend(chunk)
                if len(body) > limit:
                    raise ValueError("source exceeds byte limit")
            headers = {k: response.getheader(k) for k in
                       ("Content-Type", "ETag", "Last-Modified", "Content-Length")}
            declared = headers["Content-Length"]
            if declared is not None and int(declared) != len(body):
                raise ValueError("incomplete response body")
            return bytes(body), url, headers
        finally:
            conn.close()
    raise ValueError(f"too many redirects from {original}")


def extract(raw, lines):
    if lines is None:
        return raw, {"version": "identity-v1", "range": None}
    a, b = map(int, lines.split(":"))
    raw.decode("utf-8", errors="strict")
    parts = raw.splitlines(keepends=True)
    if not 1 <= a <= b <= len(parts):
        raise ValueError("invalid inclusive line range")
    return b"".join(parts[a-1:b]), {"version": "utf8-lines-v1", "range": [a, b]}


def verify_record(cache, record_id):
    if not re.fullmatch(r"[0-9a-f]{64}", record_id):
        raise ValueError("record id must be SHA-256")
    data = read(scoped(cache, "records/" + record_id + ".json"))
    if digest(data) != record_id:
        raise ValueError("record hash mismatch")
    import json
    record = json.loads(data)
    for key in ("raw", "extracted"):
        obj = record[key]
        body = read(scoped(cache, "objects/" + obj["sha256"]))
        if digest(body) != obj["sha256"] or len(body) != obj["bytes"]:
            raise ValueError("object hash/size mismatch")
    return record


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("operation", choices=["fetch", "read"])
    p.add_argument("source", help="exact URL for fetch; record SHA-256 for read")
    p.add_argument("--cache", type=Path, required=True)
    p.add_argument("--receipt", type=Path, required=True, help="new operation receipt, never overwritten")
    p.add_argument("--commit", help="optional full 40-hex source commit label")
    p.add_argument("--lines", help="inclusive UTF-8 line range START:END")
    p.add_argument("--expect-sha256", help="optional expected RAW byte hash for fetch")
    args = p.parse_args()
    if args.receipt.exists():
        p.error("receipt already exists")
    started, clock = now(), time.monotonic()
    safe_source = args.source
    if args.operation == "fetch":
        try:
            supplied = urlsplit(args.source)
            if supplied.username or supplied.password or supplied.query or supplied.fragment:
                safe_source = "rejected URL with credential/query/fragment (not recorded)"
        except ValueError:
            safe_source = "invalid URL (not recorded)"
    elif not re.fullmatch(r"[0-9a-f]{64}", args.source):
        safe_source = "invalid record identity (not recorded)"
    receipt = {"operation": args.operation, "source": safe_source, "started_at": started,
               "cache_mode": "cold" if args.operation == "fetch" else "warm",
               "network_requests": 0, "status": "error"}
    try:
        args.cache.mkdir(parents=True, exist_ok=True)
        if args.operation == "fetch":
            if args.commit and not re.fullmatch(r"[0-9a-fA-F]{40}", args.commit):
                raise ValueError("commit must be full 40-hex")
            raw, final_url, headers = fetch_bytes(args.source, stats=receipt)
            if args.expect_sha256 and digest(raw) != args.expect_sha256:
                raise ValueError("expected raw hash mismatch")
            excerpt, extraction = extract(raw, args.lines)
            record = {"original_url": args.source, "retrieved_url": final_url,
                      "commit": args.commit, "commit_binding": "caller_label_unverified" if args.commit else None,
                      "retrieved_at": now(), "headers": headers, "extraction": extraction,
                      "raw": {"sha256": object_put(args.cache, raw), "bytes": len(raw)},
                      "extracted": {"sha256": object_put(args.cache, excerpt), "bytes": len(excerpt)}}
            data = encoded(record)
            record_id = digest(data)
            write_new(scoped(args.cache, "records/" + record_id + ".json"), data, readonly=True)
        else:
            if args.commit or args.lines or args.expect_sha256:
                raise ValueError("warm read accepts pinned record only, no reinterpretation")
            record_id = args.source
            record = verify_record(args.cache, record_id)
        receipt.update(status="ok", record_id=record_id, record=record)
    except Exception as exc:
        receipt["error"] = f"{type(exc).__name__}: {exc}"
    receipt.update(ended_at=now(), elapsed_seconds=time.monotonic()-clock)
    write_new(args.receipt, encoded(receipt))
    emit(receipt)
    return 0 if receipt["status"] == "ok" else 1


if __name__ == "__main__":
    raise SystemExit(main())
