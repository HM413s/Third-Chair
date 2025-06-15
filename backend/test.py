# test_asyncio.py
import asyncio
import sys

print(f"Python version: {sys.version}")
print(f"asyncio.to_thread available: {hasattr(asyncio, 'to_thread')}")

if hasattr(asyncio, 'to_thread'):
    print("asyncio.to_thread is available")
else:
    print("asyncio.to_thread is NOT available")
    print(f"asyncio module location: {asyncio.__file__}")