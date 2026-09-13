from fastapi import APIRouter
from .endpoints import chat, ocr, products, standards, roadmap

router = APIRouter()

router.include_router(chat.router, prefix="/chat", tags=["Chat"])
router.include_router(ocr.router, prefix="/ocr", tags=["OCR"])
router.include_router(products.router, prefix="/products", tags=["Products"])
router.include_router(standards.router, prefix="/standards", tags=["Standards"])
router.include_router(roadmap.router, prefix="/roadmap", tags=["Roadmap"])
