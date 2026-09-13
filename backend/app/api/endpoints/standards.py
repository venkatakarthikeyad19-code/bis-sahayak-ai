from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_standards():
    return [{"id": "IS_302", "title": "Safety of household and similar electrical appliances"}]
