from enum import Enum

from pydantic import BaseModel


class ChangeType(str, Enum):
    """
    The *types* of changes that the agent can perform.
    """

    IMG_ALT = "img_alt"
    IMG_CONTRAST = "img_contrast"
    PAGE_CONTRAST = "page_contrast"
    PAGE_NAVIGATION = "page_navigation"
    PAGE_SKIP_TO_MAIN = "page_skip_to_main"


class Change(str, Enum):
    """
    The *actual* changes that the agent performed.
    """

    IMG_ALT_ADDED = "img_alt_added"
    IMG_ALT_ALTERED = "img_alt_altered"
    IMG_CONTRAST_ALTERED = "img_contrast_altered"
    PAGE_CONTRAST_ALTERED = "page_contrast_altered"
    PAGE_NAVIGATION_ALTERED = "page_navigation_altered"
    PAGE_SKIP_TO_MAIN_ADDED = "page_skip_to_main_added"


class AccessibilityCorrection(BaseModel):
    """
    A correction that the agent has made. This will be returned from the API.
    """

    changeType: Change
    querySelector: str
    replacementHTML: str
    connections: list[int]
    descriptionText: str


class AltimateRequest(BaseModel):
    """
    The format for a request to the Altimate agent.
    """

    html: str
    # The types of checks the agent should perform
    requested_checks: list[ChangeType]
