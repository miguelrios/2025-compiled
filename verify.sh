#!/bin/bash
# Verify integrity of 2025-compiled source files
# Usage: ./verify.sh

set -e

echo "Verifying 2025-compiled source integrity..."
echo ""

if ! command -v shasum &> /dev/null; then
    echo "Error: shasum not found. Install coreutils."
    exit 1
fi

if [ ! -f "SHA256SUMS.txt" ]; then
    echo "Error: SHA256SUMS.txt not found."
    echo "Make sure you're running this from the repo root."
    exit 1
fi

# Verify checksums
if shasum -a 256 -c SHA256SUMS.txt; then
    echo ""
    echo "All files verified successfully."
    exit 0
else
    echo ""
    echo "VERIFICATION FAILED!"
    echo "One or more files have been modified."
    echo ""
    echo "This could mean:"
    echo "  1. You made local changes"
    echo "  2. The repo was compromised"
    echo "  3. Checksums are from a different version"
    echo ""
    echo "If you didn't make changes, DO NOT run this code."
    exit 1
fi
