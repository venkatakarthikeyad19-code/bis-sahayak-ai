import pytest
from httpx import AsyncClient, ASGITransport
from main import app

@pytest.mark.asyncio
async def test_roadmap_lifecycle_and_dependencies():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as client:
        # 1. GET roadmap for Laptop Test Unit
        res = await client.get("/api/roadmap/?product=Laptop%20Test%20Unit")
        assert res.status_code == 200
        data = res.json()
        assert "steps" in data
        assert len(data["steps"]) == 6

        steps_by_num = {s["step_number"]: s for s in data["steps"]}
        step_4_id = steps_by_num[4]["id"]
        step_5_id = steps_by_num[5]["id"]

        # Ensure starting state for test isolation
        await client.patch(f"/api/roadmap/{step_5_id}", json={"status": "pending"})
        await client.patch(f"/api/roadmap/{step_4_id}", json={"status": "pending"})

        # Fetch fresh state
        res = await client.get("/api/roadmap/?product=Laptop%20Test%20Unit")
        data = res.json()
        steps_by_num = {s["step_number"]: s for s in data["steps"]}

        assert steps_by_num[1]["status"] == "completed"
        assert steps_by_num[2]["status"] == "completed"
        assert steps_by_num[3]["status"] == "warning"
        assert steps_by_num[4]["status"] == "pending"

        step_4_id = steps_by_num[4]["id"]
        step_5_id = steps_by_num[5]["id"]

        # 2. Try to complete Step 5 before Step 4 -> Expect 400 dependency violation
        bad_res = await client.patch(f"/api/roadmap/{step_5_id}", json={"status": "completed"})
        assert bad_res.status_code == 400
        assert "Complete the previous compliance requirement" in bad_res.json()["detail"]

        # 3. Complete Step 4 (Laboratory Testing) -> Should succeed
        step_4_res = await client.patch(f"/api/roadmap/{step_4_id}", json={"status": "completed"})
        assert step_4_res.status_code == 200
        assert step_4_res.json()["status"] == "completed"
        assert step_4_res.json()["completed_at"] is not None

        # 4. Now Step 5 can be completed
        step_5_res = await client.patch(f"/api/roadmap/{step_5_id}", json={"status": "completed"})
        assert step_5_res.status_code == 200
        assert step_5_res.json()["status"] == "completed"

        # 5. Re-evaluate compliance -> user completed progress for Step 4 & 5 should be preserved!
        eval_res = await client.post("/api/roadmap/evaluate", json={"product": "Laptop Test Unit"})
        assert eval_res.status_code == 200
        eval_data = eval_res.json()
        eval_steps_by_num = {s["step_number"]: s for s in eval_data["steps"]}
        assert eval_steps_by_num[4]["status"] == "completed"
        assert eval_steps_by_num[5]["status"] == "completed"
