from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_products():
    return [{"id": 1, "name": "Electric Kettle"}, {"id": 2, "name": "Pressure Cooker"}]
