from enum import Enum
from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agents.corrections_agent import parallel_agent


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CheckType(str, Enum):
    IMG_ALT = "img_alt"
    IMG_CONTRAST = "img_contrast"
    PAGE_CONTRAST = "page_contrast"
    PAGE_NAVIGATION = "page_navigation"
    PAGE_SKIP_TO_MAIN = "page_skip_to_main"

class AltimateRequest(BaseModel):
    html: str
    requested_checks: list[CheckType]

@app.post("/")
def get_data(request: AltimateRequest):
    corrections_agent = parallel_agent(request.requested_checks)
