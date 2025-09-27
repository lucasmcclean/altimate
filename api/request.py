from enum import Enum
from pydantic import BaseModel


class CheckType(str, Enum):
    IMG_ALT = "img_alt"
    IMG_CONTRAST = "img_contrast"
    PAGE_CONTRAST = "page_contrast"
    PAGE_NAVIGATION = "page_navigation"
    PAGE_SKIP_TO_MAIN = "page_skip_to_main"

class AltimateRequest(BaseModel):
    html: str
    requested_checks: list[CheckType]
