import os
from typing import Tuple
from fastapi import HTTPException, status

# Default max upload size: 2 Megabytes
MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024  # 2,097,152 bytes

# Known binary magic signatures to immediately reject
MAGIC_SIGNATURES = {
    b"\x89PNG\r\n\x1a\n": "PNG image",
    b"GIF87a": "GIF image",
    b"GIF89a": "GIF image",
    b"\xff\xd8\xff": "JPEG image",
    b"RIFF": "RIFF media",
    b"PK\x03\x04": "ZIP/Archive executable",
    b"MZ": "Windows PE executable",
    b"\x7fELF": "Linux ELF binary",
    b"%PDF": "PDF document",
}


def sanitize_filename(filename: str | None) -> str:
    """Safely extracts the basename of the file to prevent directory traversal."""
    if not filename:
        return "unnamed.css"
    # Take only the base filename
    base = os.path.basename(filename).strip()
    return base if base else "unnamed.css"


def validate_css_file(filename: str | None, raw_bytes: bytes, max_size: int = MAX_FILE_SIZE_BYTES) -> Tuple[str, str]:
    """
    Validates uploaded file size, extension, binary signatures, and text encoding.
    Returns: (sanitized_filename, decoded_css_text)
    Raises: HTTPException with 400 or 413 status code.
    """
    safe_filename = sanitize_filename(filename)

    # 1. Enforce file size limit
    actual_size = len(raw_bytes)
    if actual_size > max_size:
        max_mb = max_size / (1024 * 1024)
        actual_mb = actual_size / (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {max_mb:.1f} MB (Received: {actual_mb:.2f} MB)."
        )

    # 2. Check file extension
    _, ext = os.path.splitext(safe_filename)
    if ext.lower() not in [".css"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file extension '{ext}'. Only .css files are supported."
        )

    # 3. Check for binary magic headers
    for magic, desc in MAGIC_SIGNATURES.items():
        if raw_bytes.startswith(magic):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Uploaded file appears to be a binary file ({desc}), not a CSS stylesheet."
            )

    # 4. Check for binary null bytes
    if b"\x00" in raw_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file contains binary null bytes (\\x00). Only valid text CSS stylesheets are accepted."
        )

    # 5. Decode text safely
    try:
        decoded_text = raw_bytes.decode("utf-8")
    except UnicodeDecodeError:
        try:
            # Fallback to latin-1 encoding if UTF-8 fails
            decoded_text = raw_bytes.decode("latin-1")
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File encoding could not be decoded. Please provide a UTF-8 encoded CSS file."
            )

    return safe_filename, decoded_text
