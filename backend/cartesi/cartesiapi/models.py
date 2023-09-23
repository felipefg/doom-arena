from pydantic import BaseModel


class License(BaseModel):
    name: str
    identifier: str | None = None
    url: str | None = None


class Contact(BaseModel):
    name: str | None = None
    url: str | None = None
    email: str | None = None


class Info(BaseModel):
    title: str
    version: str
    summary: str | None = None
    description: str | None = None
    termsOfService: str | None = None
    license: License | None = None
    contact: Contact | None = None


class ExternalDocs(BaseModel):
    url: str
    description: str | None = None


class Operation(BaseModel):
    operationId: str
    requestType: str
    namespace: str = ""
    summary: str | None = None
    description: str | None = None
    externalDocs: ExternalDocs | None = None
    tags: list[str] | None = None
    # TODO:
    # input
    # output
    # sender


class CartesiAPI(BaseModel):
    cartesiapi: str
    info: Info
    operations: list[Operation]
