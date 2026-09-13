import pytest
from httpx import AsyncClient, ASGITransport
from main import app

@pytest.mark.asyncio
async def test_chat_endpoint():
    payload = {"query": "What is an electric kettle?", "history": []}
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as client:
        response = await client.post("/api/chat/", json=payload)
        assert response.status_code == 200
        json_data = response.json()
        # basic sanity checks on expected keys
        for key in ["answer", "product_profile", "readiness_roadmap", "evidence"]:
            assert key in json_data
