from decimal import Decimal
from typing import Annotated
from pydantic import BaseModel, ConfigDict, Field, StringConstraints

NonEmptyText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]


class ServiceCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    categoryId: int = Field(gt=0, strict=True)
    title: NonEmptyText
    desc: NonEmptyText
    duration: int = Field(ge=30, le=180, strict=True)
    price: Decimal = Field(gt=0, max_digits=12, decimal_places=2, allow_inf_nan=False)


class ServiceResponse(ServiceCreate):
    id: int
